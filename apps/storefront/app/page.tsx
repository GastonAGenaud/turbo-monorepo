import Link from "next/link";

import { Button, Card, CardContent } from "@ggseeds/ui";

import { ProductCard } from "../components/product-card";
import { getHomeData } from "../lib/catalog";

export default async function HomePage() {
  const { categories, products } = await getHomeData();

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-2xl border border-[var(--line)] bg-[color:var(--card)] p-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">GGseeds Buenos Aires</p>
          <h1 className="text-4xl font-semibold md:text-5xl">Genéticas premium con estética Amsterdam, despacho en CABA.</h1>
          <p className="max-w-xl text-[color:var(--muted)]">
            Colección legal de semillas para preservación genética. Catálogo curado, stock actualizado por importación y gestión simple.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          <p className="font-semibold">Aviso legal</p>
          <p className="mt-2 text-emerald-200/90">
            La venta es exclusiva para mayores de 18 años y con fines de coleccionismo/preservación genética conforme normativa local vigente.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Categorías destacadas</h2>
          <Link href="/catalogo" className="text-sm text-[color:var(--muted)]">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="border-[var(--line)] bg-[color:var(--card)]">
              <CardContent className="space-y-2 p-5">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-[color:var(--muted)]">{category._count.products} productos</p>
                <Link href={`/catalogo?category=${category.slug}`} className="text-sm text-[color:var(--accent)]">
                  Explorar
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Novedades</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                finalPrice: Number(product.finalPrice),
                stock: product.stock,
                stockStatus: product.stockStatus,
                images: product.images,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
