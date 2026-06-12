# LinhaMap — Plano de Ação (Next.js Fullstack)

> **Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO**
> Hackathon Extensionista IFRO Ariquemes 2026/1 — Categoria: **Desafio Empresa e Comunidade**
> Arquitetura: **100% Next.js (App Router)** — UI + API (Route Handlers) num único deploy na Vercel.

---

## 🔄 Histórico de arquitetura

O projeto começou com backend **FastAPI/Python** (Etapas 2–6, funcionais e testadas) e foi
**migrado para Next.js fullstack** para simplificar o deploy do hackathon (um único deploy,
sem CORS nem servidor Python separado). A lógica foi **portada para TypeScript** em `lib/`.

---

## ✅ Progresso

- [x] **Etapa 0** — Governança/monorepo *(ajustada: raiz é o app Next.js)*
- [x] **Etapa 1** — `database/schema.sql` + `seed.sql` (Supabase/PostGIS)
- [x] ~~Etapas 2–6 (FastAPI)~~ — **removidas**; lógica portada para TS
- [x] **Etapa 7** — Re-scaffold Next.js (TS + Tailwind + shadcn) + porte de tipos/mock-data
- [x] **Etapa 8** — Núcleo de domínio em TS (`lib/services` + `lib/repository`)
- [x] **Etapa 9** — Route Handlers REST (`app/api/...`)
- [x] **Etapa 10** — Design system + layout
- [x] **Etapa 11** — Landing page
- [x] **Etapa 12** — Mapa de risco + detalhe do trecho
- [x] **Etapa 13** — Cadastro de denúncia
- [x] **Etapa 14** — Dashboard da Secretaria
- [x] **Etapa 15** — Relatórios + Sobre
- [x] **Etapa 16** — Cron diário (worker)
- [ ] **Etapa 17** — Deploy Vercel + Supabase real *(requer projeto Supabase + login Vercel)*
- [x] **Etapa 18** — README final, declaração de IA, pitch

### Funcionalidades extras (fecham o ciclo)

- [x] **Etapa 19** — Melhor janela para escoar (melhor dia dos 7 no painel do trecho)
- [x] **Etapa 20** — Alertas + seguir trecho (central de notificações; e-mail/WhatsApp simulados)
- [x] **Etapa 21** — Ordens de serviço (manutenção que resolve denúncias e baixa o risco)
- [x] **Etapa 22** — Consulta de trajeto A→B (risco agregado + melhor janela do caminho)

---

## 🏗️ Estrutura

```
app/
  (site)/...        → páginas: landing, mapa, dashboard, denúncia, relatórios, sobre
  api/              → Route Handlers = API REST (Seção 9)
    segments/ reports/ ai/ dashboard/ worker/
lib/
  types.ts          → tipos/enums de domínio
  mock-data.ts      → dados mockados de Ariquemes
  services/         → scoring · ai-classifier · reporting · dashboard
  repository/       → modo dual mock/supabase
  supabase/         → cliente supabase-js
components/ ui/ map/ → componentes shadcn e do mapa
database/           → schema.sql + seed.sql
.github/workflows/  → cron diário (ou Vercel Cron)
```

---

## 🗺️ Detalhe das próximas etapas

### Backend embutido (porte das antigas Etapas 2–6)
- **Etapa 8 — Núcleo de domínio em TS:** `scoring.ts` (motor explicável), `ai-classifier.ts`
  (Anthropic JS SDK + fallback por regras), `reporting.ts`, `dashboard.ts`; `repository`
  (mock/supabase) + cliente Supabase.
- **Etapa 9 — Route Handlers REST:** `/api/segments` (CRUD + recalculate), `/api/reports`
  (CRUD + status), `/api/ai/*`, `/api/dashboard/*`, `/api/worker/reprocess-daily`.

### Frontend (telas — Seção 11)
- **Etapa 10** — Design system limpo/corporativo (paleta de risco, navbar, cliente de API).
- **Etapa 11** — Landing page.
- **Etapa 12** — Mapa de risco (Leaflet via `next/dynamic` `ssr:false`) + detalhe do trecho.
- **Etapa 13** — Cadastro de denúncia (geolocation + upload + classificação IA).
- **Etapa 14** — Dashboard da Secretaria (cards, lista crítica, heatmap, filtros, CSV, relatório).
- **Etapa 15** — Relatórios + Sobre/Configurações.

### Automação, Deploy e Entrega
- **Etapa 16** — Cron diário → `POST /api/worker/reprocess-daily`.
- **Etapa 17** — Deploy único na Vercel + Supabase real + smoke test E2E.
- **Etapa 18** — README final, declaração de IA, evidências de validação, pitch + vídeo.

---

## 📅 Prazos

| Marco | Data |
| --- | --- |
| Submissão do repositório GitHub | **19/06/2026, 23h59** |
| Culminância presencial | 26/06/2026 |
