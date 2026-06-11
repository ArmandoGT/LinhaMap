# LinhaMap — Plano de Ação Sequencial (MVP Hackathon)

> **Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO**
> Hackathon Extensionista IFRO Ariquemes 2026/1 — Categoria: **Desafio Empresa e Comunidade**
> Documento de arquitetura — *nenhum código gerado ainda*.

---

## ✅ Confirmação de Entendimento

**O produto (LinhaMap):** plataforma web preditiva que cruza chuva prevista (7 dias), chuva acumulada (72h), declividade, histórico e relatos da comunidade para classificar trechos de linhas vicinais em **4 níveis de risco** (Baixo / Médio / Alto / Crítico) via um **Índice de Trafegabilidade de 0 a 100**. Objetivo: trocar manutenção reativa por preventiva.

### Regras de negócio centrais (Seção 10) — invariantes do sistema
- Score sempre entre **0–100**, mapeado para nível: `0–24 baixo` · `25–49 médio` · `50–74 alto` · `75–100 crítico`.
- Risco precisa ser **explicável** (fórmula ponderada, não caixa-preta) e gerar justificativa textual.
- Denúncias **críticas e recentes pesam mais**; chuva 72h e previsão 7 dias têm peso forte.
- O sistema **deve funcionar sem chaves de IA**, via dados mockados + fallback por regras.

### Contexto da competição (Edital) que molda a arquitetura
- **Categoria/Desafio:** Empresa e Comunidade — "Plataforma Preditiva de Trafegabilidade" (proponente QUANYX Tecnologia).
- ⏰ **Prazo:** repositório GitHub até **23h59 de 19/06/2026**. Culminância presencial em **26/06/2026**.
- 🌐 **Requisito eliminatório:** MVP precisa estar **online e acessível, sem instalação local pela banca** (Seção 9 do edital). Deploy não é opcional.
- 📄 **Entregáveis obrigatórios:** README no modelo do Anexo II, link do MVP online, **vídeo de pitch**, declaração das ferramentas de IA usadas, evidências de validação. *Omitir uso de IA = desclassificação.*

### Distribuição de pontos (100)
| Critério | Pontos |
| --- | --- |
| Relevância do problema e aderência extensionista | 20 |
| MVP ou protótipo funcional online | 20 |
| Impacto, validação, prospecção ou tentativa de implantação | 20 |
| Uso responsável e produtivo de IA | 10 |
| Qualidade técnica, organização do código e documentação no GitHub | 10 |
| Usabilidade, acessibilidade e experiência do usuário | 10 |
| Pitch, clareza da apresentação e defesa da solução | 10 |

> **Leitura de arquiteto:** o edital recompensa fortemente um MVP **realmente no ar + validação + pitch**, não só código. Por isso o plano prioriza ter algo **deployado e demonstrável cedo** e reserva etapas explícitas para deploy, README/declaração de IA e material de pitch — onde muitas equipes perdem 50+ pontos.

---

## 🗺️ Plano de Ação Sequencial

Cada etapa é curta e autossuficiente. Peça **"execute a Etapa X"** no próximo prompt. Há dependências: **banco → backend → frontend → deploy**.

### Fundação

#### Etapa 0 — Scaffolding do monorepo & governança
- Criar estrutura de pastas (`frontend/`, `backend/`, `database/`, `.github/workflows/`) conforme Seção 13.
- `.gitignore`, `.env.example` (Seção 15), README esqueleto no **modelo do Anexo II** e arquivo de **declaração de uso de IA**.
- Inicializar git e definir convenção de commits.

#### Etapa 1 — Banco de dados (Supabase + PostgreSQL/PostGIS)
- `database/schema.sql`: tabelas `road_segments`, `reports`, `weather_snapshots`, `processing_logs` (Seção 8).
- `database/seed.sql`: dados mock de Ariquemes (Linhas C-65, C-70, C-60, C-75, TB-40 + ramais) com geometria, chuva, declividade, score e nível.
- Validar criação no projeto Supabase real para garantir reprodutibilidade.

### Backend (FastAPI)

#### Etapa 2 — Esqueleto do backend
- `main.py`, `config.py`, `database.py`, `models/`, `schemas/` — conexão Supabase, CORS, healthcheck; organização em rotas/serviços/modelos/schemas.

#### Etapa 3 — Motor do Índice de Trafegabilidade (coração explicável)
- Serviço de cálculo do score 0–100 com pesos para chuva prevista, chuva 72h, declividade, nº de relatos e severidade.
- Conversão para nível + **gerador de explicação textual** (Seções 6.3 e 10). É a propriedade intelectual técnica que sustenta o pitch.

#### Etapa 4 — API de Trechos e Denúncias (CRUD)
- `GET/POST/PUT/DELETE /segments`, `POST /segments/recalculate`.
- `GET/POST/PUT/DELETE /reports`, `PATCH /reports/{id}/status` (Seção 9).

#### Etapa 5 — Camada de IA (com fallback garantido)
- `POST /ai/classify-report`: classificação multimodal via Claude se houver `ANTHROPIC_API_KEY`; **fallback por regras de descrição** caso contrário, retornando JSON `{categoria, severidade, confianca, justificativa}` (Seção 6.5).
- `POST /ai/generate-weekly-summary`: resumo por LLM ou lógica simples.

#### Etapa 6 — Dashboard, Relatório e Worker
- `GET /dashboard/{summary, critical-segments, reports-by-category, weekly-report, export-csv}`.
- `POST /worker/reprocess-daily`: busca/simula chuva → recalcula scores → atualiza níveis → grava `processing_logs`.

### Frontend (Next.js + Tailwind + shadcn/ui + Leaflet)

#### Etapa 7 — Setup & design system
- Next.js (App Router) + TS + Tailwind + shadcn/ui; layout base, paleta de risco (verde/amarelo/laranja/vermelho + neutros), identidade rural-tecnológica, camada de `services/` para consumir a API.

#### Etapa 8 — Landing Page (Seção 6.1)
- O quê, problema, para quem, como funciona, benefícios, CTAs para Mapa e Denúncia.

#### Etapa 9 — Mapa de Risco + Detalhe do Trecho (Seção 6.2)
- `react-leaflet` adaptado para SSR, trechos coloridos por risco.
- Painel/modal com todos os campos do trecho: índice, chuva, declividade, relatos, explicação e recomendações.

#### Etapa 10 — Cadastro de Denúncia Colaborativa (Seção 6.4)
- Formulário com geolocation automática + manual, upload de foto, integração com a classificação por IA, atualização do painel.

#### Etapa 11 — Dashboard da Secretaria (Seção 6.6)
- Cards de resumo, lista priorizada de críticos, mapa de calor, tabela, filtros, exportar CSV e gerar relatório.

#### Etapa 12 — Relatórios + Sobre/Configurações (Seções 6.7 e 11)
- Tela de relatório semanal pronto para ata/ofício e a 7ª tela (Sobre o projeto).

### Automação, Deploy e Entrega

#### Etapa 13 — GitHub Actions (cron diário)
- `.github/workflows/daily-reprocess.yml` chamando o reprocessamento e atualizando scores diariamente (Seção 6.8).

#### Etapa 14 — Deploy do MVP online *(crítico para o edital)*
- Frontend na Vercel, backend FastAPI (Render/Railway/Fly) e Supabase gerenciado.
- Smoke test end-to-end no ambiente público. Garante os 20 pts de "MVP funcional online" e a não-desclassificação.

#### Etapa 15 — Pacote de entrega & pitch
- README final completo (Seção 14 + Anexo II), declaração de ferramentas de IA, evidências de validação.
- Varredura nos **critérios de aceite (Seção 17)**, pitch curto e roteiro do vídeo de demonstração.

---

## 📅 Referência rápida de prazos

| Marco | Data |
| --- | --- |
| Hoje | 11/06/2026 |
| Submissão do repositório GitHub | **19/06/2026, 23h59** |
| Culminância presencial / apresentação | 26/06/2026 |

---

*Para iniciar o desenvolvimento, peça: **"execute a Etapa 0"**.*
