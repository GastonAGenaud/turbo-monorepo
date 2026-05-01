import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { AdminPagination } from "../../components/admin-pagination";
import { AdminSearchForm } from "../../components/admin-search-form";
import { AdminTabs } from "../../components/admin-tabs";
import { UserCard } from "../../components/user-card";
import { requireAdminSession } from "../../lib/admin-session";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const roleFilter = (Array.isArray(params.role) ? params.role[0] : params.role) ?? "";

  const where: any = {};
  if (roleFilter === "ADMIN" || roleFilter === "CUSTOMER") {
    where.role = roleFilter;
  }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { profile: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [total, users, adminCount, customerCount] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      include: {
        profile: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tabs = [
    { value: "", label: "Todos", count: adminCount + customerCount },
    { value: "ADMIN", label: "Admins", count: adminCount },
    { value: "CUSTOMER", label: "Clientes", count: customerCount },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Clientes"
        title="Usuarios y perfiles"
        description="Buscá por email o nombre, asigná o quitá el rol ADMIN, reseteá contraseñas y eliminá usuarios."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader className="space-y-4">
          <CardTitle>{total.toLocaleString("es-AR")} usuarios</CardTitle>
          <AdminSearchForm placeholder="Buscar por email o nombre…" basePath="/usuarios" />
          <AdminTabs param="role" tabs={tabs} basePath="/usuarios" />
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-[var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
              No hay usuarios que coincidan con la búsqueda.
            </p>
          ) : (
            users.map((user: any) => (
              <UserCard
                key={user.id}
                currentUserId={session.user.id}
                user={{
                  id: user.id,
                  email: user.email,
                  role: user.role,
                  createdAt: user.createdAt.toISOString(),
                  profileName: user.profile?.name ?? null,
                  ordersCount: user._count.orders,
                }}
              />
            ))
          )}
          <AdminPagination page={page} totalPages={totalPages} basePath="/usuarios" />
        </CardContent>
      </Card>
    </div>
  );
}
