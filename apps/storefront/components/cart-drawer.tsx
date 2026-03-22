"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";

import { Button } from "@ggseeds/ui";
import { buildWhatsAppUrl } from "@ggseeds/shared";

import { useCart } from "./cart-provider";
import { maskBrand } from "../lib/brand";

interface ProductSnapshot {
  id: string;
  name: string;
  brand: string | null;
  finalPrice: number;
  images: string[];
  slug: string;
}

export function CartDrawer() {
  const { items, drawerOpen, closeDrawer, removeItem, setQuantity } = useCart();
  const [products, setProducts] = useState<ProductSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product details whenever drawer opens or items change
  useEffect(() => {
    if (!drawerOpen || items.length === 0) {
      setProducts([]);
      return;
    }
    const ids = items.map((i) => i.productId).join(",");
    setLoading(true);
    fetch(`/api/products?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [drawerOpen, items]);

  const total = items.reduce((acc, item) => {
    const p = products.find((p) => p.id === item.productId);
    return acc + (p ? p.finalPrice * item.quantity : 0);
  }, 0);

  const whatsappMsg = `Hola GGseeds! Quiero coordinar el pago de mi carrito:\n${items
    .map((item) => {
      const p = products.find((p) => p.id === item.productId);
      return p ? `• ${p.name} x${item.quantity}` : "";
    })
    .filter(Boolean)
    .join("\n")}`;

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-[85] flex h-full w-full max-w-sm flex-col border-l border-[var(--line)] bg-[color:var(--card-strong)] shadow-[var(--shadow)] transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[color:var(--accent)]" />
            <p className="font-serif-display text-xl text-[color:var(--fg)]">Tu carrito</p>
            {items.length > 0 && (
              <span className="rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold text-black">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full border border-[var(--line)] p-1.5 text-[color:var(--muted)] transition-all duration-200 hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-[color:var(--muted)]" />
              <p className="font-serif-display text-2xl text-[color:var(--fg)]">Tu carrito está vacío</p>
              <p className="text-sm text-[color:var(--muted)]">Explorá nuestro catálogo de genéticas premium.</p>
              <Button asChild className="rounded-full px-6" onClick={closeDrawer}>
                <Link href="/catalogo">Ver catálogo</Link>
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="h-20 animate-pulse rounded-[16px] bg-[color:var(--card)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 rounded-[16px] border border-[var(--line)] bg-[color:var(--card)] p-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-[color:var(--card-strong)]">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-widest text-[color:var(--muted)]">
                          Sin img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {maskBrand(product.brand) ?? "GG Seeds"}
                      </p>
                      <Link
                        href={`/producto/${product.slug}`}
                        onClick={closeDrawer}
                        className="block truncate text-sm font-medium text-[color:var(--fg)] hover:text-[color:var(--accent)]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-sm font-semibold text-[color:var(--accent)]">
                        ${(product.finalPrice * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex shrink-0 flex-col items-center gap-1.5">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium text-[color:var(--fg)]">{item.quantity}</span>
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? setQuantity(item.productId, item.quantity - 1)
                            : removeItem(item.productId)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--muted)] transition hover:border-rose-500/40 hover:text-rose-500"
                      >
                        {item.quantity > 1 ? <Minus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !loading && (
          <div className="space-y-3 border-t border-[var(--line)] px-5 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[color:var(--muted)]">Subtotal</span>
              <span className="font-semibold text-[color:var(--fg)]">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>
            <Button asChild className="w-full rounded-full" onClick={closeDrawer}>
              <Link href="/checkout">
                Ir al checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full" onClick={closeDrawer}>
              <Link href="/carrito">Ver carrito completo</Link>
            </Button>
            <a
              href={buildWhatsAppUrl(whatsappMsg)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 py-2.5 text-sm font-medium text-green-600 transition-all duration-200 hover:bg-green-500/20 hover:shadow-[0_0_16px_rgba(37,211,102,0.2)] dark:text-green-400"
            >
              <span>Coordinar por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
