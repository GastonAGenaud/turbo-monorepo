import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ggseeds/ui";
import { db } from "@ggseeds/db";

import { requireAdminSession } from "../../lib/admin-session";

export default async function ProductsPage() {
  await requireAdminSession();

  const products = await db.product.findMany({
    include: {
      category: true,
      sourceMeta: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Productos</h1>
        <Button asChild>
          <Link href="/productos/nuevo">Nuevo producto</Link>
        </Button>
      </div>

      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Catálogo total</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Link href={`/productos/${product.id}`} className="text-[color:var(--accent)]">
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
