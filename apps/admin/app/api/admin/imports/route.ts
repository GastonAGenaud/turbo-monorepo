import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { runAllImports, runImport } from "@ggseeds/scrapers";

import { ensureAdminApi } from "../../../../lib/guard";
import { importRunSchema } from "../../../../lib/schemas";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const runs = await db.importRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 100,
    include: {
      itemErrors: true,
    },
  });

  return NextResponse.json({ items: runs });
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = importRunSchema.parse(await request.json());

    if (payload.source === "ALL") {
      const result = await runAllImports();
      return NextResponse.json({ ok: true, result });
    }

    const result = await runImport(payload.source);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo ejecutar import" },
      { status: 400 },
    );
  }
}
