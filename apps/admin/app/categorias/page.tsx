import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { requireAdminSession } from "../../lib/admin-session";

export default async function CategoriesPage() {
  await requireAdminSession();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Taxonomía"
        title="Categorías de catálogo"
        description="Organizá la navegación pública y el filtrado del admin con una taxonomía simple, estable y editable."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Nueva categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            action={async (formData) => {
              "use server";
              const name = String(formData.get("name") ?? "");
              const slug = String(formData.get("slug") ?? "");
              const description = String(formData.get("description") ?? "") || null;

              if (!name || !slug) {
                return;
              }

              await db.category.upsert({
                where: { slug },
                update: { name, description },
                create: { name, slug, description },
              });
            }}
          >
            <input type="text" name="name" placeholder="Nombre" autoComplete="off" className="rounded-2xl border border-[var(--line)] bg-black/20 px-3 py-2.5" required />
            <input type="text" name="slug" placeholder="slug" pattern="[a-z0-9-]+" autoComplete="off" className="rounded-2xl border border-[var(--line)] bg-black/20 px-3 py-2.5 lowercase" required />
            <input type="text" name="description" placeholder="Descripción (opcional)" autoComplete="off" className="rounded-2xl border border-[var(--line)] bg-black/20 px-3 py-2.5" />
            <button type="submit" className="rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-black md:col-span-3">
              Guardar categoría
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="rounded-[20px] border border-[var(--line)] bg-white/5 p-4 text-sm">
              <p className="font-medium">{cat.name}</p>
              <p className="text-[color:var(--muted)]">/{cat.slug} • {cat._count.products} productos</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
