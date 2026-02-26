import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { ensureAdminApi } from "../../../../../lib/guard";
import { categorySchema } from "../../../../../lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  try {
    const payload = categorySchema.parse(await request.json());
    await db.category.update({ where: { id }, data: payload });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
