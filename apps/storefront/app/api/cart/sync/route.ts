import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../../../../lib/auth";
import { syncCart } from "../../../../lib/cart";

const schema = z.object({
  items: z.array(
    z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().min(1).max(50),
    }),
  ),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const cart = await syncCart(session.user.id, payload.data.items);
  return NextResponse.json({ ok: true, cart });
}
