import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { AdminPagination } from "../../components/admin-pagination";
import { requireAdminSession } from "../../lib/admin-session";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [total, users] = await Promise.all([
    db.user.count(),
    db.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            orders: true,
          },
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
        eyebrow="Clientes"
        title="Usuarios y perfiles"
        description="Controlá altas, roles y actividad de compra desde una vista compacta y fácil de revisar."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Clientes y roles — {total.toLocaleString("es-AR")} usuarios</CardTitle>
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
          <AdminPagination page={page} totalPages={totalPages} basePath="/usuarios" />
        </CardContent>
      </Card>
    </div>
  );
}
