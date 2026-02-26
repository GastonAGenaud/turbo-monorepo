import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../lib/auth";
import { createOrderFromCheckout } from "../../../lib/order";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const payload = await request.json();

    const order = await createOrderFromCheckout(payload, session?.user?.id);

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear la orden" },
      { status: 400 },
    );
  }
}
