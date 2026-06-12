import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LinhaMap — Trafegabilidade Rural de Ariquemes/RO",
  description:
    "Plataforma preditiva que antecipa o risco de bloqueio em estradas vicinais de Ariquemes, cruzando chuva, declividade e relatos da comunidade.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
