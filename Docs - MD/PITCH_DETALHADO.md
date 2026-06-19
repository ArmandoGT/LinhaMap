# Pitch detalhado — LinhaMap (apresentação presencial 26/06)

> **Categoria:** Desafio Empresa e Comunidade · **Proponente:** QUANYX Tecnologia
> **Equipe:** 3 Hacketeers — Armando Giordani Trassi, Leandro Pires de Moraes Filho, Pedro Felipe Vieira Gouveia
> **MVP:** https://linha-map.vercel.app

Este roteiro cobre **todos os critérios pontuados** do edital (100 pts): problema/aderência
extensionista (20), MVP online (20), validação/impacto (20), uso de IA (10), qualidade
técnica/documentação (10), usabilidade/acessibilidade (10), pitch/defesa (10). Cada bloco
abaixo marca **[qual critério ele ataca]**.

**Duração alvo:** ~6 min de fala + demo ao vivo + perguntas. Divida as falas entre os 3.

---

## 0. Antes de subir (checklist de palco)
- [ ] MVP aberto numa aba: `linha-map.vercel.app` (e já logado como Secretaria noutra aba).
- [ ] WhatsApp do agente: **n8n self-host LIGADO** + sessão WAHA conectada → testar 1 msg antes.
- [ ] Celular pronto pra mostrar o **PWA** e a **denúncia por WhatsApp** ao vivo.
- [ ] Slides abertos (se houver). Internet de backup (4G).
- [ ] Plano B se a net cair: vídeo de pitch gravado + prints.

---

## 1. Gancho / abertura (~30s) — [pitch]
> "Imaginem um caminhão de leite atolado numa estrada de terra em Ariquemes, no meio do
> inverno amazônico. O leite azeda, o produtor perde a renda do mês, e a prefeitura só descobre
> o problema **depois** que o estrago já aconteceu. Isso se repete **toda** estação chuvosa."

Pausa. "E se desse pra saber **7 dias antes** qual trecho vai colapsar?"

> "Esse é o **LinhaMap** — e ele já está no ar, funcionando."

## 2. O problema (~45s) — [relevância + aderência extensionista: 20 pts]
- Em Ariquemes, as **linhas vicinais** (C-65, C-70 e ramais) ficam **intransitáveis** na chuva,
  travando o escoamento de **leite, peixe, gado, café e hortaliças**.
- Hoje a manutenção é **reativa**: só age depois do atolamento/isolamento. **Falta** ferramenta
  que cruze **chuva, características da via e relatos** para **antecipar** os trechos críticos.
- **Quem sofre:** produtores (piscicultores, pecuaristas, leite), transportadoras, cooperativas
  e a **Secretaria de Obras**.
- **Aderência extensionista:** é um problema **real**, trazido pela **QUANYX Tecnologia**, que
  conecta o IFRO ao setor produtivo e ao poder público local.

## 3. A solução em uma frase (~20s) — [pitch]
> "O LinhaMap cruza **previsão de chuva (7 dias)**, **chuva acumulada (72h)**, **declividade** e
> **relatos da comunidade** e gera um **Índice de Trafegabilidade de 0 a 100** por trecho — com
> explicação do **porquê** — para a manutenção virar **preventiva**, não reativa."

## 4. Demonstração ao vivo (~2min30) — [MVP online: 20 pts | usabilidade: 10 pts]
> Mostre rodando de verdade (não localhost). Narre cada clique.

1. **Mapa de risco** (`/mapa`): "Cada linha é colorida por risco — verde a vermelho." Clique no
   **Ponte do Branco (C-65, crítico)** → painel: índice, chuva 72h, previsão, declividade, relatos,
   **explicação textual** e **recomendações**. → *"Não é caixa-preta: o sistema diz **por que**."*
2. **Denúncia (web)** (`/denuncia`): preencha rápido, use **"Usar minha localização"**, mande.
   → tela de sucesso com a **categoria classificada pela IA**. *"O produtor relata; a IA entende."*
3. **★ Denúncia por WhatsApp (diferencial):** do celular, mande
   `linhamap-hackathon muita lama na ponte da C-65` → o bot responde confirmando.
   → *"O produtor **nem precisa do app** — denuncia pelo Zap, do jeito que ele já usa."*
4. **Dashboard da Secretaria** (`/dashboard`): cards, **mapa de calor**, **trechos prioritários**,
   filtros e **exportar CSV**; e o **relatório semanal** (`/relatorios`) pronto pra ofício.
   → *"A gestão prioriza com dados — e tem documento pronto pra ata."*

## 5. Diferenciais (~45s) — [qualidade técnica + usabilidade: 20 pts]
- **Explicável:** fórmula ponderada transparente (chuva 72h 30% · previsão 25% · declividade 15%
  · relatos 30%), com justificativa em texto. Não é "caixa-preta".
- **Acessível ao produtor real:** denúncia por **WhatsApp** (agente n8n + WAHA) e **PWA offline**
  — o caminhoneiro **sem sinal** registra e o app envia sozinho quando a conexão volta.
- **Robusto:** roda em **modo demo** sem banco e a IA tem **fallback por regras** — nunca quebra.
- **Pronto pra gestão pública:** CSV + relatório semanal; papéis (produtor × Secretaria).

## 6. Uso de Inteligência Artificial (~30s) — [uso responsável de IA: 10 pts]
> Exigência do edital — seja transparente.
- **Claude (Anthropic)** classifica a denúncia (foto + texto → categoria/severidade) e ajuda a
  redigir o relatório; **com fallback por regras** se a IA estiver indisponível.
- **Claude Code** apoiou desenvolvimento, documentação e testes.
- A equipe **revisou, testou e adaptou** tudo; **nenhuma credencial** foi exposta em ferramenta
  pública. Declaração completa em `Docs - MD/DECLARACAO_IA.md`.

## 7. O que funciona × o que ainda não (~30s) — [transparência: exigência do pitch]
**Funciona hoje:** mapa + índice explicável; denúncia web, **WhatsApp** e **offline (PWA)**;
classificação por IA; dashboard + relatório; **chuva real** do Open-Meteo; deploy online.
**Ainda não / próximos passos:** **declividade** ainda curada (script de topografia pronto);
score por **fórmula** (não modelo treinado com histórico); foto fica como data URL (Storage no
roadmap).

## 8. Validação (~30s) — [impacto/validação: 20 pts]
> **Ponto que mais agrega nota — não pule.** Conte o que vocês fizeram de real:
- Feedback do **professor/orientador** que ajustou a linguagem da tela do produtor (criamos o
  `/resumo` em linguagem leiga após esse retorno).
- Desafio **trazido pela QUANYX** (empresa real) — aproximação com o proponente.
- _(Se conseguirem até 26/06: uma fala curta de um produtor/cooperativa ou da Secretaria.)_

## 9. Encerramento (~20s) — [pitch]
> "LinhaMap: menos prejuízo na lavoura, mais estrada aberta e uma Secretaria que age **antes**
> do problema. Está no ar, é explicável e foi pensado pra quem vive a estrada. Obrigado."

---

## 10. Perguntas prováveis da banca (prepare as respostas)
- **"De onde vêm os dados de chuva?"** → Open-Meteo (real, integrado, grátis); reprocessa todo dia.
- **"A declividade é real?"** → Hoje é curada na demo; há script que calcula por topografia
  (Open-Meteo Elevation) — é coerência intencional pra apresentação.
- **"Como garante que funciona?"** → 24 testes automatizados (valor-limite + caminho feliz) +
  CI a cada push (selo no README).
- **"E se o produtor não tem internet/app?"** → Denúncia por **WhatsApp** e **PWA offline-first**.
- **"Usaram IA? O que é de vocês?"** → Sim, declarado; a equipe revisou/testou/adaptou tudo.
- **"Isso escala/continua?"** → Arquitetura simples (Next.js + Supabase + n8n self-host);
  roadmap com modelo preditivo e Storage. Sem promessa de implantação em nome do IFRO.

## 11. Divisão sugerida das falas (3 integrantes)
- **Pessoa A:** gancho + problema + encerramento.
- **Pessoa B:** demo ao vivo (mapa, denúncia, WhatsApp, dashboard).
- **Pessoa C:** diferenciais + IA + o-que-funciona + validação + Q&A técnico.

> **Regra de ouro:** mostrar o **MVP rodando online** vale 20 pts — a demo ao vivo é o coração.
> Se a internet falhar, caia no **vídeo de pitch** gravado (tenha-o aberto).
