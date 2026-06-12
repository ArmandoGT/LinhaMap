/**
 * Página inicial — placeholder temporário (Etapa 7).
 * Será substituída pela Landing Page completa na Etapa 11.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
        Hackathon IFRO Ariquemes 2026/1
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Linha<span className="text-primary">Map</span>
      </h1>
      <p className="max-w-xl text-balance text-muted-foreground">
        Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO.
        Estrutura Next.js inicializada — backend embutido via Route Handlers.
      </p>
      <div className="flex items-center gap-3 text-sm">
        {(["baixo", "medio", "alto", "critico"] as const).map((nivel) => (
          <span key={nivel} className="flex items-center gap-1.5 capitalize">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: `hsl(var(--risk-${nivel}))` }}
            />
            {nivel}
          </span>
        ))}
      </div>
    </main>
  );
}
