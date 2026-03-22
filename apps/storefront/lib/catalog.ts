import { db } from "@ggseeds/db";

interface CatalogFilters {
  query?: string;
  category?: string;
  brand?: string;
  available?: boolean;
  sort?: "price_asc" | "price_desc" | "newest";
}

function interleaveByBrand<T extends { brand: string | null; finalPrice: unknown }>(
  items: T[],
): T[] {
  const DUTCH = "Dutch Passion";
  const MERLIN = "Merlin Seeds";

  const byPrice = (a: T, b: T) =>
    Number(a.finalPrice) - Number(b.finalPrice);

  const dutch = items.filter(
    (i) => i.brand?.toLowerCase() === DUTCH.toLowerCase(),
  ).sort(byPrice);
  const merlin = items.filter(
    (i) => i.brand?.toLowerCase() === MERLIN.toLowerCase(),
  ).sort(byPrice);
  const others = items.filter(
    (i) =>
      i.brand?.toLowerCase() !== DUTCH.toLowerCase() &&
      i.brand?.toLowerCase() !== MERLIN.toLowerCase(),
  ).sort(byPrice);

  const result: T[] = [];
  const len = Math.max(dutch.length, merlin.length);
  for (let i = 0; i < len; i++) {
    const d = dutch[i];
    const m = merlin[i];
    if (d !== undefined) result.push(d);
    if (m !== undefined) result.push(m);
  }
  return [...result, ...others];
}

export async function getHomeData() {
  const [categories, products, heroProduct] = await Promise.all([
    db.category.findMany({
      take: 6,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: true,
      },
    }),
    // Hero card: prefer a Merlin Seeds product with stock
    db.product.findFirst({
      where: {
        isActive: true,
        brand: { contains: "Merlin", mode: "insensitive" },
        OR: [{ stockStatus: "IN_STOCK" }, { stock: { gt: 0 } }],
      },
      orderBy: { finalPrice: "desc" },
      include: { category: true },
    }),
  ]);

  return { categories, products, heroProduct };
}

export async function getCatalog(filters: CatalogFilters) {
  const where: any = {
    isActive: true,
    AND: [
      filters.query
        ? {
            OR: [
              { name: { contains: filters.query, mode: "insensitive" } },
              { brand: { contains: filters.query, mode: "insensitive" } },
              { tags: { has: filters.query.toLowerCase() } },
            ],
          }
        : {},
      filters.category
        ? {
            category: {
              slug: filters.category,
            },
          }
        : {},
      filters.brand
        ? {
            brand: {
              equals: filters.brand,
              mode: "insensitive",
            },
          }
        : {},
      filters.available
        ? {
            OR: [{ stockStatus: "IN_STOCK" }, { stock: { gt: 0 } }],
          }
        : {},
    ],
  };

  // For the default "price_asc" sort we apply interleaving post-query,
  // so fetch all by price asc. Other sorts keep their DB order.
  const orderBy: any =
    filters.sort === "price_desc"
      ? { finalPrice: "desc" }
      : filters.sort === "newest"
        ? { createdAt: "desc" }
        : { finalPrice: "asc" };

  const [items, categories, brands] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { isActive: true, brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]);

  // Apply Dutch/Merlin interleaving when sorting by price ascending (default)
  const sortedItems =
    !filters.sort || filters.sort === "price_asc"
      ? interleaveByBrand(items)
      : items;

  return {
    items: sortedItems,
    categories,
    brands: brands.map((item: any) => item.brand).filter(Boolean) as string[],
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      sourceMeta: true,
    },
  });
}
