"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthNav } from "@/components/auth/auth-nav";
import { LogoMark, Wordmark } from "@/components/brand";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/mapa", label: "Mapa" },
  { href: "/trajeto", label: "Trajeto" },
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
        <Link href="/" className="flex items-center gap-2" aria-label="LinhaMap — página inicial">
          <LogoMark height={32} priority />
          <Wordmark height={20} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
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

        <div className="flex items-center gap-1">
          <NotificationBell />
          <AuthNav />
          <Button asChild size="sm" className="shrink-0">
            <Link href="/mapa">Ver mapa de risco</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
