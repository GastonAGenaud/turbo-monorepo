import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../lib/audit";
import { ensureAdminApi } from "../../../../lib/guard";
import { categorySchema } from "../../../../lib/schemas";

export async function GET(request: Request) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ items: categories });
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi(request);
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

    await writeAuditLog({
      userId: guard.userId,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      metadata: { name: payload.name, slug: payload.slug },
      ipAddress: guard.ip,
    });

    return NextResponse.json({ ok: true, categoryId: category.id });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}
