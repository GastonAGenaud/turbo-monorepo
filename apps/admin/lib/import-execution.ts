import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { refreshImportedImages, runAllImports, runImport } from "@ggseeds/scrapers";
import type { ProductSource } from "@ggseeds/shared";

type ImportableSource = Exclude<ProductSource, "MANUAL">;
export type ImportExecutionSource = ImportableSource | "ALL";
export type ImportExecutionAction = "IMPORT" | "REFRESH_IMAGES";

function importCliArg(source: ImportExecutionSource): "all" | "merlin" | "dutch" {
  if (source === "ALL") {
    return "all";
  }

  return source === "MERLINGROW" ? "merlin" : "dutch";
}

function getInlineTaskLabel(action: ImportExecutionAction) {
  return action === "REFRESH_IMAGES" ? "refresh-imagenes" : "import";
}

function getEcsCommand(source: ImportExecutionSource, action: ImportExecutionAction) {
  if (action === "REFRESH_IMAGES") {
    if (source === "ALL") {
      return ["pnpm", "import:images"];
    }

    return ["pnpm", source === "MERLINGROW" ? "import:images:merlin" : "import:images:dutch"];
  }

  return ["pnpm", "import:" + importCliArg(source)];
}

function getExecutionMode() {
  return process.env.IMPORT_EXECUTION_MODE === "ecs" ? "ecs" : "inline";
}

function getEcsConfig() {
  const cluster = process.env.AWS_ECS_CLUSTER_ARN;
  const taskDefinition = process.env.AWS_ECS_TASK_DEFINITION_ARN;
  const containerName = process.env.AWS_ECS_CONTAINER_NAME ?? "ggseeds-scraper";
  const subnets = (process.env.AWS_ECS_SUBNET_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const securityGroups = (process.env.AWS_ECS_SECURITY_GROUP_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!cluster || !taskDefinition || subnets.length === 0 || securityGroups.length === 0) {
    throw new Error("Falta configuración ECS para ejecutar imports remotos");
  }

  return { cluster, taskDefinition, containerName, subnets, securityGroups };
}

async function dispatchEcsImport(source: ImportExecutionSource, action: ImportExecutionAction) {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("Falta AWS_REGION para ejecutar imports remotos");
  }

  const ecs = new ECSClient({ region });
  const cfg = getEcsConfig();
  const response = await ecs.send(
    new RunTaskCommand({
      cluster: cfg.cluster,
      taskDefinition: cfg.taskDefinition,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: cfg.subnets,
          securityGroups: cfg.securityGroups,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: cfg.containerName,
            command: getEcsCommand(source, action),
          },
        ],
      },
    }),
  );

  const taskArn = response.tasks?.[0]?.taskArn;
  if (!taskArn) {
    throw new Error("AWS ECS no devolvió task ARN para el import");
  }

  return {
    ok: true,
    mode: "ecs" as const,
    taskArn,
    source,
    action,
  };
}

export async function executeImport(source: ImportExecutionSource, action: ImportExecutionAction) {
  if (getExecutionMode() === "ecs") {
    return dispatchEcsImport(source, action);
  }

  if (action === "REFRESH_IMAGES") {
    const result = await refreshImportedImages(source);
    return {
      ok: true,
      mode: "inline" as const,
      source,
      action,
      task: getInlineTaskLabel(action),
      result,
    };
  }

  if (source === "ALL") {
    const result = await runAllImports();
    return {
      ok: true,
      mode: "inline" as const,
      source,
      action,
      task: getInlineTaskLabel(action),
      result,
    };
  }

  const result = await runImport(source);
  return {
    ok: true,
    mode: "inline" as const,
    source,
    action,
    task: getInlineTaskLabel(action),
    result,
  };
}

export function currentImportExecutionMode() {
  return getExecutionMode();
}
