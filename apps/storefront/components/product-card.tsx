"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge, Button, Card, CardContent } from "@ggseeds/ui";

import { useCart } from "./cart-provider";

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

  return (
    <Card className="overflow-hidden border-[var(--line)] bg-[color:var(--card)]">
      <div className="relative h-52 w-full overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-xs text-zinc-500">Sin imagen</div>
        )}
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">{product.brand ?? "Sin marca"}</p>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-lg font-semibold text-[color:var(--accent)]">${product.finalPrice.toLocaleString("es-AR")}</p>
          <Badge variant={product.stockStatus === "OUT_OF_STOCK" ? "danger" : "default"}>
            {product.stockStatus === "OUT_OF_STOCK"
              ? "Sin stock"
              : product.stockStatus === "UNKNOWN"
                ? "Stock a confirmar"
                : "Disponible"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => addItem(product.id, 1)} disabled={product.stockStatus === "OUT_OF_STOCK"}>
            Agregar
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/producto/${product.slug}`}>Ver</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
