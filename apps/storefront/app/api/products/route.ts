import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

type ProductCartItem = {
  id: string;
  name: string;
  slug: string;
  finalPrice: unknown;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const take = Number(searchParams.get("take") ?? "12");

  if (ids.length === 0) {
    const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 48) : 12;
    const items = await db.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: safeTake,
      select: {
        id: true,
        name: true,
        slug: true,
        finalPrice: true,
      },
    });

    return NextResponse.json({
      items: items.map((item: any) => ({
        ...item,
        finalPrice: Number(item.finalPrice),
      })),
    });
  }

  const items = (await db.product.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      finalPrice: true,
    },
  })) as ProductCartItem[];

  return NextResponse.json({
    items: items.map((item: any) => ({
      ...item,
      finalPrice: Number(item.finalPrice),
    })),
  });
}
