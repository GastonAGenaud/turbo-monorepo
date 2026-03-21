import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../../components/admin-page-header";
import { ProductForm } from "../../../components/product-form";
import { requireAdminSession } from "../../../lib/admin-session";

export default async function NewProductPage() {
  await requireAdminSession();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catálogo manual"
        title="Alta de producto"
        description="Creá una ficha manual con SKU interno, pricing y stock desde el panel editorial."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Crear manual</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories.map((cat: any) => ({ id: cat.id, name: cat.name }))} />
        </CardContent>
      </Card>
    </div>
  );
}
