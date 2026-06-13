import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const SITE_DESCRIPTION =
  "Plataforma preditiva que antecipa o risco de bloqueio em estradas vicinais de Ariquemes, cruzando chuva, declividade e relatos da comunidade.";

export const metadata: Metadata = {
  metadataBase: new URL("https://linha-map.vercel.app"),
  title: "LinhaMap — Trafegabilidade Rural de Ariquemes/RO",
  description: SITE_DESCRIPTION,
  // A imagem é resolvida automaticamente por app/opengraph-image.png e
  // app/twitter-image.png (convenção do App Router).
  openGraph: {
    title: "LinhaMap — Trafegabilidade Rural de Ariquemes/RO",
    description: SITE_DESCRIPTION,
    siteName: "LinhaMap",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinhaMap — Trafegabilidade Rural de Ariquemes/RO",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
