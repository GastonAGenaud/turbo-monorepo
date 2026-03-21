import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";
import { Button } from "@ggseeds/ui";

import { AdminPageHeader } from "../components/admin-page-header";
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
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Centro de mando"
        description="Una vista rápida de órdenes, stock e importaciones para operar GGseeds sin perder contexto."
        actions={
          <>
            <Button asChild className="rounded-full px-5">
              <Link href="/productos/nuevo">Crear producto</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/imports">Correr import</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardTitle>Órdenes pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif-display text-5xl text-[color:var(--accent)]">{pendingOrders}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Pedidos creados y todavía no confirmados.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardTitle>Stock bajo/sin stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif-display text-5xl text-[color:var(--accent)]">{lowStock}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Productos que requieren revisión comercial o reimport.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[28px]">
          <CardHeader className="pb-3">
            <CardTitle>Últimas importaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif-display text-5xl text-[color:var(--accent)]">{lastImports.length}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Corridas recientes disponibles para auditoría.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel rounded-[30px]">
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

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Actividad de importación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lastImports.map((run: any) => (
            <div key={run.id} className="rounded-[22px] border border-[var(--line)] bg-white/5 p-4">
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
