"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ADMIN_WHATSAPP_DISPLAY,
  MANUAL_PAYMENT_COPY,
  SHIPPING_COPY,
  buildCheckoutWhatsAppMessage,
  buildWhatsAppUrl,
} from "@ggseeds/shared";
import { Button, Input, Label, Textarea } from "@ggseeds/ui";

import { useCart } from "./cart-provider";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      items,
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.error ?? "No se pudo crear la orden");
      setLoading(false);
      return;
    }

    const body = await response.json();
    clear();
    setMessage(`Orden creada: ${body.orderId}. Te abrimos WhatsApp para coordinar pago y envío.`);
    setLoading(false);
    window.open(buildWhatsAppUrl(buildCheckoutWhatsAppMessage(body.orderId)), "_blank", "noopener,noreferrer");
    router.push(`/pedidos?orderId=${body.orderId}`);
  }

  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        await onSubmit(formData);
      }}
    >
      <div className="glass-panel rounded-[28px] p-4 text-sm text-[color:var(--muted)]">
        <p className="font-medium text-[color:var(--fg)]">Pago coordinado con administración</p>
        <p className="mt-2">{MANUAL_PAYMENT_COPY}</p>
        <p className="mt-1">{SHIPPING_COPY}</p>
        <p className="mt-1">
          WhatsApp de contacto:{" "}
          <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-[color:var(--accent)]">
            {ADMIN_WHATSAPP_DISPLAY}
          </a>
        </p>
      </div>

      <div>
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" />
      </div>
      <div>
        <Label htmlFor="addressLine1">Dirección</Label>
        <Input id="addressLine1" name="addressLine1" required />
      </div>
      <div>
        <Label htmlFor="addressLine2">Depto/Piso</Label>
        <Input id="addressLine2" name="addressLine2" />
      </div>
      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" defaultValue="CABA" required />
      </div>
      <div>
        <Label htmlFor="postalCode">Código postal</Label>
        <Input id="postalCode" name="postalCode" required />
      </div>
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" />
      </div>

      <Button type="submit" className="rounded-full" disabled={loading || items.length === 0}>
        {loading ? "Procesando..." : "Confirmar pedido y coordinar pago"}
      </Button>

      {message ? <p className="text-sm text-[color:var(--muted)]">{message}</p> : null}
    </form>
  );
}
