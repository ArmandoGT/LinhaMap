"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/mapa", label: "Mapa" },
  { href: "/denuncia", label: "Denúncia" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Route className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Linha<span className="text-primary">Map</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button asChild size="sm" className="shrink-0">
          <Link href="/mapa">Ver mapa de risco</Link>
        </Button>
      </div>
    </header>
  );
}
