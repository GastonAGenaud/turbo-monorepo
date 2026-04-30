import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { AdminPageHeader } from "../../components/admin-page-header";
import { AdminPagination } from "../../components/admin-pagination";
import { requireAdminSession } from "../../lib/admin-session";

const PAGE_SIZE = 25;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [total, products] = await Promise.all([
    db.product.count(),
    db.product.findMany({
      include: {
        category: true,
        sourceMeta: true,
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
        eyebrow="Catálogo"
        title="Productos y pricing"
        description="Gestioná el catálogo manual e importado, revisá stock y ajustá markup sin perder trazabilidad de fuente."
        actions={
          <Button asChild className="rounded-full px-5">
            <Link href="/productos/nuevo">Nuevo producto</Link>
          </Button>
        }
      />

      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle>Catálogo total — {total.toLocaleString("es-AR")} productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Precio final</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-[color:var(--muted)]">{product.category?.name ?? "Sin categoría"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.source}</TableCell>
                    <TableCell>${Number(product.finalPrice).toLocaleString("es-AR")}</TableCell>
                    <TableCell>{product.stock ?? "-"}</TableCell>
                    <TableCell>
                      <Link href={`/productos/${product.id}`} className="text-[color:var(--accent)] transition hover:opacity-80">
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/productos" />
        </CardContent>
      </Card>
    </div>
  );
}
