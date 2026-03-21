"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  setQuantity: (productId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "ggseeds-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!data?.user || items.length === 0) {
      return;
    }

    void fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [data?.user, items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (productId: string, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.productId === productId);
          if (existing) {
            return prev.map((item: any) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
            );
          }
          return [...prev, { productId, quantity }];
        });
      },
      removeItem: (productId: string) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      },
      clear: () => setItems([]),
      setQuantity: (productId: string, quantity: number) => {
        setItems((prev) =>
          prev
            .map((item: any) => (item.productId === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        );
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return ctx;
}
