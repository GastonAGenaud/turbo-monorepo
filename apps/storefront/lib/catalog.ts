import { Prisma } from "@ggseeds/db";
import { db } from "@ggseeds/db";

interface CatalogFilters {
  query?: string;
  category?: string;
  brand?: string;
  available?: boolean;
  sort?: "price_asc" | "price_desc" | "newest";
}

export async function getHomeData() {
  const [categories, products] = await Promise.all([
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
  ]);

  return { categories, products };
}

export async function getCatalog(filters: CatalogFilters) {
  const where: Prisma.ProductWhereInput = {
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

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { finalPrice: "asc" }
      : filters.sort === "price_desc"
        ? { finalPrice: "desc" }
        : { createdAt: "desc" };

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

  return {
    items,
    categories,
    brands: brands.map((item) => item.brand).filter(Boolean) as string[],
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
