import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = await db.product.findMany({
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
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      finalPrice: Number(item.finalPrice),
    })),
  });
}
