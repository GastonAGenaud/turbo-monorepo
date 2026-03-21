import { CartPageClient } from "../../components/cart-page-client";

export default function CartPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">Resumen de compra</p>
        <h1 className="font-serif-display text-5xl">Carrito</h1>
      </div>
      <CartPageClient />
    </div>
  );
}
