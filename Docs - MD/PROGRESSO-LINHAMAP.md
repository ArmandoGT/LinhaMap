# LinhaMap — Estado do Projeto (handoff p/ Claude)

> Doc denso, otimizado para retomada rápida por mim (Claude). Atualizado em 2026-06-12.

## TL;DR
- Hackathon IFRO Ariquemes 2026/1, cat. **Empresa e Comunidade**. Prazo repo **19/06/2026 23h59**; culminância 26/06.
- Stack: **100% Next.js 14 (App Router) + TS + Tailwind 3 + shadcn(new-york) + Leaflet**. Backend = **Route Handlers** (`app/api`). Pivot de FastAPI → TS (FastAPI **deletado**, Etapas 2–6 antigas).
- **Modo mock por padrão** (`ENABLE_MOCK_DATA=true`). Supabase **adiado** (sem projeto ainda).
- **17/18 etapas concluídas**. Só falta **Etapa 17 (deploy)** — depende do usuário (criar Supabase + login Vercel).
- Tudo builda (`npm run build`) e foi verificado por smoke tests de runtime.

## Comandos
- `npm run dev` (porta 3000) · `npm run build` · `npx next start -p 3100` (prod)
- `npm run verify` → `scripts/verify-core.ts` (checa scoring/IA/repo, 13 checks)
- **Gotcha de teste:** `Start-Job` do PowerShell NÃO sobrevive entre tool calls. Subir servidor via `run_in_background` do harness; depois `Stop-Process` por porta (3100). Smoke test faz poll em `/api/health` (até ~40s).
- Windows: warnings LF→CRLF são normais. Commits convencionais + trailer `Co-Authored-By: Claude...`.

## Arquitetura / arquivos-chave
- `lib/types.ts` (enums/tipos + `scoreToLevel`), `lib/mock-data.ts` (8 trechos + 6 denúncias de Ariquemes; coords [lon,lat]), `lib/config.ts` (`isSupabaseMode`/`aiEnabled`/`dataMode`), `lib/labels.ts`, `lib/risk.ts` (RISK_COLORS/labels/badge classes), `lib/api-client.ts` (fetch client p/ browser).
- `lib/services/`: **scoring.ts** (motor explicável; pesos rain72=.30, forecast7d=.25, slope=.15, reports=.30; refs 100mm/150mm/10%; severidade 15/30/45/60; recência linear 14d; faixas 0-24/25-49/50-74/75-100), **ai-classifier.ts** (Claude multimodal + fallback regras → JSON {categoria,severidade,confianca,justificativa,fonte}), reporting.ts, dashboard.ts, serializers.ts (geometry GeoJSON + detail), weather.ts (Open-Meteo), worker.ts.
- `lib/repository/`: base.ts (interface + `scoreFields`), **mock.ts** (in-memory, singleton via globalThis, recalc on init + on report mutate, structuredClone), supabase.ts (porte fiel, **não testado live**), index.ts (factory `getRepository`).
- `lib/supabase/server.ts` (service-role client).
- `app/api/`: segments (route/[id]/recalculate), reports (route/[id]/[id]/status), ai/{classify-report,generate-weekly-summary}, dashboard/{summary,critical-segments,reports-by-category,weekly-report,export-csv}, worker/reprocess-daily (GET+POST, auth `CRON_SECRET`), health. Todas `export const dynamic="force-dynamic"`.
- Páginas: `/` (landing, stats ao vivo), `/mapa`, `/denuncia` (?segment= preseleciona), `/dashboard`, `/relatorios`, `/sobre`.
- `components/`: ui (button,card,badge,input,textarea,label), site-header/footer, risk-badge, map/{leaflet-map,map-view,segment-detail-panel,map-legend}, dashboard/{dashboard-view,heatmap-map}, report/{report-form,report-toolbar}.
- `database/schema.sql` + `seed.sql` (PostGIS + coluna `coordinates` jsonb populada via ST_AsGeoJSON), `.github/workflows/daily-reprocess.yml`, `vercel.json` (cron 08:00 UTC).

## Decisões / armadilhas
- **Leaflet sempre via `next/dynamic` `ssr:false`** (window not defined). leaflet-map.tsx e heatmap-map.tsx são client-only carregados por dynamic em map-view/dashboard-view.
- Mock store = singleton em globalThis → **não persiste em serverless cold start**; persistência real só com Supabase.
- scoring TS = **paridade exata** com Python (score 92 p/ Ponte do Branco).
- `useSupabase`→**`isSupabaseMode`** (falso-positivo eslint react-hooks).
- Upload de foto = **data URL** no mock (máx 2MB); Supabase Storage é futuro.
- Modelos IA: classify `claude-haiku-4-5-20251001`, report `claude-sonnet-4-6`.
- **SupabaseRepository NÃO auto-recalcula no init** (diferente do mock) → após deploy rodar `POST /api/segments/recalculate` uma vez.

## Verificação feita (tudo OK)
- core 13/13 (`npm run verify`); API E2E 14/14; landing/mapa/denúncia/dashboard/relatórios/sobre/worker smoke-tested via servidor real.

## Falta — Etapa 17 (usuário) — guia em `Docs - MD/DEPLOY.md`
1. Criar projeto Supabase (região São Paulo) → rodar `schema.sql` depois `seed.sql` → pegar chaves.
2. Vercel import → env vars: `ENABLE_MOCK_DATA=false` + SUPABASE_URL/SERVICE_ROLE_KEY + NEXT_PUBLIC_* + `CRON_SECRET` (+ ANTHROPIC opcional).
3. Pós-deploy: `POST /api/segments/recalculate` (sincronizar scores). Validar `/api/health` → `mode:supabase`.
4. Preencher placeholders `_a preencher_` no README (equipe, integrantes, link MVP, vídeo pitch, validação) + DECLARACAO_IA.

## Docs (todos em `Docs - MD/`, exceto README na raiz)
- README.md (raiz, entregável) · PLANO_DE_ACAO.md · DEPLOY.md · PITCH.md · DECLARACAO_IA.md · CONTRIBUTING.md · este PROGRESSO.
- Fontes do desafio: `Docs - MD/LinhaMap.txt` (spec) e `Edital Hackathon 2026.pdf`.

## Memórias persistentes (~/.claude/.../memory)
stack-nextjs-fullstack, supabase-deferred, shadcn-clean-corporate, leaflet-dynamic-import.
