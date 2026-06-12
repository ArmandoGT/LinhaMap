/**
 * Suíte de testes do LinhaMap — disciplina Teste de Software (Hackathon IFRO 2026/1).
 *
 * Organizada pelas 3 funcionalidades críticas do MVP. Cada caso é marcado como
 * [feliz] (caminho feliz) ou [borda] (erro / valor-limite), seguindo a Análise
 * de Valor-Limite e Particionamento de Equivalência (BSTQB 2023, Cap. 6).
 *
 * Rodar:  npm test        (gera o relatório PASS/FAIL — evidência de validação)
 */
import { calculateTrafficIndex } from "@/lib/services/scoring";
import { classifyByRules } from "@/lib/services/ai-classifier";
import { getRepository } from "@/lib/repository";
import { scoreToLevel } from "@/lib/types";

// --- Mini-harness (sem dependências externas; roda via tsx) ---
type Kind = "feliz" | "borda";
interface Case {
  kind: Kind;
  name: string;
  run: () => boolean | Promise<boolean>;
}
interface Group {
  funcionalidade: string;
  oraculo: string;
  cases: Case[];
}

const HORA = 3_600_000;
const agora = Date.now();

const groups: Group[] = [
  // =========================================================================
  {
    funcionalidade: "F1 — Índice de Trafegabilidade (motor de score)",
    oraculo:
      "Score determinístico 0–100 pela fórmula ponderada; nível por faixas " +
      "0–24 baixo · 25–49 médio · 50–74 alto · 75–100 crítico.",
    cases: [
      {
        kind: "feliz",
        name: "Trecho Ponte do Branco (92mm/140mm/8,5%/2 relatos) → score ~92, crítico",
        run: () => {
          const r = calculateTrafficIndex({
            accumulatedRain72h: 92,
            forecastRain7d: 140,
            slope: 8.5,
            reports: [
              { severity: "critica", category: "lama", created_at: new Date(agora - 24 * HORA).toISOString() },
              { severity: "alta", category: "buraco", created_at: new Date(agora - 48 * HORA).toISOString() },
            ],
          });
          return r.score >= 88 && r.score <= 95 && r.level === "critico";
        },
      },
      {
        kind: "feliz",
        name: "Score explicável: cita os 72h, lista 4 fatores e gera recomendações",
        run: () => {
          const r = calculateTrafficIndex({ accumulatedRain72h: 92, forecastRain7d: 140, slope: 8.5 });
          return r.explanation.includes("72h") && r.factors.length === 4 && r.recommendations.length > 0;
        },
      },
      // --- Valor-limite das faixas (o caso de borda mais importante) ---
      {
        kind: "borda",
        name: "Valor-limite scoreToLevel: 24,9→baixo · 25→médio (fronteira baixo/médio)",
        run: () => scoreToLevel(24.9) === "baixo" && scoreToLevel(25) === "medio",
      },
      {
        kind: "borda",
        name: "Valor-limite scoreToLevel: 49,9→médio · 50→alto (fronteira médio/alto)",
        run: () => scoreToLevel(49.9) === "medio" && scoreToLevel(50) === "alto",
      },
      {
        kind: "borda",
        name: "Valor-limite scoreToLevel: 74,9→alto · 75→crítico (fronteira alto/crítico)",
        run: () => scoreToLevel(74.9) === "alto" && scoreToLevel(75) === "critico",
      },
      {
        kind: "borda",
        name: "Limite de chuva: com demais fatores nulos, vira Baixo→Médio entre 83mm e 84mm",
        run: () => {
          const baixo = calculateTrafficIndex({ accumulatedRain72h: 83 });
          const medio = calculateTrafficIndex({ accumulatedRain72h: 84 });
          return baixo.level === "baixo" && medio.level === "medio";
        },
      },
      {
        kind: "borda",
        name: "Entrada vazia → score 0, nível baixo, explicação de trecho estável",
        run: () => {
          const r = calculateTrafficIndex({});
          return r.score === 0 && r.level === "baixo" && /est[aá]vel|normal/i.test(r.explanation);
        },
      },
      {
        kind: "borda",
        name: "Entrada inválida (chuva negativa) é saneada (clamp) → não explode, score em [0,100]",
        run: () => {
          const r = calculateTrafficIndex({ accumulatedRain72h: -50, forecastRain7d: 999, slope: -3 });
          return r.score >= 0 && r.score <= 100 && Number.isFinite(r.score);
        },
      },
    ],
  },
  // =========================================================================
  {
    funcionalidade: "F2 — Classificação automática da denúncia (IA + fallback por regras)",
    oraculo:
      "Sempre retorna { categoria, severidade } válidos; sem chave de IA, " +
      "usa o fallback por palavras-chave — nunca quebra o cadastro.",
    cases: [
      {
        kind: "feliz",
        name: '"muita lama escorregadia" → categoria lama',
        run: () => classifyByRules("muita lama escorregadia").categoria === "lama",
      },
      {
        kind: "feliz",
        name: '"ponte cedendo, grave" → categoria ponte_danificada e severidade crítica',
        run: () => {
          const c = classifyByRules("ponte cedendo, grave");
          return c.categoria === "ponte_danificada" && c.severidade === "critica";
        },
      },
      {
        kind: "borda",
        name: 'Texto sem palavra-chave → categoria "outro" (degrada com segurança)',
        run: () => classifyByRules("texto qualquer aleatório").categoria === "outro",
      },
      {
        kind: "borda",
        name: "Descrição vazia/nula não quebra → retorna contrato válido",
        run: () => classifyByRules("").categoria === "outro" && classifyByRules(null).categoria === "outro",
      },
    ],
  },
  // =========================================================================
  {
    funcionalidade: "F3 — Recalcular risco ao registrar denúncia (repositório)",
    oraculo:
      "Criar uma denúncia incrementa a contagem do trecho e recalcula o " +
      "Índice; uma denúncia grave e recente pode elevar o nível de risco.",
    cases: [
      {
        kind: "feliz",
        name: "createReport incrementa reports_count do trecho",
        run: async () => {
          const repo = getRepository();
          const id = "11111111-1111-1111-1111-000000000004"; // Laticínio (baixo)
          const before = (await repo.getSegment(id))!.reports_count;
          await repo.createReport({
            road_segment_id: id,
            description: "Atolamento grave",
            category: "atolamento",
            severity: "critica",
          });
          const after = (await repo.getSegment(id))!.reports_count;
          return after === before + 1;
        },
      },
      {
        kind: "borda",
        name: "Denúncia crítica e recente eleva o nível de um trecho que era baixo",
        run: async () => {
          const repo = getRepository();
          const id = "11111111-1111-1111-1111-000000000008"; // Curva da Serra (baixo, sem relatos)
          const before = (await repo.getSegment(id))!;
          await repo.createReport({
            road_segment_id: id,
            description: "Ponte cedendo, intransitável",
            category: "ponte_danificada",
            severity: "critica",
          });
          const after = (await repo.getSegment(id))!;
          return after.risk_score > before.risk_score;
        },
      },
      {
        kind: "borda",
        name: "Repositório mock carrega exatamente os 8 trechos de Ariquemes",
        run: async () => (await getRepository().listSegments()).length === 8,
      },
    ],
  },
];

// --- Execução + relatório ---
async function main() {
  let pass = 0;
  let fail = 0;
  console.log("LinhaMap — Suíte de Testes (Teste de Software / BSTQB 4.0, Cap. 6)\n");

  for (const g of groups) {
    console.log(`\n■ ${g.funcionalidade}`);
    console.log(`  Oráculo: ${g.oraculo}`);
    for (const c of g.cases) {
      let ok = false;
      try {
        ok = await c.run();
      } catch (err) {
        ok = false;
        console.log(`    erro: ${(err as Error).message}`);
      }
      if (ok) pass++;
      else fail++;
      const tag = c.kind === "feliz" ? "[feliz]" : "[borda]";
      console.log(`    ${ok ? "PASS" : "FALHOU"}  ${tag} ${c.name}`);
    }
  }

  const total = pass + fail;
  console.log(`\n${"─".repeat(60)}`);
  console.log(`Resultado: ${pass}/${total} casos passaram${fail ? ` — ${fail} FALHA(S)` : " — TODOS OK"}`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
