import Link from "next/link";
import { MapPin, Megaphone } from "lucide-react";

import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RISK_LEVELS } from "@/lib/types";

/**
 * Página inicial — hero base (Etapa 10).
 * Será expandida para a Landing Page completa na Etapa 11.
 */
export default function Home() {
  return (
    <div className="container flex flex-col items-center gap-10 py-20 text-center">
      <div className="flex flex-col items-center gap-5">
        <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          Hackathon IFRO Ariquemes 2026/1 · Trafegabilidade Rural
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Antecipe o bloqueio das estradas vicinais de{" "}
          <span className="text-primary">Ariquemes</span>
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground">
          O LinhaMap cruza chuva, declividade e relatos da comunidade para prever, com até
          7 dias de antecedência, quais trechos rurais têm maior risco de ficarem
          intransitáveis.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/mapa">
            <MapPin /> Ver mapa de risco
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/denuncia">
            <Megaphone /> Registrar denúncia
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="flex flex-wrap items-center justify-center gap-3 p-6">
          <span className="text-sm font-medium text-muted-foreground">
            Índice de Trafegabilidade:
          </span>
          {RISK_LEVELS.map((level) => (
            <RiskBadge key={level} level={level} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
