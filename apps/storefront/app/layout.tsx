import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import { StoreFooter } from "../components/store-footer";
import { StoreNavbar } from "../components/store-navbar";
import { AppProviders } from "../components/app-providers";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GGseeds - Semillas legales en CABA",
  description: "E-commerce GGseeds",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={manrope.className}>
        <AppProviders>
          <StoreNavbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>
          <StoreFooter />
        </AppProviders>
      </body>
    </html>
  );
}
