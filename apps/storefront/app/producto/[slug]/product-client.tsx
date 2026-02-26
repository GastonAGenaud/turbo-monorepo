"use client";

import { Button } from "@ggseeds/ui";

import { useCart } from "../../../components/cart-provider";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled: boolean }) {
  const { addItem } = useCart();

  return (
    <Button disabled={disabled} onClick={() => addItem(productId, 1)}>
      Agregar al carrito
    </Button>
  );
}
