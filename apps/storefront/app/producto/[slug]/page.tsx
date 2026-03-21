import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Badge, Button } from "@ggseeds/ui";
import { buildWhatsAppUrl } from "@ggseeds/shared";

import { ProductImage } from "../../../components/product-image";
import { getProductBySlug } from "../../../lib/catalog";
import { AddToCartButton } from "./product-client";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
      <div className="space-y-3">
        <div className="ambient-border relative aspect-square overflow-hidden rounded-[30px] border border-[var(--line)] bg-[color:var(--card-strong)]">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            priority
            className="object-cover"
            fallbackClassName="flex h-full items-center justify-center bg-[#0d1117] text-sm text-[color:var(--muted)]"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {product.images.slice(0, 4).map((img: any) => (
            <div key={img} className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)] bg-[color:var(--card)]">
              <ProductImage
                src={img}
                alt={product.name}
                className="object-cover"
                fallbackClassName="flex h-full items-center justify-center text-[10px] text-[color:var(--muted)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel ambient-border space-y-6 rounded-[30px] p-7 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">{product.brand ?? "GGseeds"}</p>
        <h1 className="font-serif-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="text-3xl font-semibold text-[color:var(--accent)]">${Number(product.finalPrice).toLocaleString("es-AR")}</p>
        <Badge variant={product.stockStatus === "OUT_OF_STOCK" ? "danger" : "default"}>
          {product.stockStatus === "OUT_OF_STOCK" ? "Sin stock" : "Disponible"}
        </Badge>
        <p className="leading-8 text-[color:var(--muted)]">{product.description ?? "Sin descripción."}</p>

        <div className="flex gap-2">
          <AddToCartButton productId={product.id} disabled={product.stockStatus === "OUT_OF_STOCK"} />
          <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/5 text-[color:var(--fg)] hover:bg-white/10">
            <a href={buildWhatsAppUrl(`Hola GGseeds, quiero consultar por ${product.name}.`)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Consultar
            </a>
          </Button>
        </div>

        <div className="rounded-[24px] border border-[var(--line)] bg-white/5 p-4 text-sm text-[color:var(--muted)]">
          <p>Pago coordinado directamente por WhatsApp una vez generado el pedido.</p>
          <p className="mt-2">Hacemos envíos coordinados en CABA y resto del país.</p>
          {product.sourceMeta ? (
            <p className="mt-3 text-xs">
              Fuente: {product.sourceMeta.source} • Última importación: {product.sourceMeta.lastImportedAt?.toLocaleString("es-AR") ?? "-"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
