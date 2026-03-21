import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { ImportActions } from "../../components/import-actions";
import { requireAdminSession } from "../../lib/admin-session";
import { currentImportExecutionMode } from "../../lib/import-execution";

function statusVariant(status: string) {
  if (status === "SUCCESS") {
    return "default";
  }

  if (status === "PARTIAL_SUCCESS") {
    return "warning";
  }

  return "danger";
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) {
    return "-";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds = Math.round(durationMs / 100) / 10;
  return `${seconds} s`;
}

export default async function ImportsPage() {
  await requireAdminSession();
  const executionMode = currentImportExecutionMode();

  const runs = await db.importRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: {
      itemErrors: {
        take: 5,
      },
    },
  });

  const completedRuns = runs.filter((run) => run.finishedAt);
  const runningRuns = runs.filter((run) => !run.finishedAt);
  const lastRun = runs[0] ?? null;
  const successCount = completedRuns.filter((run) => run.status === "SUCCESS").length;
  const failureCount = completedRuns.filter((run) => run.status === "FAILED").length;
  const partialCount = completedRuns.filter((run) => run.status === "PARTIAL_SUCCESS").length;
  const avgDurationMs =
    completedRuns.length > 0
      ? Math.round(completedRuns.reduce((total, run) => total + (run.durationMs ?? 0), 0) / completedRuns.length)
      : 0;
  const latestBySource = {
    MERLINGROW: runs.find((run) => run.source === "MERLINGROW") ?? null,
    DUTCHPASSION: runs.find((run) => run.source === "DUTCHPASSION") ?? null,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="ETL"
        title="Importador y refresh de imágenes"
        description={`Modo actual: ${executionMode === "ecs" ? "AWS ECS remoto recomendado para producción." : "ejecución inline local."} Revisá runs, errores y estado por fuente sin salir del panel.`}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={executionMode === "ecs" ? "default" : "warning"}>{executionMode === "ecs" ? "ECS remoto" : "Inline local"}</Badge>
          <Badge variant={runningRuns.length > 0 ? "warning" : "outline"}>
            {runningRuns.length > 0 ? `${runningRuns.length} run(s) en curso` : "Sin runs en curso"}
          </Badge>
          {lastRun ? <Badge variant={statusVariant(lastRun.status)}>{lastRun.source} · {lastRun.status}</Badge> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardDescription>Último run</CardDescription>
            <CardTitle>{lastRun ? lastRun.source : "Sin datos"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant={lastRun ? statusVariant(lastRun.status) : "outline"}>{lastRun?.status ?? "N/A"}</Badge>
            <p className="text-[color:var(--muted)]">{lastRun ? lastRun.startedAt.toLocaleString("es-AR") : "Todavía no hay ejecuciones registradas."}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardDescription>Resumen reciente</CardDescription>
            <CardTitle>{completedRuns.length} runs finalizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[color:var(--muted)]">
            <p>OK: {successCount}</p>
            <p>Parciales: {partialCount}</p>
            <p>Fallidos: {failureCount}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardDescription>Duración media</CardDescription>
            <CardTitle>{formatDuration(avgDurationMs)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--muted)]">
            Promedio calculado sobre los últimos {completedRuns.length} runs finalizados.
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardDescription>Últimas fuentes</CardDescription>
            <CardTitle className="text-base">Merlin y Dutch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>MerlinGrow</span>
              <Badge variant={latestBySource.MERLINGROW ? statusVariant(latestBySource.MERLINGROW.status) : "outline"}>
                {latestBySource.MERLINGROW?.status ?? "Sin datos"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Dutch Passion</span>
              <Badge variant={latestBySource.DUTCHPASSION ? statusVariant(latestBySource.DUTCHPASSION.status) : "outline"}>
                {latestBySource.DUTCHPASSION?.status ?? "Sin datos"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Ejecución manual</CardTitle>
          <CardDescription>
            Corré imports completos o refresh de imágenes sin salir del panel. En modo ECS la acción dispara una task remota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportActions />
        </CardContent>
      </Card>

      {runningRuns.length > 0 ? (
        <Card className="surface-panel rounded-[30px]">
          <CardHeader>
            <CardTitle>Runs en curso</CardTitle>
            <CardDescription>Estos runs ya fueron creados por el ETL pero todavía no cerraron su estado final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {runningRuns.map((run: any) => (
              <div key={run.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">{run.source}</p>
                    <p className="text-sm text-[color:var(--muted)]">Inicio: {run.startedAt.toLocaleString("es-AR")}</p>
                  </div>
                  <Badge variant="warning">En curso</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Historial de runs</CardTitle>
          <CardDescription>Detalle de los últimos 50 runs registrados por el ETL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Errores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run: any) => {
                const totalTouched = run.created + run.updated + run.failed;
                const successRatio = totalTouched > 0 ? Math.max(0, ((run.created + run.updated) / totalTouched) * 100) : 100;

                return (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.source}</TableCell>
                    <TableCell>
                      <Badge variant={!run.finishedAt ? "warning" : statusVariant(run.status)}>
                        {!run.finishedAt ? "RUNNING" : run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-56 space-y-2">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">+{run.created} creados</Badge>
                          <Badge variant="outline">{run.updated} actualizados</Badge>
                          <Badge variant={run.failed > 0 ? "danger" : "outline"}>{run.failed} errores</Badge>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                          <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${successRatio}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{run.startedAt.toLocaleString("es-AR")}</TableCell>
                    <TableCell>{formatDuration(run.durationMs)}</TableCell>
                    <TableCell>
                      {run.itemErrors.length > 0 ? (
                        <details className="max-w-xl text-xs">
                          <summary className="cursor-pointer text-rose-300">Ver {run.itemErrors.length} error(es)</summary>
                          <div className="mt-2 space-y-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                            {run.itemErrors.map((error: any) => (
                              <p key={error.id}>
                                <span className="font-medium">{error.externalId ?? "sin externalId"}</span>: {error.message}
                              </p>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-[color:var(--muted)]">Sin errores</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
