import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ADMIN_WHATSAPP_DISPLAY, SHIPPING_COPY, buildCheckoutWhatsAppMessage, buildWhatsAppUrl } from "@ggseeds/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { authOptions } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { orderId } = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Mis pedidos</h1>

      {orderId ? (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle>Pedido confirmado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-emerald-950 dark:text-emerald-100">
            <p>Tu pedido #{orderId.slice(0, 8)} ya quedó registrado.</p>
            <p>
              En el siguiente paso coordinamos pago, envío o retiro por WhatsApp con el equipo de GGseeds en{" "}
              <a href={buildWhatsAppUrl(buildCheckoutWhatsAppMessage(orderId))} target="_blank" rel="noreferrer" className="font-medium underline">
                {ADMIN_WHATSAPP_DISPLAY}
              </a>
              .
            </p>
            <p>{SHIPPING_COPY}</p>
            <Link href={buildWhatsAppUrl(buildCheckoutWhatsAppMessage(orderId))} target="_blank" rel="noreferrer" className="text-[color:var(--accent)]">
              Abrir WhatsApp para coordinar
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {orders.map((order: any) => (
          <Card key={order.id} className="border-[var(--line)] bg-[color:var(--card)]">
            <CardHeader>
              <CardTitle>
                Pedido #{order.id.slice(0, 8)} • {order.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.items.map((item: any) => (
                <p key={item.id}>
                  {item.quantity} x {item.productName} • ${Number(item.subtotal).toLocaleString("es-AR")}
                </p>
              ))}
              <p className="pt-2 font-semibold">Total ${Number(order.total).toLocaleString("es-AR")}</p>
              <p className="text-[color:var(--muted)]">
                Pago y envío por coordinación directa con administración vía WhatsApp.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
