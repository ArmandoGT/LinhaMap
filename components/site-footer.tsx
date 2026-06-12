import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          <span className="font-semibold text-foreground">LinhaMap</span> — Trafegabilidade
          rural preditiva para Ariquemes/RO.
        </p>
        <p className="flex items-center gap-3">
          <span>Hackathon IFRO Ariquemes 2026/1</span>
          <Link href="/sobre" className="hover:text-foreground">
            Sobre o projeto
          </Link>
        </p>
      </div>
    </footer>
  );
}
