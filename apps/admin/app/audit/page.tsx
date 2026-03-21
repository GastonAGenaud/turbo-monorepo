import { db } from "@ggseeds/db";
import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ggseeds/ui";

import { AdminPageHeader } from "../../components/admin-page-header";
import { requireAdminSession } from "../../lib/admin-session";

export default async function AuditPage() {
  await requireAdminSession();

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trazabilidad"
        title="Registro de auditoría"
        description="Últimas acciones persistidas desde el panel administrativo para revisar cambios, usuarios y contexto operativo."
      />

      <Card className="surface-panel rounded-[30px]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>ID Entidad</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">
                    {new Date(log.createdAt).toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-xs">{log.user.email}</TableCell>
                  <TableCell>
                    <span className="rounded-full border border-[var(--line)] bg-white/5 px-2.5 py-1 text-xs font-medium">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{log.entity}</TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs font-mono">
                    {log.entityId ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.ipAddress ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[color:var(--muted)]">
                    No hay registros de auditoría aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
