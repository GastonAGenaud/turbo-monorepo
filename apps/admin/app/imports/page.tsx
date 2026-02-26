import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { ImportActions } from "../../components/import-actions";
import { requireAdminSession } from "../../lib/admin-session";

export default async function ImportsPage() {
  await requireAdminSession();

  const runs = await db.importRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: {
      itemErrors: {
        take: 5,
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Importador</h1>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Ejecución manual</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportActions />
        </CardContent>
      </Card>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Historial de runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {runs.map((run) => (
            <div key={run.id} className="rounded border border-[var(--line)] p-3">
              <p className="font-medium">
                {run.source} · {run.status} · creados {run.created} · actualizados {run.updated} · errores {run.failed}
              </p>
              <p className="text-[color:var(--muted)]">
                Inicio: {run.startedAt.toLocaleString("es-AR")} · duración: {run.durationMs ?? 0}ms
              </p>
              {run.itemErrors.length > 0 ? (
                <div className="mt-2 space-y-1 text-xs text-rose-300">
                  {run.itemErrors.map((error) => (
                    <p key={error.id}>{error.externalId ?? "sin externalId"}: {error.message}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
