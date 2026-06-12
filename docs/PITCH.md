# Pitch — LinhaMap

## 🎤 Pitch curto (elevator, ~30s)

> Em Ariquemes, toda estação chuvosa as estradas vicinais viram lama e o leite, o peixe e o café
> não conseguem sair das propriedades. Hoje a prefeitura só conserta **depois** que o caminhão
> atola. O **LinhaMap** vira esse jogo: cruzando previsão de chuva, declividade e relatos dos
> próprios produtores, ele calcula um **Índice de Trafegabilidade de 0 a 100** para cada trecho e
> avisa, com **7 dias de antecedência**, onde o bloqueio vai acontecer — para que a manutenção
> seja **preventiva**, não reativa. Tudo explicável, em um mapa simples, e funcionando hoje.

## 🧩 O problema (10s)

Manutenção reativa = prejuízo. Produção perecível perdida, custo logístico maior, propriedades
isoladas e a Secretaria sem dados para priorizar.

## 💡 A solução (20s)

Uma plataforma web que:
1. Calcula um **score explicável** por trecho (chuva 72h, previsão 7d, declividade, relatos).
2. Mostra tudo num **mapa de risco** colorido (verde → vermelho).
3. Deixa o produtor **denunciar** um problema com foto — a **IA classifica** e o risco se atualiza.
4. Dá à Secretaria um **dashboard** com prioridades, mapa de calor e **relatório semanal** pronto
   para ofício.

## 🌟 Diferenciais

- **Explicável, não caixa-preta:** o sistema diz *por que* um trecho é crítico (peso de cada fator).
- **Funciona sem depender de nada:** roda em modo demonstração sem banco nem chave de IA — e a IA
  tem **fallback por regras**, então nunca quebra.
- **Colaborativo:** quem mais conhece a estrada (o produtor) alimenta o sistema.
- **Pronto para gestão pública:** CSV e relatório semanal para ata/ofício.

## 📊 Números da demo

- 8 trechos monitorados nas linhas C-65, C-70, C-60, C-75, TB-40 e ramais.
- Índice 0–100 com 4 níveis e explicação textual automática.
- API REST completa + reprocessamento diário automático.

---

## 🎬 Roteiro do vídeo de pitch (~3 min)

| Tempo | Cena | Fala-chave |
| --- | --- | --- |
| 0:00–0:20 | Abertura: foto/charge de caminhão atolado | "Toda chuva, a produção de Ariquemes fica presa na lama." |
| 0:20–0:40 | Landing page | "O LinhaMap antecipa o bloqueio com até 7 dias." |
| 0:40–1:20 | Mapa de risco → clicar num trecho crítico | "Cada trecho tem um índice **explicável**: olha o porquê do risco." |
| 1:20–2:00 | Registrar denúncia com descrição/foto → sucesso | "O produtor relata; a **IA classifica** e o risco se atualiza na hora." |
| 2:00–2:40 | Dashboard: mapa de calor, prioridades, CSV, relatório | "A Secretaria prioriza a manutenção **preventiva** com dados." |
| 2:40–3:00 | Encerramento | "LinhaMap: menos prejuízo, mais estrada aberta. Obrigado!" |

### Dicas de gravação
- Mostre o **MVP online** (não localhost) rodando de verdade.
- Diga claramente **o que funciona** e **o que ainda não** (exigência do edital).
- Cite as **ferramentas de IA** usadas (ver `docs/DECLARACAO_IA.md`).
- Se possível, inclua uma fala de **validação** (produtor, cooperativa ou Secretaria).
