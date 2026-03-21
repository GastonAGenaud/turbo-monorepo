import { notFound } from "next/navigation";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../../components/admin-page-header";
import { ProductForm } from "../../../components/product-form";
import { requireAdminSession } from "../../../lib/admin-session";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Edición"
        title="Producto y markup"
        description="Ajustá precio base, markup, stock y metadata sin perder referencia de origen o automatizaciones futuras."
        actions={
          <form
            action={async () => {
              "use server";
              await db.product.delete({ where: { id } });
            }}
          >
            <Button variant="destructive" type="submit" className="rounded-full px-5">
              Eliminar
            </Button>
          </form>
        }
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories.map((cat: any) => ({ id: cat.id, name: cat.name }))}
            product={{
              id: product.id,
              sku: product.sku,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              description: product.description,
              basePrice: Number(product.basePrice),
              markupPercent: Number(product.markupPercent),
              stock: product.stock,
              stockStatus: product.stockStatus,
              categoryId: product.categoryId,
              images: product.images,
              source: product.source,
              tags: product.tags,
              isActive: product.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
