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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ggseeds-storefront.vercel.app";
const SITE_DESCRIPTION =
  "Genéticas premium para coleccionistas. Catálogo curado, despacho local y coordinación directa por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GGseeds — Semillas legales en CABA",
    template: "%s · GGseeds",
  },
  description: SITE_DESCRIPTION,
  applicationName: "GGseeds",
  keywords: ["semillas", "coleccionismo", "genética", "CABA", "Buenos Aires", "Dutch Passion", "GGseeds"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "GGseeds",
    title: "GGseeds — Semillas legales en CABA",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "GGseeds — Semillas legales en CABA",
    description: SITE_DESCRIPTION,
  },
};

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
