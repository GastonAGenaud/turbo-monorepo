import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { CheckoutForm } from "../../components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">Tu pedido</p>
        <h1 className="font-serif-display text-5xl">Coordinemos tu pedido en un minuto.</h1>
        <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)]">
          Cargá tu nombre, un WhatsApp y tu zona. El resto lo resolvemos con atención humana, sin pasos de más.
        </p>
      </div>
      <div className="glass-panel rounded-[28px] p-5 text-sm">
        <p className="font-medium">Cómo sigue después de enviar el pedido</p>
        <ul className="mt-3 space-y-2 text-[color:var(--muted)]">
          <li>• Registramos tu pedido con los productos y cantidades elegidas.</li>
          <li>• Te abrimos WhatsApp para coordinar pago, envío o retiro con una persona real.</li>
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
