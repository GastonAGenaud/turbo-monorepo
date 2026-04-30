import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@ggseeds/ui";

import { ProductCard } from "../../components/product-card";
import { getCatalog } from "../../lib/catalog";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ggseeds-storefront.vercel.app";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const available = params.available === "1";
  const sort =
    typeof params.sort === "string" && ["price_asc", "price_desc", "newest"].includes(params.sort)
      ? (params.sort as "price_asc" | "price_desc" | "newest")
      : "price_asc";

  const { items, categories, brands } = await getCatalog({
    query,
    category,
    brand,
    available,
    sort,
  });

  const breadcrumbItems = [
    { name: "Inicio", url: SITE_URL },
    { name: "Catálogo", url: `${SITE_URL}/catalogo` },
  ];
  if (category) {
    const cat = categories.find((c: any) => c.slug === category);
    if (cat) {
      breadcrumbItems.push({
        name: cat.name as string,
        url: `${SITE_URL}/catalogo?category=${category}`,
      });
    }
  } else if (brand) {
    breadcrumbItems.push({
      name: brand,
      url: `${SITE_URL}/catalogo?brand=${encodeURIComponent(brand)}`,
    });
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="glass-panel ambient-border overflow-hidden rounded-[32px] px-6 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <p className="section-kicker">Catálogo curado</p>
            <h1 className="font-serif-display text-5xl leading-[0.96] md:text-6xl">Explorá genéticas premium con stock vivo.</h1>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] md:text-base">
              Filtrá por marca, categoría y disponibilidad para encontrar la genética correcta sin perder contexto de origen, precio y actualización de stock.
            </p>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              <span className="rounded-full border border-[var(--line)] px-3 py-1">{items.length} resultados</span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1">{brands.length} marcas</span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1">{categories.length} categorías</span>
            </div>
          </div>

          <form className="surface-panel grid gap-3 rounded-[28px] p-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">Búsqueda</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar genética, marca o tag"
                  className="w-full rounded-full border border-[var(--line)] bg-transparent py-3 pl-10 pr-4"
                />
              </div>
            </label>

            <select
              name="category"
              defaultValue={category}
              className="rounded-full border border-[var(--line)] bg-[color:var(--card)] px-4 py-3 text-[color:var(--fg)] [&_option]:bg-[color:var(--card-strong)] [&_option]:text-[color:var(--fg)]"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              name="brand"
              defaultValue={brand}
              className="rounded-full border border-[var(--line)] bg-[color:var(--card)] px-4 py-3 text-[color:var(--fg)] [&_option]:bg-[color:var(--card-strong)] [&_option]:text-[color:var(--fg)]"
            >
              <option value="">Todas las marcas</option>
              {brands.map((item: string) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-full border border-[var(--line)] bg-[color:var(--card)] px-4 py-3 text-[color:var(--fg)] [&_option]:bg-[color:var(--card-strong)] [&_option]:text-[color:var(--fg)]"
            >
              <option value="price_asc">Precio menor</option>
              <option value="newest">Novedad</option>
              <option value="price_desc">Precio mayor</option>
            </select>
            <label className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-sm">
              <input type="checkbox" name="available" value="1" defaultChecked={available} />
              Solo disponibles
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit" className="rounded-full px-6">Aplicar filtros</Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href="/catalogo">Limpiar</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full px-6">
                <Link href="/carrito">Ir al carrito</Link>
              </Button>
            </div>
          </form>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product: any) => (
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

      {items.length === 0 ? (
        <div className="surface-panel rounded-[28px] p-8 text-center">
          <p className="font-serif-display text-3xl">No encontramos resultados con esos filtros.</p>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Probá otra marca, quitá el filtro de disponibilidad o volvamos al catálogo completo.</p>
          <div className="mt-5">
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/catalogo">Ver catálogo completo</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
