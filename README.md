# LinhaMap 🛰️🌧️🚜

> **Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO**
> Inteligência de dados para prevenção de bloqueios em estradas vicinais.

[![Status](https://img.shields.io/badge/status-MVP%20funcional-success)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20TypeScript-black)]()
[![Hackathon](https://img.shields.io/badge/Hackathon-IFRO%20Ariquemes%202026%2F1-green)]()

---

## 🎓 Identificação

- **Curso/Turma:** Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) — IFRO Campus Ariquemes
- **Categoria:** Desafio Empresa e Comunidade
- **Desafio:** Plataforma Preditiva de Trafegabilidade (Proponente: QUANYX Tecnologia)
- **Equipe:** _a preencher_
- **Integrantes:** _a preencher_

## 🔗 Links de entrega

- **MVP online:** _a publicar (deploy na Vercel — ver Etapa 17)_
- **Vídeo de pitch:** _a gravar (roteiro em [`PITCH.md`](./Docs%20-%20MD/PITCH.md))_
- **Apresentação/slides:** _a preparar_

---

## 🛑 Problema

No período chuvoso, as linhas rurais de Ariquemes/RO ficam intransitáveis e comprometem o
transporte de leite, peixe, gado, café, hortaliças e insumos. Hoje a manutenção é **reativa** —
só acontece depois que caminhões atolam ou produtores já tiveram prejuízo. Faltam ferramentas
que cruzem dados de chuva, características das vias e relatos para **antecipar** trechos críticos.

**Público afetado:** produtores rurais (piscicultores, pecuaristas, produtores de leite e café),
transportadoras, cooperativas e a Secretaria Municipal de Obras.

## 💡 Solução

O LinhaMap cruza **previsão de chuva (7 dias)**, **chuva acumulada (72h)**, **declividade** e
**relatos da comunidade** para gerar um **Índice de Trafegabilidade (0–100)** por trecho,
classificando-o em 4 níveis — **Baixo, Médio, Alto, Crítico** — com até 7 dias de antecedência.
O cálculo é **explicável** (fórmula ponderada, não caixa-preta), gerando justificativa textual e
recomendações de ação. Assim, a manutenção deixa de ser reativa e passa a ser **preventiva**.

---

## ✨ Funcionalidades

- ✅ Landing page de apresentação com estatísticas ao vivo
- ✅ Mapa de risco interativo (Leaflet) com trechos coloridos e painel de detalhe
- ✅ Índice de Trafegabilidade 0–100 explicável, com fatores e recomendações
- ✅ Cadastro de denúncia colaborativa (geolocalização + foto)
- ✅ Classificação automática da denúncia por IA (com fallback por regras)
- ✅ Dashboard da Secretaria (cards, mapa de calor, filtros, exportar CSV)
- ✅ Relatório semanal pronto para ata/ofício
- ✅ Reprocessamento diário automático (Vercel Cron / GitHub Actions)
- ✅ API REST completa (Route Handlers)

## 🖥️ Telas

| Tela | Descrição |
| --- | --- |
| **Início** (`/`) | Apresenta o projeto, o problema, o público e como funciona; CTAs para mapa e denúncia. |
| **Mapa** (`/mapa`) | Linhas vicinais coloridas por risco; clique no trecho abre o painel com índice, chuva, declividade, relatos, explicação e recomendações. |
| **Denúncia** (`/denuncia`) | Formulário com GPS automático, upload de foto e classificação automática por IA. |
| **Dashboard** (`/dashboard`) | Cards de resumo, trechos prioritários, mapa de calor, tabela filtrável e exportação CSV. |
| **Relatórios** (`/relatorios`) | Relatório semanal textual + indicadores, com copiar/imprimir. |
| **Sobre** (`/sobre`) | Como funcionam o score e a IA, fontes de dados e stack. |

---

## 🧱 Stack técnica

| Camada | Tecnologias |
| --- | --- |
| Fullstack | **Next.js 14 (App Router) + TypeScript** — UI e API (Route Handlers) no mesmo projeto |
| UI | TailwindCSS, shadcn/ui, Leaflet (react-leaflet) + leaflet.heat |
| Banco de dados | Supabase (PostgreSQL + PostGIS) — opcional; roda em modo mock sem ele |
| IA | Anthropic Claude (multimodal) com fallback por regras |
| Automação | Vercel Cron / GitHub Actions (cron diário) |
| Deploy | Vercel (deploy único) |
| Dados públicos | Open-Meteo, OpenStreetMap, SRTM, INMET (preparado para integração) |

### Arquitetura

Aplicação **100% Next.js**: o backend roda como **Route Handlers** (`app/api/...`), sem servidor
separado. A lógica de domínio fica em `lib/` e é agnóstica à fonte de dados (mock ou Supabase).

```
app/
  (páginas)         → /, /mapa, /denuncia, /dashboard, /relatorios, /sobre
  api/              → Route Handlers (REST): segments, reports, ai, dashboard, worker
lib/
  types.ts          → tipos/enums de domínio
  mock-data.ts      → dados mockados de Ariquemes
  services/         → scoring · ai-classifier · reporting · dashboard · weather · worker
  repository/       → modo dual mock/supabase + factory
  supabase/         → cliente supabase-js
components/          → ui (shadcn), map, dashboard, report
database/           → schema.sql + seed.sql
.github/workflows/  → daily-reprocess.yml (cron)
```

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- (Opcional) Conta Supabase — o app roda em **modo mock** sem ela.

### Desenvolvimento
```bash
npm install
cp .env.example .env.local   # ENABLE_MOCK_DATA=true já roda sem Supabase
npm run dev                  # http://localhost:3000
```

### Build de produção
```bash
npm run build && npm run start
```

### Verificação rápida do núcleo
```bash
npm run verify   # checagens do motor de score, classificação e repositório
```

## 🧪 Como testar (fluxo principal)

1. Abra a **landing** e clique em **"Ver mapa de risco"**.
2. No **mapa**, clique em um trecho colorido → veja índice, explicação e recomendações.
3. Clique em **"Registrar denúncia"**, descreva um problema (ex.: _"muita lama na ponte"_) e envie
   → a denúncia é **classificada automaticamente** e o risco do trecho é recalculado.
4. Abra o **Dashboard** → veja cards, mapa de calor e a denúncia na tabela; **exporte o CSV**.
5. Abra **Relatórios** → gere o **relatório semanal** pronto para ata/ofício.

---

## ⚙️ Variáveis de ambiente

Veja [`.env.example`](./.env.example). O sistema **funciona sem nenhuma chave** (modo mock).

| Variável | Função |
| --- | --- |
| `ENABLE_MOCK_DATA` | `true` (padrão) usa dados em memória; `false` usa Supabase |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Conexão server-side com o Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente (browser) |
| `OPEN_METEO_BASE_URL` | Endpoint do Open-Meteo |
| `ANTHROPIC_API_KEY` / `ENABLE_AI_CLASSIFICATION` | Liga a classificação por IA (senão, fallback) |
| `CRON_SECRET` | Protege o endpoint do worker no cron |

## 🗄️ Como configurar o Supabase (opcional)

1. Crie um projeto no [Supabase](https://supabase.com).
2. No **SQL Editor**, execute na ordem: `database/schema.sql` e depois `database/seed.sql`.
3. Em `.env.local`, defina `ENABLE_MOCK_DATA=false` e preencha as chaves do Supabase.

---

## 🧮 Como funciona o score de risco

Fórmula ponderada e transparente (`lib/services/scoring.ts`). Cada fator vira um sub-score 0–100,
combinado por pesos fixos:

| Fator | Peso |
| --- | --- |
| Chuva acumulada (72h) | 30% |
| Previsão de chuva (7 dias) | 25% |
| Declividade | 15% |
| Relatos da comunidade (gravidade × recência) | 30% |

Faixas: **0–24 baixo · 25–49 médio · 50–74 alto · 75–100 crítico**. Denúncias críticas e recentes
pesam mais. O sistema gera uma **explicação textual** (ex.: _"Risco crítico devido a chuva acumulada
de 92 mm nas últimas 72h, previsão de chuva intensa e 2 relatos recentes de lama e buraco."_).

## 🤖 Como funciona a classificação por IA

Em `lib/services/ai-classifier.ts`. Ao enviar uma denúncia, a categoria e a severidade são
preenchidas automaticamente: com `ANTHROPIC_API_KEY`, o **Claude (multimodal)** analisa foto +
descrição; sem chave, um **fallback por palavras-chave** garante o funcionamento. A resposta segue
o formato `{ categoria, severidade, confianca, justificativa }`. O relatório semanal também pode ser
redigido por IA, com fallback por lógica simples.

## ⏰ Como funciona o cron diário

`POST/GET /api/worker/reprocess-daily` recalcula o score de todos os trechos e registra um log.
É agendado por **Vercel Cron** (`vercel.json`) e/ou **GitHub Actions**
([`.github/workflows/daily-reprocess.yml`](./.github/workflows/daily-reprocess.yml)), protegido por
`CRON_SECRET`.

## ☁️ Deploy (Vercel)

Guia completo passo a passo em **[`DEPLOY.md`](./Docs%20-%20MD/DEPLOY.md)** (GitHub + Supabase + Vercel).
Resumo:

1. Importe o repositório na Vercel.
2. Defina as variáveis de ambiente (mínimo: `ENABLE_MOCK_DATA`; para produção, as do Supabase + `CRON_SECRET`).
3. Deploy — o `vercel.json` já agenda o reprocessamento diário.

---

## 🤝 Uso de Inteligência Artificial

Declaração completa em [`DECLARACAO_IA.md`](./Docs%20-%20MD/DECLARACAO_IA.md) (exigência do edital).

## ✔️ Validação

_Espaço para evidências de validação com usuários/Secretaria/empresa (a preencher pela equipe)._

---

## 🗺️ Roadmap pós-hackathon

- Integração real com Open-Meteo, INMET, OpenStreetMap e SRTM
- Modelo preditivo treinado com histórico real de incidentes
- App mobile / PWA para produtores em campo
- Notificações (WhatsApp/SMS) de alerta preventivo
- Autenticação e perfis (produtor × Secretaria)

## ⚠️ Limitações do MVP

- Dados meteorológicos e de declividade simulados/mockados nesta versão
- Score baseado em fórmula explicável (não em modelo treinado com histórico real)
- Persistência completa requer configuração do Supabase (modo mock não persiste entre instâncias serverless)

## 🔧 Melhorias futuras

- Upload de fotos para Supabase Storage (hoje em data URL no modo demo)
- Histórico temporal do índice por trecho (séries e tendências)
- Roteirização evitando trechos críticos
- Painel público de transparência para a Secretaria

## 📄 Licença

[MIT](./LICENSE).
