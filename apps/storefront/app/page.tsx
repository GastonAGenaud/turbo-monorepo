import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3, MapPin, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ADMIN_WHATSAPP_DISPLAY, buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { BrandShowcase } from "../components/brand-showcase";
import { ProductCard } from "../components/product-card";
import { SketchfabHero } from "../components/sketchfab-hero";
import { StoreStats } from "../components/store-stats";
import { TrustRow } from "../components/trust-row";
import { AMSTERDAM_STORY_IMAGE, CATEGORY_COPY, LEGAL_BULLETS, maskBrand } from "../lib/brand";
import { getHomeData } from "../lib/catalog";

export const revalidate = 300;

export default async function HomePage() {
  const { categories, products, heroProduct } = await getHomeData();
  const highlights = [
    {
      title: "Stock actualizado",
      text: "Importamos el catálogo a diario para que consultes con una base confiable antes de escribirnos.",
      icon: Clock3,
    },
    {
      title: "Selección curada",
      text: "Elegimos genéticas con criterio de banco, historia y consistencia, no por volumen.",
      icon: ShieldCheck,
    },
    {
      title: "Atención por WhatsApp",
      text: "Pago, envío y seguimiento coordinados con una persona real, sin bots.",
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-16 pb-10 md:space-y-20">
      <section className="relative grid gap-8 pt-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel ambient-border relative overflow-hidden rounded-[32px] px-6 py-8 md:px-10 md:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_42%)]" />
          <div className="relative space-y-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--accent)]">
                Amsterdam
              </span>
              <span className="rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Preservación
              </span>
              <span className="rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Despacho local
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="font-serif-display max-w-2xl text-5xl leading-[0.95] md:text-7xl">
                Genéticas <span className="italic text-[color:var(--muted)]">premium</span> para coleccionistas.
              </h1>
              <p className="max-w-xl text-base leading-8 text-[color:var(--muted)]">
                Seleccionamos y preservamos las mejores genéticas del mundo. Asesoramiento real y directo para que encuentres la próxima joya de tu colección.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link href="/catalogo">
                  Explorar catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <a
                  href={buildWhatsAppUrl("Hola GGseeds, quiero hacer una consulta antes de armar el pedido.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>

            <div className="grid gap-3 border-t border-[var(--line)] pt-6 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/5">
                      <Icon className="h-4 w-4 text-[color:var(--accent)]" />
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm leading-6 text-[color:var(--muted)]">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ambient-border relative overflow-hidden rounded-[32px] border border-[var(--line)] bg-[color:var(--card-strong)]">
          <SketchfabHero />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.08),rgba(7,9,13,0.55)_85%)] dark:bg-[linear-gradient(180deg,rgba(7,9,13,0.08),rgba(7,9,13,0.55)_85%)]" />
          {heroProduct ? (
            <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-[var(--line)] bg-[color:var(--card)]/85 p-4 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">Selección destacada</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif-display text-2xl text-[color:var(--fg)]">{heroProduct.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{maskBrand(heroProduct.brand) ?? "GGseeds selection"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">Disponible</p>
                  <p className="mt-1 text-base font-semibold text-[color:var(--accent)]">
                    ${Number(heroProduct.finalPrice).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="relative -mt-6 md:-mt-10">
        <TrustRow />
      </div>

      <div className="relative -mt-8 md:-mt-12 lg:px-6">
        <StoreStats />
      </div>

      <BrandShowcase />

      <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]" id="categorias">
        <div className="space-y-3">
          <p className="section-kicker">Nuestras colecciones</p>
          <h2 className="font-serif-display text-4xl md:text-5xl">Categorías destacadas</h2>
        </div>
        <p className="max-w-lg self-end text-sm leading-7 text-[color:var(--muted)]">
          Explorá una selección pensada para que encuentres rápido la genética correcta, con contexto de origen, disponibilidad y atención real para resolver dudas antes de comprar.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/catalogo?category=${category.slug}`}
            className="glass-panel ambient-border group relative overflow-hidden rounded-[28px] p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)]/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_35%)] opacity-0 transition group-hover:opacity-100" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <span className="section-kicker">{category._count.products} productos</span>
                <ArrowRight className="h-4 w-4 text-[color:var(--muted)] transition group-hover:text-[color:var(--accent)]" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif-display text-3xl text-[color:var(--fg)]">{category.name}</h3>
                <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
                  {category.description ?? CATEGORY_COPY[category.slug] ?? "Colección curada de semillas premium con stock vivo."}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                <span>Explorar colección</span>
                <span>{category.slug.replace(/-/g, " ")}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section id="catalogo" className="relative space-y-10 overflow-hidden rounded-[36px] border border-[var(--line)] bg-[color:var(--card)]/60 px-4 py-10 md:px-8 md:py-14">
        <div className="relative space-y-4 text-center">
          <p className="section-kicker">Catálogo premium</p>
          <h2 className="font-serif-display text-4xl md:text-5xl">Novedades en stock</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-[color:var(--accent)]" />
        </div>

        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                finalPrice: Number(product.finalPrice),
                stock: product.stock,
                stockStatus: product.stockStatus,
                images: product.images,
              }}
            />
          ))}
        </div>

        <div className="relative flex justify-center">
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/catalogo">Ver todo el catálogo</Link>
          </Button>
        </div>
      </section>

      <section id="nosotros" className="relative overflow-hidden rounded-[36px] border border-[var(--line)] bg-[color:var(--card)] p-8 md:p-12">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={AMSTERDAM_STORY_IMAGE}
            alt="Canal de Amsterdam"
            fill
            sizes="100vw"
            quality={70}
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,rgba(7,9,13,0.88)_45%,transparent_100%)] dark:bg-[linear-gradient(90deg,#07090d_0%,rgba(7,9,13,0.9)_45%,transparent_100%)]" />
        </div>

        <div className="relative max-w-3xl space-y-6">
          <h2 className="font-serif-display text-5xl leading-tight md:text-6xl">
            De los canales de <span className="italic text-[color:var(--muted)]">Amsterdam</span> a tu colección.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
            No buscamos que compres rápido y a ciegas. Queremos que elijas bien. Cada genética del catálogo fue seleccionada por su historia, su estabilidad y la confianza que transmite su banco.
          </p>

          <div className="grid gap-3 rounded-[28px] border border-[var(--line)] bg-white/5 p-5 md:grid-cols-3">
            {LEGAL_BULLETS.map((bullet) => (
              <div key={bullet} className="flex gap-3 text-sm leading-7 text-[color:var(--muted)]">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[color:var(--muted)]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {["A", "G", "C", "B"].map((label) => (
                  <div key={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[color:var(--card-strong)] text-xs font-semibold text-[color:var(--accent)]">
                    {label}
                  </div>
                ))}
              </div>
              <p>
                <span className="font-semibold text-[color:var(--fg)]">+500 coleccionistas</span> nos consultan cada mes para comparar opciones y coordinar compras.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[color:var(--accent)]" />
              <span>Base operativa en CABA</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[color:var(--accent)]" />
              <span>{ADMIN_WHATSAPP_DISPLAY}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
