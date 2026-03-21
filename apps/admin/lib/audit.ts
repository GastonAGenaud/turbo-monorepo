import { db } from "@ggseeds/db";
import { logger } from "@ggseeds/shared";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SOFT_DELETE"
  | "RESTORE"
  | "IMPORT_TRIGGER"
  | "ORDER_STATUS_CHANGE"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        ...(entry.metadata ? { metadata: entry.metadata as any } : {}),
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (error) {
    logger.error({ error, entry }, "Error al escribir audit log");
  }
}

export function extractIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}
