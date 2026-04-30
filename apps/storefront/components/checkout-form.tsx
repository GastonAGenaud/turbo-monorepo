"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { buildCheckoutWhatsAppMessage, buildWhatsAppUrl } from "@ggseeds/shared";
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
      contactDetails: String(formData.get("contactDetails") ?? ""),
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
      setMessage(body?.error ?? "No pudimos registrar tu pedido. Probá de nuevo o escribinos por WhatsApp.");
      setLoading(false);
      return;
    }

    const body = await response.json();
    clear();
    setMessage(`Pedido ${body.orderId.slice(0, 8)} recibido. Te abrimos WhatsApp para coordinar pago, envío o retiro.`);
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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Nombre y apellido</Label>
          <Input id="fullName" name="fullName" placeholder="Ej: Andrea Gómez" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="phone">WhatsApp de contacto</Label>
          <Input id="phone" name="phone" placeholder="+54 9 ..." autoComplete="tel" inputMode="tel" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="city">Barrio o ciudad</Label>
          <Input id="city" name="city" placeholder="Ej: Palermo, CABA / Córdoba capital" autoComplete="address-level2" required />
        </div>
        <div>
          <Label htmlFor="email">Email para seguimiento</Label>
          <Input id="email" name="email" type="email" placeholder="Opcional" autoComplete="email" />
        </div>
      </div>

      <div>
        <Label htmlFor="contactDetails">Detalles para coordinar</Label>
        <Textarea
          id="contactDetails"
          name="contactDetails"
          placeholder="Opcional: franja horaria, si preferís envío o retiro, Instagram, alias o una referencia útil."
          className="min-h-[88px]"
        />
      </div>

      <div>
        <Label htmlFor="addressLine1">Dirección exacta</Label>
        <Input
          id="addressLine1"
          name="addressLine1"
          placeholder="Opcional por ahora. Si querés, la coordinamos después por WhatsApp."
          autoComplete="street-address"
        />
      </div>

      <div>
        <Label htmlFor="notes">Algo más que quieras decirnos</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Opcional: consulta sobre stock, preferencia de envío o cualquier detalle que quieras aclarar."
        />
      </div>

      <p className="text-xs leading-5 text-[color:var(--muted)]">
        Tus datos se usan únicamente para coordinar tu pedido por WhatsApp. No los compartimos con terceros.
      </p>

      <Button type="submit" className="rounded-full" disabled={loading || items.length === 0}>
        {loading ? "Registrando pedido..." : "Enviar pedido por WhatsApp"}
      </Button>

      {message ? <p className="text-sm text-[color:var(--muted)]">{message}</p> : null}
    </form>
  );
}
