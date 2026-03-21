import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { checkRateLimit } from "@ggseeds/shared";

import { authOptions } from "./auth";
import { extractIp } from "./audit";

const ADMIN_API_MAX_HITS = 60;
const ADMIN_API_WINDOW_MS = 60_000; // 60 req/min

export async function ensureAdminApi(request?: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  // Rate limiting por usuario autenticado
  const rateLimitKey = `admin-api:${session.user.id}`;
  if (!checkRateLimit(rateLimitKey, ADMIN_API_MAX_HITS, ADMIN_API_WINDOW_MS)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá de nuevo en un momento." },
        { status: 429 },
      ),
    };
  }

  const ip = request ? extractIp(request) : null;

  return {
    ok: true as const,
    session,
    userId: session.user.id,
    ip,
  };
}
