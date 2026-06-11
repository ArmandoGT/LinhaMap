# Declaração de Uso de Inteligência Artificial

> Documento obrigatório conforme **Seção 8 do Edital** (Hackathon Extensionista IFRO Ariquemes
> 2026/1). Omitir uso relevante de IA pode levar à desclassificação (Seção 18, item "d").

Este projeto utilizou ferramentas de Inteligência Artificial como apoio ao desenvolvimento. Abaixo,
a declaração transparente das ferramentas, finalidades, partes do projeto apoiadas e as validações
feitas pela equipe.

---

## 1. Ferramentas de IA utilizadas

| Ferramenta | Finalidade | Partes do projeto apoiadas |
| --- | --- | --- |
| Claude (Anthropic) — Claude Code | Arquitetura, geração e revisão de código, documentação | Backend, frontend, SQL, README, scripts |
| Claude (Anthropic) — API multimodal | Classificação automática de denúncias por imagem/descrição (em runtime) | Endpoint `POST /ai/classify-report` |
| Claude (Anthropic) — API de texto | Geração do resumo semanal para a Secretaria (em runtime) | Endpoint `POST /ai/generate-weekly-summary` |

> _Atualize esta tabela caso outras ferramentas (geração de imagens, etc.) sejam usadas._

---

## 2. IA dentro do produto (em runtime)

O LinhaMap usa IA de forma **explicável e opcional**:

1. **Classificação de denúncias:** recebe foto/descrição e retorna categoria (buraco, lama, erosão,
   ponte danificada, atolamento, outro) + severidade, em formato JSON.
2. **Relatório semanal:** gera resumo textual das ocorrências para a Secretaria de Obras.

> **Funciona sem IA:** quando não há `ANTHROPIC_API_KEY` configurada, o sistema usa **fallback por
> regras** (palavras-chave na descrição), garantindo que o MVP rode mesmo sem chaves externas.

O **Índice de Trafegabilidade** NÃO usa modelo caixa-preta: é uma **fórmula ponderada explicável**,
em conformidade com a regra de negócio de transparência (Seção 10 do LinhaMap).

---

## 3. Adaptações, revisões e validações da equipe

- [ ] Todo o código gerado por IA foi **lido, compreendido e testado** pela equipe.
- [ ] A equipe é capaz de **explicar e defender tecnicamente** cada parte da solução.
- [ ] Nenhum dado sigiloso, credencial ou chave de API foi inserido em ferramentas externas.
- [ ] _Descrever aqui ajustes manuais relevantes feitos sobre o código gerado._

---

_Última atualização: a preencher pela equipe._
