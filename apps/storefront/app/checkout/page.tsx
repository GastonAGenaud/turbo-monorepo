import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { CheckoutForm } from "../../components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">Checkout asistido</p>
        <h1 className="font-serif-display text-5xl">Coordinemos tu pedido.</h1>
      </div>
      <div className="glass-panel rounded-[28px] p-5 text-sm">
        <p className="font-medium">Cómo funciona el pago</p>
        <ul className="mt-3 space-y-2 text-[color:var(--muted)]">
          <li>• Confirmás el pedido online.</li>
          <li>• Te llevamos a WhatsApp para coordinar el pago con administración.</li>
          <li>• {SHIPPING_COPY}</li>
        </ul>
        <p className="mt-3 text-[color:var(--muted)]">
          {MANUAL_PAYMENT_COPY} Contacto:{" "}
          <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-[color:var(--accent)]">
            {ADMIN_WHATSAPP_DISPLAY}
          </a>
          .
        </p>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
              Hablar por WhatsApp antes de comprar
            </a>
          </Button>
        </div>
      </div>
      <CheckoutForm />
    </div>
  );
}
