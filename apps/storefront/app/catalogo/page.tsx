import { ProductCard } from "../../components/product-card";
import { getCatalog } from "../../lib/catalog";

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
      : "newest";

  const { items, categories, brands } = await getCatalog({
    query,
    category,
    brand,
    available,
    sort,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Catálogo</h1>

      <form className="grid gap-3 rounded-xl border border-[var(--line)] bg-[color:var(--card)] p-4 md:grid-cols-5">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar"
          className="rounded border border-[var(--line)] bg-transparent px-3 py-2"
        />
        <select name="category" defaultValue={category} className="rounded border border-[var(--line)] bg-transparent px-3 py-2">
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select name="brand" defaultValue={brand} className="rounded border border-[var(--line)] bg-transparent px-3 py-2">
          <option value="">Todas las marcas</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="rounded border border-[var(--line)] bg-transparent px-3 py-2">
          <option value="newest">Novedad</option>
          <option value="price_asc">Precio menor</option>
          <option value="price_desc">Precio mayor</option>
        </select>
        <label className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2">
          <input type="checkbox" name="available" value="1" defaultChecked={available} />
          Solo disponibles
        </label>
        <button type="submit" className="rounded bg-[color:var(--accent)] px-4 py-2 font-medium text-black md:col-span-5">
          Filtrar
        </button>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
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

      {items.length === 0 ? <p className="text-[color:var(--muted)]">No hay resultados para estos filtros.</p> : null}
    </div>
  );
}
