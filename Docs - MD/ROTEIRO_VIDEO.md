# Roteiro de gravação — Vídeo de Pitch (LinhaMap)

> **Obrigatório** para a categoria _Empresa e Comunidade_. O edital exige que o vídeo apresente:
> **a solução completa**, as **ferramentas utilizadas**, o **uso de IA**, e **o que funciona e o
> que ainda não funciona**. Este roteiro cobre todos esses pontos.

- **Duração alvo:** ~3 minutos (máx. ~3:30).
- **Formato:** gravação de tela do **MVP rodando online** (`linha-map.vercel.app`) + narração.
- **MVP:** https://linha-map.vercel.app

---

## Antes de gravar (checklist)
- [ ] **n8n self-host LIGADO** + sessão WAHA conectada → testar 1 mensagem antes.
- [ ] Abas prontas: `/mapa`, `/denuncia`, `/dashboard`, `/relatorios` (e logado como Secretaria).
- [ ] Celular com o **WhatsApp** e o **PWA** prontos (pra cena do diferencial).
- [ ] Fechar notificações/abas pessoais; **modo não perturbe**; cursor visível.
- [ ] **Áudio:** ambiente silencioso, fone com microfone; teste o volume antes.
- [ ] Resolução de tela 1080p; navegador limpo (sem barra de favoritos pessoais).
- [ ] Ter o **texto da narração à mão** (ou gravar por partes e juntar).

---

## Estrutura: TELA/AÇÃO (o que aparece) + FALA (o que você narra)

### 🎬 Cena 1 — Gancho · 0:00–0:15
**[TELA]** Foto/imagem de **caminhão atolado** em estrada de terra (ou abertura com o logo LinhaMap).
**[FALA]**
> "Em Ariquemes, toda chuva forte as estradas de terra viram lama — e o leite, o peixe e o café
> ficam presos na propriedade. Hoje, a prefeitura só age **depois** que o caminhão atola."

### 🎬 Cena 2 — Problema + público · 0:15–0:35
**[TELA]** Landing page (`/`) ou slide com os ícones do público (produtor, transportador, Secretaria).
**[FALA]**
> "Esse é um desafio **real**, trazido pela empresa **QUANYX Tecnologia**. Afeta produtores,
> transportadoras, cooperativas e a Secretaria de Obras, que não tem dados pra priorizar a
> manutenção das linhas vicinais, como a C-65 e a C-70."

### 🎬 Cena 3 — A solução · 0:35–0:50
**[TELA]** Logo LinhaMap + a frase "Índice de Trafegabilidade 0–100, com 7 dias de antecedência".
**[FALA]**
> "O **LinhaMap** cruza previsão de chuva, chuva acumulada, declividade e os relatos da
> comunidade, e gera um **índice de risco de 0 a 100** por trecho — antecipando o bloqueio em até
> **7 dias**. A manutenção vira **preventiva**."

### 🎬 Cena 4 — Demo: Mapa explicável · 0:50–1:10
**[TELA]** `/mapa` → clicar no trecho **Ponte do Branco (C-65, crítico)** → abrir o painel.
**[FALA]**
> "No mapa, cada linha é colorida por risco. Clicando num trecho crítico, o sistema mostra o
> índice **e a explicação do porquê**: chuva, declividade e relatos. Não é caixa-preta."

### 🎬 Cena 5 — Demo: Denúncia + IA · 1:10–1:30
**[TELA]** `/denuncia` → preencher rápido, "Usar minha localização", enviar → tela de sucesso com a categoria.
**[FALA]**
> "O produtor relata um problema e toca em 'usar minha localização'. Ao enviar, a **inteligência
> artificial da Anthropic, o Claude**, classifica a categoria e a gravidade automaticamente."

### 🎬 Cena 6 — Demo: ★ WhatsApp + offline (diferencial) · 1:30–1:55
**[TELA]** Celular: mandar no WhatsApp `linhamap-hackathon muita lama na ponte da C-65` → resposta do bot. Mostrar o banner "Modo Offline" do app.
**[FALA]**
> "E o diferencial: o produtor **nem precisa do aplicativo**. Ele denuncia pelo **WhatsApp**, do
> jeito que já usa — um agente recebe, entende e registra. E se ele estiver **sem sinal** na
> estrada, o app guarda a denúncia e envia sozinho quando a internet volta."

### 🎬 Cena 7 — Demo: Dashboard da Secretaria · 1:55–2:20
**[TELA]** `/dashboard` (mapa de calor, trechos prioritários, CSV) e `/relatorios` (relatório semanal).
**[FALA]**
> "Do lado da gestão, a Secretaria vê um mapa de calor, os trechos prioritários, exporta os dados
> em CSV e já tem um **relatório semanal** pronto pra ofício. Decisão baseada em dados."

### 🎬 Cena 8 — Ferramentas + Uso de IA · 2:20–2:40
**[TELA]** Slide/tela listando a stack + a declaração de IA (ou `DECLARACAO_IA.md` no GitHub).
**[FALA]**
> "Por baixo: **Next.js e TypeScript**, banco **Supabase**, chuva real do **Open-Meteo**, e o
> agente de WhatsApp em **n8n self-hosted com WAHA**. A IA — **Claude** — classifica as denúncias
> e apoiou nosso desenvolvimento; **a equipe revisou e testou tudo**, e nada de credenciais
> expostas. A declaração completa está no GitHub."

### 🎬 Cena 9 — O que funciona × o que ainda não · 2:40–2:55
**[TELA]** Duas colunas: ✅ Funciona | 🔧 A melhorar.
**[FALA]**
> "Sendo transparentes: **funciona hoje** todo o fluxo — mapa, denúncia web, WhatsApp e offline,
> IA, dashboard e chuva real. **Ainda vamos evoluir** a declividade real e um modelo preditivo com
> histórico de incidentes."

### 🎬 Cena 10 — Encerramento · 2:55–3:05
**[TELA]** Logo + QR Code do MVP + "Obrigado!" + nomes da equipe.
**[FALA]**
> "LinhaMap: menos prejuízo na lavoura, mais estrada aberta, e uma Secretaria que age **antes** do
> problema. Está no ar — podem testar pelo link. Obrigado!"

---

## Especificações técnicas
- **Gravação de tela:** OBS Studio, ShareX, ou a gravação nativa (Win+G no Windows, ou Xbox Game Bar).
- **Resolução:** 1920×1080, 30fps.
- **Edição (se precisar):** CapCut, Clipchamp ou DaVinci Resolve (grátis).
- **Áudio:** grave a narração separada se a leitura ao vivo travar; sincronize na edição.
- **Onde hospedar:** YouTube (não listado/público) ou Google Drive (link com acesso a "qualquer
  pessoa com o link") → colar o link no **README** (campo "Vídeo de pitch").

## Dicas de gravação
- Mostre o **MVP online de verdade** (não localhost) — é o que prova que funciona.
- Fale com **calma e clareza**; melhor 3:10 bem narrado do que 2:30 atropelado.
- Se errar uma cena, **regrave só aquela cena** e junte na edição.
- **Cite a IA** (exigência do edital) — está na Cena 8.
- Diga **o que funciona e o que não** (exigência do edital) — está na Cena 9.
- Termine com o **QR Code / link** pra banca testar.
