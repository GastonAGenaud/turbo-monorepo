import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { AdminPagination } from "../../components/admin-pagination";
import { OrderStatusSelect } from "../../components/order-status-select";
import { requireAdminSession } from "../../lib/admin-session";

const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [total, orders] = await Promise.all([
    db.order.count(),
    db.order.findMany({
      include: {
        items: true,
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ventas"
        title="Órdenes y seguimiento"
        description="Revisá pedidos pendientes, datos de contacto y estado logístico para coordinar el pago manual por WhatsApp."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Gestión de estados — {total.toLocaleString("es-AR")} órdenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-[24px] border border-[var(--line)] bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-[color:var(--fg)]">
                  #{order.id.slice(0, 8)} · ${Number(order.total).toLocaleString("es-AR")}
                </p>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>
              <p className="text-xs text-[color:var(--muted)]">Cliente: {order.user?.email ?? order.email ?? "sin email"}</p>
              <p className="text-xs text-[color:var(--muted)]">Teléfono: {order.phone ?? "sin informar"}</p>
              <p className="text-xs text-[color:var(--muted)]">
                Envío: {[order.addressLine1, order.city, order.postalCode ? `(${order.postalCode})` : null].filter(Boolean).join(", ") || "a coordinar por WhatsApp"}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.quantity} x {item.productName}
                  </li>
                ))}
              </ul>
              {order.notes ? <p className="mt-2 whitespace-pre-wrap text-xs text-[color:var(--muted)]">{order.notes}</p> : null}
            </div>
          ))}
          <AdminPagination page={page} totalPages={totalPages} basePath="/ordenes" />
        </CardContent>
      </Card>
    </div>
  );
}
