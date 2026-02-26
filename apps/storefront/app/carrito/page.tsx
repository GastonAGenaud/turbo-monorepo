import { CartPageClient } from "../../components/cart-page-client";

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Carrito</h1>
      <CartPageClient />
    </div>
  );
}
