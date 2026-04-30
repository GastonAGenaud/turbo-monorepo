import Link from "next/link";

import { db } from "@ggseeds/db";

import { maskBrand } from "../lib/brand";

async function getBrands() {
  try {
    const grouped = await db.product.groupBy({
      by: ["brand"],
      where: { isActive: true, brand: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { brand: "desc" } },
    });
    return grouped
      .map((row) => ({ brand: row.brand as string, count: row._count._all }))
      .filter((row) => row.brand && row.count > 0);
  } catch {
    return [];
  }
}

export async function BrandShowcase() {
  const brands = await getBrands();
  if (brands.length === 0) {
    return null;
  }

  const visible = brands.slice(0, 12);

  return (
    <section className="space-y-6" aria-label="Bancos en el catálogo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="section-kicker">Bancos en el catálogo</p>
          <h2 className="font-serif-display text-3xl md:text-4xl">Selección de bancos europeos y argentinos.</h2>
        </div>
        <Link
          href="/catalogo"
          className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)] hover:text-[color:var(--accent)]"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {visible.map(({ brand, count }) => (
          <Link
            key={brand}
            href={`/catalogo?brand=${encodeURIComponent(brand)}`}
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-sm text-[color:var(--fg)] transition-all duration-200 hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)]"
          >
            <span className="font-medium">{maskBrand(brand)}</span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)] group-hover:bg-[color:var(--accent)]/15 group-hover:text-[color:var(--accent)]">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
