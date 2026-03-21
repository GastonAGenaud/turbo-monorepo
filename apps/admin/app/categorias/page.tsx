import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

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
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Categorías</h1>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
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
            <input name="name" placeholder="Nombre" className="rounded border border-[var(--line)] bg-[color:var(--card)] px-3 py-2" required />
            <input name="slug" placeholder="slug" className="rounded border border-[var(--line)] bg-[color:var(--card)] px-3 py-2" required />
            <input name="description" placeholder="Descripción" className="rounded border border-[var(--line)] bg-[color:var(--card)] px-3 py-2" />
            <button type="submit" className="rounded bg-[color:var(--accent)] px-4 py-2 text-black md:col-span-3">
              Guardar categoría
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="rounded border border-[var(--line)] p-3 text-sm">
              <p className="font-medium">{cat.name}</p>
              <p className="text-[color:var(--muted)]">/{cat.slug} • {cat._count.products} productos</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
