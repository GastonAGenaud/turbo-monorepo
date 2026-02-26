import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { ensureAdminApi } from "../../../../lib/guard";
import { categorySchema } from "../../../../lib/schemas";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ items: categories });
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = categorySchema.parse(await request.json());
    const category = await db.category.upsert({
      where: { slug: payload.slug },
      update: payload,
      create: payload,
    });

    return NextResponse.json({ ok: true, categoryId: category.id });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}
