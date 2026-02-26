import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { ProductForm } from "../../../components/product-form";
import { requireAdminSession } from "../../../lib/admin-session";

export default async function NewProductPage() {
  await requireAdminSession();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Nuevo producto</h1>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Crear manual</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories.map((cat) => ({ id: cat.id, name: cat.name }))} />
        </CardContent>
      </Card>
    </div>
  );
}
