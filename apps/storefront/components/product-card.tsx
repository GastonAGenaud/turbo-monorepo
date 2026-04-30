"use client";

import Link from "next/link";

import { Badge, Button, Card, CardContent } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { ProductImage } from "./product-image";
import { maskBrand } from "../lib/brand";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    finalPrice: number;
    stock: number | null;
    stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
    images: string[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const isAvailable = product.stockStatus !== "OUT_OF_STOCK";

  return (
    <Card className="group overflow-hidden rounded-[28px] border border-[var(--line)] bg-[color:var(--card)] shadow-[var(--shadow)]">
      <div className="relative h-60 w-full overflow-hidden">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fallbackClassName="flex h-full items-center justify-center bg-[color:var(--card-strong)] text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
          fallbackLabel="Sin imagen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(7,9,13,0.7)_100%)] dark:bg-[linear-gradient(180deg,transparent_30%,rgba(7,9,13,0.9)_100%)]" />
        <div className="absolute left-3 top-3">
          <Badge variant={isAvailable ? "default" : "danger"} className="backdrop-blur">
            {isAvailable ? "Disponible" : "Sin stock"}
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">{maskBrand(product.brand) ?? "GG Seeds"}</p>
          <h3 className="font-serif-display text-xl leading-tight text-[color:var(--fg)]">{product.name}</h3>
          <p className="pt-1 text-lg font-semibold text-[color:var(--fg)]">${product.finalPrice.toLocaleString("es-AR")}</p>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 rounded-full" onClick={() => addItem(product.id, 1)} disabled={!isAvailable}>
            Agregar
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link href={`/producto/${product.slug}`}>Ver detalles</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
