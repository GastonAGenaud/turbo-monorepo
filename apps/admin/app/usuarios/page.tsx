import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

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
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Usuarios</h1>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Clientes y roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="rounded border border-[var(--line)] p-3 text-sm">
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
