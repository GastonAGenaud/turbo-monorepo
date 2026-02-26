import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ggseeds/db";

import { ensureAdminApi } from "../../../../lib/guard";
import { orderStatusSchema } from "../../../../lib/schemas";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: orders });
}

const patchSchema = orderStatusSchema.extend({ orderId: z.string().cuid() });

export async function PATCH(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = patchSchema.parse(await request.json());

    await db.order.update({
      where: { id: payload.orderId },
      data: { status: payload.status },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}
