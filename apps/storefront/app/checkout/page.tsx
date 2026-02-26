import { CheckoutForm } from "../../components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="text-sm text-[color:var(--muted)]">Pago pendiente manual. Te vamos a confirmar por email.</p>
      <CheckoutForm />
    </div>
  );
}
