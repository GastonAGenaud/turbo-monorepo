import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { authOptions } from "../../lib/auth";
import { ProfileForm } from "../../components/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const [profile, orders] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: profile?.name ?? "",
              phone: profile?.phone ?? "",
              addressLine1: profile?.addressLine1 ?? "",
              addressLine2: profile?.addressLine2 ?? "",
              city: profile?.city ?? "",
              postalCode: profile?.postalCode ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Últimos pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded border border-[var(--line)] p-3 text-sm">
              <p>#{order.id.slice(0, 8)} - {order.status}</p>
              <p className="text-[color:var(--muted)]">${Number(order.total).toLocaleString("es-AR")}</p>
            </div>
          ))}
          {orders.length === 0 ? <p className="text-sm text-[color:var(--muted)]">Sin órdenes todavía.</p> : null}
          <Link href="/pedidos" className="text-sm text-[color:var(--accent)]">
            Ver historial completo
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
