import type { Metadata } from "next";

import "./globals.css";

import { AdminShell } from "../components/admin-shell";
import { AdminProviders } from "../components/admin-providers";

export const metadata: Metadata = {
  title: "GGseeds Admin",
  description: "Panel de administración GGseeds",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
      </body>
    </html>
  );
}
