import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../lib/audit";
import { ensureAdminApi } from "../../../../lib/guard";
import { executeImport } from "../../../../lib/import-execution";
import { importRunSchema } from "../../../../lib/schemas";

export async function GET(request: Request) {
  const guard = await ensureAdminApi(request);
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
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = importRunSchema.parse(await request.json());

    await writeAuditLog({
      userId: guard.userId,
      action: "IMPORT_TRIGGER",
      entity: "ImportRun",
      metadata: { source: payload.source, action: payload.action },
      ipAddress: guard.ip,
    });

    const result = await executeImport(payload.source, payload.action);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo ejecutar import" },
      { status: 400 },
    );
  }
}
