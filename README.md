# LinhaMap 🛰️🌧️🚜

> **Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO**
> Inteligência de dados para prevenção de bloqueios em estradas vicinais.

[![Status](https://img.shields.io/badge/status-MVP%20em%20desenvolvimento-orange)]()
[![Hackathon](https://img.shields.io/badge/Hackathon-IFRO%20Ariquemes%202026%2F1-green)]()

---

## 🎓 Identificação (Hackathon Extensionista IFRO Ariquemes 2026/1)

- **Curso/Turma:** Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) — IFRO Campus Ariquemes
- **Categoria:** Desafio Empresa e Comunidade
- **Desafio:** Plataforma Preditiva de Trafegabilidade (Proponente: QUANYX Tecnologia)
- **Equipe:** _a preencher_
- **Integrantes:** _a preencher_

---

## 🛑 Problema

No período chuvoso, as linhas rurais de Ariquemes/RO ficam intransitáveis e comprometem o
transporte de leite, peixe, gado, café, hortaliças e insumos. Hoje a manutenção é **reativa** —
só acontece depois que caminhões atolam ou produtores já tiveram prejuízo. Faltam ferramentas
que cruzem dados de chuva, características das vias e relatos para **antecipar** trechos críticos.

**Público afetado:** produtores rurais (incluindo piscicultores e produtores de leite),
transportadoras, cooperativas e a Secretaria Municipal de Obras.

---

## 💡 Solução

O LinhaMap cruza **previsão de chuva (7 dias)**, **chuva acumulada (72h)**, **declividade**,
**histórico** e **relatos da comunidade** para gerar um **Índice de Trafegabilidade (0–100)** por
trecho, classificando-o em 4 níveis de risco — **Baixo, Médio, Alto, Crítico** — com até 7 dias de
antecedência. O cálculo é **explicável** (fórmula ponderada, não caixa-preta) e gera justificativa
textual e recomendações de ação.

> _Descrição completa do MVP — a preencher conforme as etapas forem implementadas._

---

## 🔗 Links de entrega

- **MVP online:** _a publicar (Etapa 14)_
- **Vídeo de pitch:** _a gravar (Etapa 15)_
- **Apresentação/slides:** _a preparar (Etapa 15)_

---

## ✨ Funcionalidades

- [ ] Landing page de apresentação
- [ ] Mapa de risco interativo (Leaflet) com trechos coloridos
- [ ] Detalhe do trecho (índice, chuva, declividade, relatos, explicação, recomendações)
- [ ] Índice de Trafegabilidade 0–100 explicável
- [ ] Cadastro de denúncia colaborativa (com geolocalização e foto)
- [ ] Classificação automática da denúncia por IA (com fallback por regras)
- [ ] Dashboard da Secretaria (cards, heatmap, filtros, CSV)
- [ ] Relatório semanal
- [ ] Reprocessamento diário automático (GitHub Actions)

---

## 🧱 Stack técnica

| Camada | Tecnologias |
| --- | --- |
| Fullstack | **Next.js (App Router) + TypeScript** — UI e API (Route Handlers) no mesmo projeto |
| UI | TailwindCSS, shadcn/ui, Leaflet (react-leaflet) |
| Banco de dados | Supabase (PostgreSQL + PostGIS) |
| IA | Anthropic Claude (multimodal) com fallback por regras |
| Automação | Cron diário (Vercel Cron / GitHub Actions) |
| Deploy | Vercel (deploy único) |
| Dados públicos | Open-Meteo, OpenStreetMap, SRTM, INMET (preparado para integração) |

> **Arquitetura:** aplicação **100% Next.js**. O backend roda como **Route Handlers**
> (`app/api/...`) no mesmo deploy do frontend — sem servidor Python separado.

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

### Banco de dados (Supabase) — opcional
```bash
# Quando houver um projeto Supabase, executar no SQL Editor, nesta ordem:
# 1) database/schema.sql   (estrutura das tabelas)
# 2) database/seed.sql     (dados mockados de Ariquemes)
# e definir ENABLE_MOCK_DATA=false + as chaves no .env.local
```

---

## ⚙️ Variáveis de ambiente

Veja [`.env.example`](./.env.example). O sistema **funciona sem chaves de IA**: quando
`ANTHROPIC_API_KEY` não está definida, a classificação usa fallback por regras de texto.

---

## 🧮 Como funciona o score de risco

> _A documentar na Etapa 3._ Resumo: fórmula ponderada combinando chuva prevista, chuva
> acumulada em 72h, declividade, quantidade de relatos recentes e severidade das denúncias.
> Faixas: `0–24 baixo` · `25–49 médio` · `50–74 alto` · `75–100 crítico`.

## 🤖 Como funciona a classificação por IA

> _A documentar na Etapa 5._ Classifica a denúncia (categoria + severidade) por imagem/descrição;
> usa Claude multimodal se houver chave, ou fallback por palavras-chave caso contrário.

## ⏰ Como funciona o cron diário

> _A documentar na Etapa 13._ Workflow do GitHub Actions que reprocessa os trechos diariamente,
> recalcula scores e registra log.

---

## 🤝 Uso de Inteligência Artificial

Consulte [`docs/DECLARACAO_IA.md`](./docs/DECLARACAO_IA.md) para a declaração das ferramentas de IA
utilizadas e suas finalidades (exigência do edital).

---

## 🗺️ Roadmap pós-hackathon

- Integração real com Open-Meteo, INMET, OpenStreetMap e SRTM
- Modelo preditivo treinado com histórico real de incidentes
- App mobile / PWA para produtores em campo
- Notificações (WhatsApp/SMS) de alerta preventivo
- Painel público para a Secretaria de Obras

## ⚠️ Limitações do MVP

- Dados meteorológicos e de declividade simulados/mockados na versão de hackathon
- Score baseado em fórmula explicável (não em modelo treinado com histórico real)

---

## 📄 Licença

_A definir (ex.: MIT)._
