"use client";

import Link from "next/link";

import { Badge, Button, Card, CardContent } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { ProductImage } from "./product-image";

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
    <Card className="group overflow-hidden rounded-[28px] border-[var(--line)] bg-[linear-gradient(180deg,rgba(15,20,26,0.96),rgba(9,13,18,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
      <div className="relative h-60 w-full overflow-hidden">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fallbackClassName="flex h-full items-center justify-center bg-[#0d1117] text-xs uppercase tracking-[0.2em] text-slate-500"
          fallbackLabel="Sin imagen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(7,9,13,0.9)_100%)]" />
        <div className="absolute left-3 top-3">
          <Badge variant={isAvailable ? "default" : "danger"} className="backdrop-blur">
            {isAvailable ? "Disponible" : "Sin stock"}
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{product.brand ?? "Sin marca"}</p>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {isAvailable ? "Stock real" : "Agotado"}
            </span>
          </div>
          <h3 className="font-serif-display text-2xl leading-tight text-white">{product.name}</h3>
          <p className="text-sm leading-6 text-slate-400">
            {product.stockStatus === "UNKNOWN"
              ? "Disponibilidad a confirmar por WhatsApp."
              : isAvailable
                ? "Catálogo importado y actualizado para coordinación inmediata."
                : "Producto visible para seguimiento y reingreso de stock."}
          </p>
          <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-3">
            <p className="text-lg font-semibold text-white">${product.finalPrice.toLocaleString("es-AR")}</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Ver detalles</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 rounded-full" onClick={() => addItem(product.id, 1)} disabled={!isAvailable}>
            Agregar
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link href={`/producto/${product.slug}`}>Ver detalles</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
