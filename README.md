# LinhaMap 🛰️🌧️🚜

> **Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO**
> Inteligência de dados para prevenção de bloqueios em estradas vicinais.

[![Testes e validação](https://github.com/ArmandoGT/LinhaMap/actions/workflows/tests.yml/badge.svg)](https://github.com/ArmandoGT/LinhaMap/actions/workflows/tests.yml)
[![Status](https://img.shields.io/badge/status-MVP%20funcional-success)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20TypeScript-black)]()
[![Hackathon](https://img.shields.io/badge/Hackathon-IFRO%20Ariquemes%202026%2F1-green)]()

---

## 🎓 Identificação

- **Curso/Turma:** Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) — IFRO Campus Ariquemes
- **Categoria:** Desafio Empresa e Comunidade
- **Desafio:** Plataforma Preditiva de Trafegabilidade (Proponente: QUANYX Tecnologia)
- **Equipe:** 3 Hacketeers
- **Integrantes:** Armando Giordani Trassi, Leandro Pires de Moraes Filho e Pedro Felipe Vieira Gouveia

## 🔗 Links de entrega

- **MVP online:** **https://linha-map.vercel.app**
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
- ✅ **Alertas + "seguir trecho"**: avisa quando um trecho acompanhado piora (central de notificações; e-mail/WhatsApp simulados)
- ✅ **Melhor janela para escoar**: melhor dia dos próximos 7 para transportar a produção
- ✅ **Ordens de serviço**: trecho crítico/denúncia → manutenção; concluir resolve denúncias e baixa o risco
- ✅ **Consulta de trajeto A→B**: risco agregado do caminho (limitado pelo pior trecho) + melhor janela
- ✅ API REST completa (Route Handlers)

## 🖥️ Telas

| Tela | Descrição |
| --- | --- |
| **Início** (`/`) | Apresenta o projeto, o problema, o público e como funciona; CTAs para mapa e denúncia. |
| **Mapa** (`/mapa`) | Linhas vicinais coloridas por risco; clique no trecho abre o painel com índice, chuva, declividade, relatos, explicação e recomendações. |
| **Denúncia** (`/denuncia`) | Formulário com GPS automático, upload de foto e classificação automática por IA. |
| **Dashboard** (`/dashboard`) | Cards de resumo, trechos prioritários, mapa de calor, tabela filtrável e exportação CSV. |
| **Relatórios** (`/relatorios`) | Relatório semanal textual + indicadores, com copiar/imprimir. |
| **Trajeto** (`/trajeto`) | Seleciona os trechos do caminho e mostra a passabilidade do trajeto + melhor janela. |
| **Ordens** (`/ordens`) | Quadro de ordens de serviço (agendada → em execução → concluída) da Secretaria. |
| **Alertas** (`/notificacoes`) | Central de notificações dos trechos acompanhados. |
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
| Dados públicos | **Open-Meteo (chuva real, integrado)**, OpenStreetMap (geometria das linhas); SRTM/INMET preparados para integração |

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

### Testes automatizados
```bash
npm test         # suíte por funcionalidade: caminho feliz + erro/valor-limite
npm run verify   # checagem de paridade do núcleo (score/classificação/repositório)
```

---

## ⚙️ Variáveis de ambiente

Veja [`.env.example`](./.env.example). O sistema **funciona sem nenhuma chave** (modo mock).

| Variável | Função |
| --- | --- |
| `ENABLE_MOCK_DATA` | `true` (padrão) usa dados em memória; `false` usa Supabase |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Conexão server-side com o Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente (browser) |
| `OPEN_METEO_BASE_URL` | Endpoint do Open-Meteo |
| `ENABLE_WEATHER` | `true` (padrão) busca chuva real no reprocessamento; `false` para demo offline |
| `ANTHROPIC_API_KEY` / `ENABLE_AI_CLASSIFICATION` | Liga a classificação por IA (senão, fallback) |
| `CRON_SECRET` | Protege o endpoint do worker no cron |
| `DEMO_MODE` | `true` congela os níveis curados (painel mostra valor armazenado; cron não sobrescreve) — útil para a apresentação |

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

`POST/GET /api/worker/reprocess-daily` **atualiza a chuva real de cada trecho via Open-Meteo**
(acumulado 72h + previsão 7d), recalcula o score de todos os trechos e registra um log.
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

## 🧪 Testes e validação

> Seção da disciplina **Teste de Software** (Hackathon IFRO Ariquemes 2026/1). A pergunta da
> banca não é só _"funciona?"_, mas _"como vocês sabem que funciona?"_. Abaixo está a resposta.

### O que significa "funcionar" (oráculo)

O coração do LinhaMap é uma **regra explicável** que converte chuva, declividade e relatos em um
**Índice de Trafegabilidade (0–100)** e em um **nível de risco**. "Funcionar corretamente" significa:

- o **score é determinístico** e reproduzível pela fórmula ponderada (não é caixa-preta);
- o **nível segue as faixas fixas**: `0–24 baixo · 25–49 médio · 50–74 alto · 75–100 crítico`;
- toda classificação de denúncia retorna um **contrato válido** `{ categoria, severidade }`, mesmo
  sem IA (fallback por regras) — nunca derruba o cadastro;
- registrar uma denúncia **recalcula** o risco do trecho.

O **oráculo** são esses valores esperados, codificados como asserções em `scripts/test-suite.ts`.

### Plano mínimo de teste

Aplicamos **Análise de Valor-Limite** e **Particionamento de Equivalência** (BSTQB 2023, Cap. 6):
cobrimos o caminho feliz **e** as bordas/erros das funções críticas.

| Funcionalidade | O que deve acontecer (oráculo) | Caminho feliz (entrada → saída) | Erro / borda (entrada → saída) | Evidência |
| --- | --- | --- | --- | --- |
| **Índice de Trafegabilidade** | Score 0–100 e nível pela faixa correta | Ponte do Branco (92mm, 140mm, 8,5%, 2 relatos) → **92 / crítico** | Chuva acumulada **83mm → baixo** e **84mm → médio** (demais fatores nulos); entrada vazia → **0 / baixo**; chuva negativa → saneada (clamp) | `npm test` (F1) |
| **Classificação da denúncia** | Sempre devolve `{categoria, severidade}` válidos | _"ponte cedendo, grave"_ → **ponte_danificada / crítica** | Texto sem palavra-chave ou vazio/nulo → **"outro"** (degrada com segurança) | `npm test` (F2) |
| **Recalcular risco ao denunciar** | Denúncia incrementa contagem e recalcula | `createReport` em trecho baixo → **reports_count +1** | Denúncia crítica e recente em trecho baixo → **risco sobe de nível** | `npm test` (F3) |

> **Caso de borda mais importante** (orientação do roteiro para a categoria _Empresa e Comunidade_):
> mantendo os demais fatores nulos, o trecho cruza de **Baixo para Médio entre 83 mm e 84 mm** de
> chuva acumulada (score 24,9 → 25,2). Esse limite é testado automaticamente.

### Como executar e evidência

```bash
npm test         # 15 casos (caminho feliz + erro/valor-limite), com relatório PASS/FAIL
npm run verify   # checagem de paridade do motor de score
npx tsc --noEmit # verificação estática de tipos
```

A suíte roda também em **Integração Contínua** a cada `push`/PR
([`.github/workflows/tests.yml`](./.github/workflows/tests.yml)); o resultado fica na aba **Actions**
e no **selo no topo deste README** — essa é a evidência versionada de que a solução funciona.

### Reflexão (Sprint 4)

Ter testes passando **não prova** que o sistema está 100% correto — prova que os comportamentos
especificados no oráculo se mantêm. Por isso priorizamos os **valores-limite** (onde os defeitos se
escondem) e a **validação com usuário real** abaixo, e não apenas o caminho feliz.

### Validação com usuários

_Espaço para evidências de validação com produtores/Secretaria/empresa proponente — registrar aqui
data, participante e retorno (a preencher pela equipe)._

## 🤝 Uso de Inteligência Artificial

Declaração completa em [`DECLARACAO_IA.md`](./Docs%20-%20MD/DECLARACAO_IA.md) (exigência do edital):
ferramentas usadas, finalidade, partes do projeto apoiadas e o que a equipe revisou/validou.

---

## 🗺️ Roadmap pós-hackathon

- Integração real com Open-Meteo, INMET, OpenStreetMap e SRTM
- Modelo preditivo treinado com histórico real de incidentes
- App mobile / PWA para produtores em campo
- Notificações (WhatsApp/SMS) de alerta preventivo
- Autenticação e perfis (produtor × Secretaria)

## ⚠️ Limitações do MVP

- Chuva (acumulada 72h + previsão 7d) vem **real do Open-Meteo** no reprocessamento; **declividade** ainda é mockada
- Score baseado em fórmula explicável (não em modelo treinado com histórico real)
- Persistência completa requer configuração do Supabase (modo mock não persiste entre instâncias serverless)

## 🔧 Melhorias futuras

- Upload de fotos para Supabase Storage (hoje em data URL no modo demo)
- Histórico temporal do índice por trecho (séries e tendências)
- Roteirização evitando trechos críticos
- Painel público de transparência para a Secretaria

## 📄 Licença

[MIT](./LICENSE).