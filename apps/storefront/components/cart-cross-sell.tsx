"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { ProductImage } from "./product-image";
import { maskBrand } from "../lib/brand";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  finalPrice: number;
  images: string[];
}

export function CartCrossSell() {
  const { items, addItem } = useCart();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setSuggestions([]);
      setLoaded(true);
      return;
    }

    const params = new URLSearchParams({ inStock: "1", take: "4" });
    params.set("excludeIds", items.map((item: any) => item.productId).join(","));

    void fetch(`/api/products?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((body) => {
        const list: Suggestion[] = Array.isArray(body) ? body : body.items ?? [];

        // Promote variety: prefer brands that are NOT already in the cart.
        // Falls back to the API order if there aren't enough variety hits.
        void fetch(`/api/products?ids=${items.map((i: any) => i.productId).join(",")}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((cartProducts) => {
            const cartBrands = new Set(
              (Array.isArray(cartProducts) ? cartProducts : [])
                .map((p: any) => p.brand?.toLowerCase())
                .filter(Boolean),
            );
            const variety = list.filter((s) => s.brand && !cartBrands.has(s.brand.toLowerCase()));
            const merged = [...variety, ...list.filter((s) => !variety.includes(s))];
            setSuggestions(merged.slice(0, 4));
            setLoaded(true);
          })
          .catch(() => {
            setSuggestions(list.slice(0, 4));
            setLoaded(true);
          });
      })
      .catch(() => setLoaded(true));
  }, [items]);

  if (!loaded || suggestions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pt-4" aria-label="Sugerencias para tu pedido">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-serif-display text-2xl">Podría interesarte</h2>
        <Link href="/catalogo" className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)] hover:text-[color:var(--accent)]">
          Ver todo →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {suggestions.map((product) => (
          <article
            key={product.id}
            className="surface-panel group overflow-hidden rounded-[24px]"
          >
            <Link href={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden">
              <ProductImage
                src={product.images?.[0]}
                alt={product.name}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </Link>
            <div className="space-y-2 p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {maskBrand(product.brand) ?? "GGseeds"}
              </p>
              <Link
                href={`/producto/${product.slug}`}
                className="block font-serif-display text-base leading-tight text-[color:var(--fg)] hover:text-[color:var(--accent)]"
              >
                {product.name}
              </Link>
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-sm font-semibold text-[color:var(--fg)]">
                  ${product.finalPrice.toLocaleString("es-AR")}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-3 text-xs"
                  onClick={() => addItem(product.id, 1)}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
