import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { AdminPagination } from "../../components/admin-pagination";
import { AdminSearchForm } from "../../components/admin-search-form";
import { AdminTabs } from "../../components/admin-tabs";
import { OrderCard } from "../../components/order-card";
import { requireAdminSession } from "../../lib/admin-session";

const PAGE_SIZE = 25;
const STATUS_VALUES = new Set(["PENDING", "CONFIRMED", "PACKING", "SHIPPED", "CANCELLED"]);

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const statusFilter = Array.isArray(params.status) ? params.status[0] : params.status;
  const showArchived = params.archived === "1";

  const where: any = {};
  if (!showArchived) {
    where.archivedAt = null;
  }
  if (statusFilter && STATUS_VALUES.has(statusFilter)) {
    where.status = statusFilter;
  }
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [total, orders, statusCounts, archivedCount] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      include: { items: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.order.groupBy({
      by: ["status"],
      where: showArchived ? {} : { archivedAt: null },
      _count: { _all: true },
    }),
    db.order.count({ where: { archivedAt: { not: null } } }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of statusCounts) {
    counts[row.status] = row._count._all;
  }
  const totalActive = Object.values(counts).reduce((acc, n) => acc + n, 0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs = [
    { value: "", label: "Todos", count: totalActive },
    { value: "PENDING", label: "Pendientes", count: counts.PENDING ?? 0 },
    { value: "CONFIRMED", label: "Confirmados", count: counts.CONFIRMED ?? 0 },
    { value: "PACKING", label: "Preparando", count: counts.PACKING ?? 0 },
    { value: "SHIPPED", label: "Enviados", count: counts.SHIPPED ?? 0 },
    { value: "CANCELLED", label: "Cancelados", count: counts.CANCELLED ?? 0 },
  ];

  const archivedHref = (() => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (statusFilter) search.set("status", statusFilter);
    if (!showArchived) search.set("archived", "1");
    const qs = search.toString();
    return qs ? `/ordenes?${qs}` : "/ordenes";
  })();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ventas"
        title="Órdenes y seguimiento"
        description="Buscá por nombre, WhatsApp o ID, filtrá por estado y respondé al cliente sin salir del panel."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader className="space-y-4">
          <CardTitle>
            {showArchived ? "Archivadas" : "Activas"} — {total.toLocaleString("es-AR")} resultados
          </CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AdminSearchForm placeholder="Buscar por nombre, email, WhatsApp o ID…" basePath="/ordenes" />
            <a
              href={archivedHref}
              className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)] hover:text-[color:var(--accent)]"
            >
              {showArchived ? "← Ver activas" : `Ver archivadas (${archivedCount})`}
            </a>
          </div>
          <AdminTabs param="status" tabs={tabs} basePath="/ordenes" />
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-[var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
              No hay pedidos que coincidan con el filtro.
            </p>
          ) : (
            orders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={{
                  id: order.id,
                  status: order.status,
                  total: order.total.toString(),
                  fullName: order.fullName,
                  email: order.email,
                  phone: order.phone,
                  addressLine1: order.addressLine1,
                  city: order.city,
                  postalCode: order.postalCode,
                  notes: order.notes,
                  createdAt: order.createdAt.toISOString(),
                  archivedAt: order.archivedAt ? order.archivedAt.toISOString() : null,
                  items: order.items.map((item: any) => ({
                    id: item.id,
                    productName: item.productName,
                    quantity: item.quantity,
                  })),
                  user: order.user,
                }}
              />
            ))
          )}
          <AdminPagination page={page} totalPages={totalPages} basePath="/ordenes" />
        </CardContent>
      </Card>
    </div>
  );
}
