"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button, Card, CardContent } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { extractProductsArray } from "../lib/cart-client";

interface ProductSnapshot {
  id: string;
  name: string;
  slug: string;
  finalPrice: number;
}

export function CartPageClient() {
  const { items, removeItem, setQuantity } = useCart();
  const [products, setProducts] = useState<ProductSnapshot[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }

    const ids = items.map((item: any) => item.productId).join(",");
    void fetch(`/api/products?ids=${ids}`)
      .then((response) => response.json())
      .then((body) => setProducts(extractProductsArray<ProductSnapshot>(body)));
  }, [items]);

  const rows = items
    .map((item: any) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return null;
      }
      return {
        ...item,
        product,
        subtotal: product.finalPrice * item.quantity,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    product: ProductSnapshot;
    subtotal: number;
  }>;

  const total = rows.reduce((acc, row) => acc + row.subtotal, 0);

  if (rows.length === 0) {
    return (
      <Card className="surface-panel rounded-[28px]">
        <CardContent className="p-6">
          <p className="font-serif-display text-3xl">Tu carrito está vacío.</p>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Volvamos al catálogo para explorar nuevas genéticas disponibles.</p>
          <Button asChild className="mt-5 rounded-full px-6">
            <Link href="/catalogo">Ir al catálogo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row: any) => (
        <Card key={row.productId} className="surface-panel rounded-[28px]">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <Link href={`/producto/${row.product.slug}`} className="font-serif-display text-2xl">
                {row.product.name}
              </Link>
              <p className="text-sm text-[color:var(--muted)]">${row.product.finalPrice.toLocaleString("es-AR")}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={row.quantity}
                onChange={(event) => setQuantity(row.productId, Number(event.target.value))}
                className="w-16 rounded border border-[var(--line)] bg-transparent px-2 py-1"
              />
              <Button variant="outline" className="rounded-full" onClick={() => removeItem(row.productId)}>
                Quitar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="surface-panel rounded-[28px]">
        <CardContent className="flex items-center justify-between p-4">
          <p className="font-semibold">Total</p>
          <p className="text-xl font-bold text-[color:var(--accent)]">${total.toLocaleString("es-AR")}</p>
        </CardContent>
      </Card>

      <Button asChild className="w-full rounded-full">
        <Link href="/checkout">Continuar checkout</Link>
      </Button>
    </div>
  );
}
