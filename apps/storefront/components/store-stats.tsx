import { db } from "@ggseeds/db";

async function getStats() {
  try {
    const [productCount, brands, categoryCount] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.product.findMany({
        where: { isActive: true, brand: { not: null } },
        distinct: ["brand"],
        select: { brand: true },
      }),
      db.category.count(),
    ]);

    return {
      productCount,
      brandCount: brands.length,
      categoryCount,
    };
  } catch {
    return { productCount: 0, brandCount: 0, categoryCount: 0 };
  }
}

export async function StoreStats() {
  const { productCount, brandCount, categoryCount } = await getStats();

  if (productCount === 0) {
    return null;
  }

  const items = [
    { value: `+${productCount}`, label: "Genéticas en catálogo" },
    { value: brandCount, label: "Bancos seleccionados" },
    { value: categoryCount, label: "Categorías curadas" },
    { value: "Buenos Aires", label: "Base operativa" },
  ];

  return (
    <section
      aria-label="Catálogo en números"
      className="grid grid-cols-2 gap-4 rounded-[28px] border border-[var(--line)] bg-[color:var(--card)]/60 px-5 py-7 lg:grid-cols-4 lg:gap-8 lg:px-10"
    >
      {items.map(({ value, label }) => (
        <div key={label} className="space-y-1 text-center lg:text-left">
          <p className="font-serif-display text-3xl text-[color:var(--fg)] md:text-4xl">{value}</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted)]">{label}</p>
        </div>
      ))}
    </section>
  );
}
