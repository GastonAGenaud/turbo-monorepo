import pLimit from "p-limit";

import { db, upsertImportedProduct } from "@ggseeds/db";
import { logger } from "@ggseeds/shared";
import type { ProductSource } from "@ggseeds/shared";

import { scraperConfig } from "./config";
import { scrapeDutchPassion } from "./adapters/dutchpassion";
import { scrapeMerlinGrow } from "./adapters/merlingrow";

export type ImportableSource = Exclude<ProductSource, "MANUAL">;

export async function runImport(source: ImportableSource) {
  const start = Date.now();

  const run = await db.importRun.create({
    data: {
      source: source as any,
      status: "SUCCESS" as any,
      logs: {
        startedAt: new Date().toISOString(),
      },
    },
  });

  const setting = await db.setting.findUnique({ where: { key: "defaultMarkupPercent" } });
  const markupPercent = Number(setting?.value ?? process.env.MARKUP_PERCENT_DEFAULT ?? 15);

  const cfg = scraperConfig();
  const limit = pLimit(cfg.concurrency);

  const failures: Array<{ externalId?: string; message: string; rawPayload?: unknown }> = [];
  let created = 0;
  let updated = 0;

  try {
    const items =
      source === "MERLINGROW"
        ? await scrapeMerlinGrow()
        : source === "DUTCHPASSION"
          ? await scrapeDutchPassion()
          : [];

    await Promise.all(
      items.map((item) =>
        limit(async () => {
          try {
            const result = await upsertImportedProduct(item, markupPercent);
            if (result === "created") {
              created += 1;
            } else {
              updated += 1;
            }
          } catch (error) {
            failures.push({
              externalId: item.externalId,
              message: error instanceof Error ? error.message : "Error inesperado",
              rawPayload: item,
            });
          }
        }),
      ),
    );

    const finishedAt = new Date();
    const durationMs = Date.now() - start;
    const status = failures.length === 0 ? "SUCCESS" : "PARTIAL_SUCCESS";

    await db.importRun.update({
      where: { id: run.id },
      data: {
        finishedAt,
        durationMs,
        created,
        updated,
        failed: failures.length,
        status,
        logs: {
          startedAt: run.startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          itemCount: items.length,
          concurrency: cfg.concurrency,
          retries: cfg.retries,
        },
        itemErrors: {
          create: failures.map((err) => ({
            externalId: err.externalId,
            message: err.message,
            rawPayload: err.rawPayload ? JSON.parse(JSON.stringify(err.rawPayload)) : undefined,
          })),
        },
      },
    });

    logger.info({ source, created, updated, failed: failures.length }, "Import finalizado");
    return { runId: run.id, created, updated, failed: failures.length, durationMs };
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : "Error fatal de import";

    await db.importRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs,
        status: "FAILED" as any,
        failed: failures.length + 1,
        logs: {
          error: message,
        },
      },
    });

    logger.error({ source, error }, "Import fallido");
    throw error;
  }
}

export async function runAllImports() {
  const merlin = await runImport("MERLINGROW");
  const dutch = await runImport("DUTCHPASSION");
  return { merlin, dutch };
}
