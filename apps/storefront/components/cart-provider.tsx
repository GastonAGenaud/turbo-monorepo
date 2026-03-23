"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import {
  type ClientCartItem,
  mergeCartItems,
  normalizeCartItems,
} from "../lib/cart-client";

interface CartItem extends ClientCartItem {}

interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  /** Timestamp (Date.now()) of the last addItem call — use for animations */
  lastAdded: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "ggseeds-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [serverHydrated, setServerHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      setItems(normalizeCartItems(raw ? JSON.parse(raw) : []));
    } catch {
      setItems([]);
    }
    setStorageHydrated(true);
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;

    if (!data?.user) {
      setServerHydrated(true);
      return;
    }

    setServerHydrated(false);

    let cancelled = false;

    void fetch("/api/cart/sync")
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((payload) => {
        if (cancelled) return;

        const remoteItems = normalizeCartItems(payload.items);
        setItems((current) => mergeCartItems(current, remoteItems));
        setServerHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setServerHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [data?.user, storageHydrated]);

  useEffect(() => {
    if (!data?.user || !storageHydrated || !serverHydrated) return;

    void fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [data?.user, items, storageHydrated, serverHydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (productId: string, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.productId === productId);
          if (existing) {
            return prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [...prev, { productId, quantity }];
        });
        setLastAdded(Date.now());
        setDrawerOpen(true);
      },
      removeItem: (productId: string) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      },
      clear: () => setItems([]),
      setQuantity: (productId: string, quantity: number) => {
        setItems((prev) =>
          prev
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      lastAdded,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, lastAdded, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
