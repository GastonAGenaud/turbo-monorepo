import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Badge, Button } from "@ggseeds/ui";
import { buildWhatsAppUrl } from "@ggseeds/shared";

import { ProductImage } from "../../../components/product-image";
import { getProductBySlug } from "../../../lib/catalog";
import { maskBrand } from "../../../lib/brand";
import { AddToCartButton } from "./product-client";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ggseeds-storefront.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) {
    return { title: "Producto no encontrado" };
  }

  const brand = maskBrand(product.brand) ?? "GGseeds";
  const title = `${product.name} — ${brand}`;
  const description =
    product.description?.slice(0, 160) ??
    `${product.name} disponible en GGseeds. Coordinamos pago y envío por WhatsApp.`;
  const image = product.images?.[0];
  const url = `${SITE_URL}/producto/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const brand = maskBrand(product.brand) ?? "GGseeds";
  const url = `${SITE_URL}/producto/${product.slug}`;
  const inStock = product.stockStatus !== "OUT_OF_STOCK";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.length ? product.images : undefined,
    brand: { "@type": "Brand", name: brand },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "ARS",
      price: Number(product.finalPrice),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
        <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">{brand}</p>
        <h1 className="font-serif-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="text-3xl font-semibold text-[color:var(--accent)]">${Number(product.finalPrice).toLocaleString("es-AR")}</p>
        <Badge variant={inStock ? "default" : "danger"}>{inStock ? "Disponible" : "Sin stock"}</Badge>
        <p className="leading-8 text-[color:var(--muted)]">{product.description ?? "Sin descripción."}</p>

        <div className="flex gap-2">
          <AddToCartButton productId={product.id} disabled={!inStock} />
          <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/5 text-[color:var(--fg)] hover:bg-white/10">
            <a href={buildWhatsAppUrl(`Hola GGseeds, quiero consultar por ${product.name}.`)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Consultar por WhatsApp
            </a>
          </Button>
        </div>

        <div className="rounded-[24px] border border-[var(--line)] bg-white/5 p-4 text-sm text-[color:var(--muted)]">
          <p>Coordinamos pago y envío por WhatsApp después de tu pedido.</p>
          <p className="mt-2">Hacemos envíos a CABA y al resto del país.</p>
          {product.sourceMeta?.lastImportedAt ? (
            <p className="mt-3 text-xs">
              Stock actualizado el {product.sourceMeta.lastImportedAt.toLocaleDateString("es-AR")}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
