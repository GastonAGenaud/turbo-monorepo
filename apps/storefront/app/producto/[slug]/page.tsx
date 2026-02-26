import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge, Button } from "@ggseeds/ui";

import { getProductBySlug } from "../../../lib/catalog";
import { AddToCartButton } from "./product-client";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)] bg-[color:var(--card)]">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[color:var(--muted)]">Sin imagen</div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {product.images.slice(0, 4).map((img) => (
            <div key={img} className="relative aspect-square overflow-hidden rounded-md border border-[var(--line)]">
              <Image src={img} alt={product.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-[color:var(--muted)]">{product.brand ?? "GGseeds"}</p>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-3xl font-bold text-[color:var(--accent)]">${Number(product.finalPrice).toLocaleString("es-AR")}</p>
        <Badge variant={product.stockStatus === "OUT_OF_STOCK" ? "danger" : "default"}>
          {product.stockStatus === "OUT_OF_STOCK" ? "Sin stock" : "Disponible"}
        </Badge>
        <p className="leading-relaxed text-[color:var(--muted)]">{product.description ?? "Sin descripción."}</p>

        <div className="flex gap-2">
          <AddToCartButton productId={product.id} disabled={product.stockStatus === "OUT_OF_STOCK"} />
          <Button variant="outline">Consultar por WhatsApp</Button>
        </div>

        {product.sourceMeta ? (
          <p className="text-xs text-[color:var(--muted)]">
            Fuente: {product.sourceMeta.source} • Última importación: {product.sourceMeta.lastImportedAt?.toLocaleString("es-AR") ?? "-"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
