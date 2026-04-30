import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { AdminShell } from "../components/admin-shell";
import { AdminProviders } from "../components/admin-providers";

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
  title: "GG Seeds — Admin",
  description: "Panel de administración GG Seeds",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}>
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
