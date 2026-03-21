"use client";

import { SessionProvider } from "next-auth/react";

import { CartProvider } from "./cart-provider";
import { LegalNoticeModal } from "./legal-notice-modal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <LegalNoticeModal />
      </CartProvider>
    </SessionProvider>
  );
}
