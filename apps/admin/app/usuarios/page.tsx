import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { requireAdminSession } from "../../lib/admin-session";

export default async function UsersPage() {
  await requireAdminSession();

  const users = await db.user.findMany({
    include: {
      profile: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Clientes"
        title="Usuarios y perfiles"
        description="Controlá altas, roles y actividad de compra desde una vista compacta y fácil de revisar."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Clientes y roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user: any) => (
            <div key={user.id} className="rounded-[20px] border border-[var(--line)] bg-white/5 p-4 text-sm">
              <p className="font-medium">
                {user.email} · {user.role}
              </p>
              <p className="text-[color:var(--muted)]">
                {user.profile?.name ?? "Sin perfil"} · órdenes: {user._count.orders}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
