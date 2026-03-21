import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";
import { Button } from "@ggseeds/ui";

import { requireAdminSession } from "../lib/admin-session";

export default async function DashboardPage() {
  await requireAdminSession();

  const [pendingOrders, lowStock, lastImports] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.product.count({
      where: {
        OR: [{ stock: { lte: 5 } }, { stockStatus: "OUT_OF_STOCK" }],
      },
    }),
    db.importRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        itemErrors: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[var(--line)] bg-[color:var(--card)]">
          <CardHeader>
            <CardTitle>Órdenes pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[color:var(--accent)]">{pendingOrders}</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--line)] bg-[color:var(--card)]">
          <CardHeader>
            <CardTitle>Stock bajo/sin stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[color:var(--accent)]">{lowStock}</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--line)] bg-[color:var(--card)]">
          <CardHeader>
            <CardTitle>Últimas importaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--muted)]">{lastImports.length} runs recientes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/productos/nuevo">Crear producto</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/imports">Ejecutar import</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/ordenes">Gestionar órdenes</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Actividad de importación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lastImports.map((run: any) => (
            <div key={run.id} className="rounded border border-[var(--line)] p-3">
              <p>
                {run.source} • {run.status} • creados {run.created} • actualizados {run.updated} • fallidos {run.failed}
              </p>
              <p className="text-[color:var(--muted)]">
                {run.startedAt.toLocaleString("es-AR")} · duración {run.durationMs ?? 0} ms
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
