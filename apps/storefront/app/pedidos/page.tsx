import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { authOptions } from "../../lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

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

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-[var(--line)] bg-[color:var(--card)]">
            <CardHeader>
              <CardTitle>
                Pedido #{order.id.slice(0, 8)} • {order.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.quantity} x {item.productName} • ${Number(item.subtotal).toLocaleString("es-AR")}
                </p>
              ))}
              <p className="pt-2 font-semibold">Total ${Number(order.total).toLocaleString("es-AR")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
