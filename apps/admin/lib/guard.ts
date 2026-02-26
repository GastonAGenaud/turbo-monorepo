import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";

export async function ensureAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
