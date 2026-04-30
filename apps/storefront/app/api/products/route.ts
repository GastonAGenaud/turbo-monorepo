import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const excludeIds = (searchParams.get("excludeIds") ?? "").split(",").filter(Boolean);
  const excludeBrands = (searchParams.get("excludeBrands") ?? "").split(",").filter(Boolean);
  const inStock = searchParams.get("inStock") === "1";
  const take = Number(searchParams.get("take") ?? "12");

  if (ids.length === 0) {
    const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 48) : 12;

    const where: any = { isActive: true };
    if (excludeIds.length > 0) where.id = { notIn: excludeIds };
    if (inStock) where.stockStatus = "IN_STOCK";
    if (excludeBrands.length > 0) where.brand = { notIn: excludeBrands };

    const items = await db.product.findMany({
      where,
      orderBy: inStock
        ? [{ stock: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
      take: safeTake,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        finalPrice: true,
        images: true,
        stockStatus: true,
        stock: true,
      },
    });

    return NextResponse.json({
      items: items.map((item: any) => ({
        ...item,
        finalPrice: Number(item.finalPrice),
      })),
    });
  }

  // When fetching by IDs (cart drawer), return a direct array so
  // the drawer can consume it with Array.isArray()
  const items = await db.product.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      finalPrice: true,
      images: true,
    },
  });

  return NextResponse.json(
    items.map((item: any) => ({
      ...item,
      finalPrice: Number(item.finalPrice),
    })),
  );
}
