import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { StoreFooter } from "../components/store-footer";
import { StoreNavbar } from "../components/store-navbar";
import { AppProviders } from "../components/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GGseeds - Semillas legales en CABA",
  description: "Genéticas premium para coleccionistas. Catálogo curado, despacho local y coordinación directa por WhatsApp.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}>
        <AppProviders>
          <StoreNavbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">{children}</main>
          <StoreFooter />
        </AppProviders>
      </body>
    </html>
  );
}
