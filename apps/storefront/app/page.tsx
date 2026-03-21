import Link from "next/link";
import { ArrowRight, Clock3, MapPin, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ADMIN_WHATSAPP_DISPLAY, buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { FloatingSeeds } from "../components/floating-seeds";
import { Hero3D } from "../components/hero-3d";
import { ProductCard } from "../components/product-card";
import { AMSTERDAM_STORY_IMAGE, CATEGORY_COPY, LEGAL_BULLETS } from "../lib/brand";
import { getHomeData } from "../lib/catalog";

export default async function HomePage() {
  const { categories, products } = await getHomeData();
  const heroProduct = products[0] ?? null;
  const highlights = [
    {
      title: "Stock real",
      text: "Actualización diaria del catálogo para disponibilidad más confiable.",
      icon: Clock3,
    },
    {
      title: "Colección curada",
      text: "Genéticas premium seleccionadas por linaje, reputación y estabilidad.",
      icon: ShieldCheck,
    },
    {
      title: "Despacho coordinado",
      text: "Atención directa por WhatsApp para pago, envío y seguimiento.",
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-20 pb-10">
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
                Curamos las mejores semillas del mercado para preservación genética. Calidad europea, stock actualizado y despacho local inmediato en CABA y envíos a todo el país.
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
                <Link href="/#nosotros">Sobre nosotros</Link>
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
          <Hero3D />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.08),rgba(7,9,13,0.55)_85%)] dark:bg-[linear-gradient(180deg,rgba(7,9,13,0.08),rgba(7,9,13,0.55)_85%)]" />
          {heroProduct ? (
            <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-[var(--line)] bg-[color:var(--card)]/85 p-4 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">Selección destacada</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif-display text-2xl text-[color:var(--fg)]">{heroProduct.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{heroProduct.brand ?? "GGseeds selection"}</p>
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

      <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]" id="categorias">
        <div className="space-y-3">
          <p className="section-kicker">Nuestras colecciones</p>
          <h2 className="font-serif-display text-4xl md:text-5xl">Categorías destacadas</h2>
        </div>
        <p className="max-w-lg self-end text-sm leading-7 text-[color:var(--muted)]">
          Explorá una selección curada de genéticas europeas, clasificadas para ayudarte a encontrar la pieza ideal para tu colección sin perder contexto de origen, stock y pricing.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/catalogo?category=${category.slug}`}
            className="ambient-border group relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(17,22,30,0.98),rgba(10,14,19,0.96))] p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)]/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,230,179,0.1),transparent_35%)] opacity-0 transition group-hover:opacity-100" />
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
        <FloatingSeeds />
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
          <img src={AMSTERDAM_STORY_IMAGE} alt="Canal de Amsterdam" className="h-full w-full object-cover grayscale" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,rgba(7,9,13,0.88)_45%,transparent_100%)] dark:bg-[linear-gradient(90deg,#07090d_0%,rgba(7,9,13,0.9)_45%,transparent_100%)]" />
        </div>

        <div className="relative max-w-3xl space-y-6">
          <h2 className="font-serif-display text-5xl leading-tight md:text-6xl">
            De los canales de <span className="italic text-[color:var(--muted)]">Amsterdam</span> a tu colección.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
            No somos solo una tienda de semillas. Somos apasionados por la botánica y la preservación. Cada genética en nuestro catálogo fue elegida por su historia, su vigor y su pureza.
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
                <span className="font-semibold text-[color:var(--fg)]">+500 coleccionistas</span> consultan cada mes por nuestro catálogo.
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
