"use client";

import { SessionProvider } from "next-auth/react";

import { CartProvider } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";
import { FloatingWhatsapp } from "./floating-whatsapp";
import { LegalNoticeModal } from "./legal-notice-modal";
import { PageLoader } from "./page-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <PageLoader />
        {children}
        <LegalNoticeModal />
        <CartDrawer />
        <FloatingWhatsapp />
      </CartProvider>
    </SessionProvider>
  );
}
