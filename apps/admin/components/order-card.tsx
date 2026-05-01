"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, MessageCircle, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@ggseeds/ui";
import { ADMIN_WHATSAPP_NUMBER } from "@ggseeds/shared";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    total: string | number;
    fullName: string;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    postalCode: string | null;
    notes: string | null;
    createdAt: string;
    archivedAt: string | null;
    items: OrderItem[];
    user?: { email: string | null } | null;
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PACKING: "Preparando",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
};

function whatsappLink(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // Argentinian normalisation: prepend 54 if missing.
  const normalized = digits.startsWith("54") ? digits : `54${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function buildFollowUpMessage(order: OrderCardProps["order"]): string {
  const ref = order.id.slice(0, 8);
  return `Hola ${order.fullName.split(" ")[0]}, te escribo de GGseeds por tu pedido ${ref}. Te paso el detalle para coordinar pago y envío.`;
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [error, setError] = useState<string | null>(null);

  async function patchOrder(payload: Record<string, unknown>) {
    setError(null);
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "No se pudo aplicar el cambio.");
      return false;
    }
    return true;
  }

  async function destroy() {
    if (!confirm(`¿Eliminar el pedido ${order.id.slice(0, 8)} de forma permanente? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    const response = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar.");
      return;
    }
    startTransition(() => router.refresh());
  }

  const isArchived = !!order.archivedAt;
  const phone = order.phone;
  const waMessage = buildFollowUpMessage(order);
  const waLink = whatsappLink(phone, waMessage);
  const personalWaLink =
    waLink ??
    `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Pedido ${order.id.slice(0, 8)} (${order.fullName})`)}`;

  return (
    <div className={`rounded-[24px] border border-[var(--line)] bg-white/5 p-4 transition ${isArchived ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs text-[color:var(--muted)]">#{order.id.slice(0, 8)}</p>
          <p className="font-medium text-[color:var(--fg)]">
            {order.fullName} · ${Number(order.total).toLocaleString("es-AR")}
          </p>
          {isArchived ? (
            <span className="rounded-full border border-[var(--line)] bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Archivado
            </span>
          ) : null}
        </div>
        <select
          value={status}
          disabled={isPending}
          onChange={async (event) => {
            const next = event.target.value;
            setStatus(next);
            const ok = await patchOrder({ status: next });
            if (!ok) {
              setStatus(order.status);
            } else {
              startTransition(() => router.refresh());
            }
          }}
          className="rounded-full border border-[var(--line)] bg-[color:var(--card)] px-3 py-1.5 text-xs"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 grid gap-1 text-xs text-[color:var(--muted)] sm:grid-cols-2">
        <p>
          Cliente: {order.user?.email ?? order.email ?? "sin email"}
          {phone ? ` · ${phone}` : ""}
        </p>
        <p>
          Envío: {[order.addressLine1, order.city, order.postalCode ? `(${order.postalCode})` : null].filter(Boolean).join(", ") || "a coordinar"}
        </p>
      </div>

      <ul className="mt-2 space-y-0.5 text-sm text-[color:var(--muted)]">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity} × {item.productName}
          </li>
        ))}
      </ul>

      {order.notes ? (
        <p className="mt-2 whitespace-pre-wrap rounded-[16px] border border-[var(--line)] bg-black/20 p-3 text-xs text-[color:var(--muted)]">
          {order.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-full">
          <a href={personalWaLink} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 h-3.5 w-3.5" />
            {phone ? "Contactar al cliente" : "WhatsApp interno"}
          </a>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={isPending}
          onClick={async () => {
            const ok = await patchOrder({ archived: !isArchived });
            if (ok) startTransition(() => router.refresh());
          }}
        >
          {isArchived ? <RotateCcw className="mr-2 h-3.5 w-3.5" /> : <Archive className="mr-2 h-3.5 w-3.5" />}
          {isArchived ? "Restaurar" : "Archivar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-red-400 hover:text-red-300"
          disabled={isPending}
          onClick={destroy}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
