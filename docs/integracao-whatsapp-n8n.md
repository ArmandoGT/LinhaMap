# Integração WhatsApp → LinhaMap (via N8N)

Agente conversacional no WhatsApp que recebe áudio/foto/texto informal de produtores e
caminhoneiros e registra a denúncia na API do LinhaMap, fazendo o ponto aparecer no mapa
e disparando o recálculo de risco do trecho.

- **Canal:** Evolution API / Z-API (não-oficial, conecta por QR — sem verificação Meta).
- **Orquestração:** N8N.
- **Backend:** reaproveita `POST /api/reports` (nenhuma mudança no app).
- **Classificação (categoria/severidade):** delegada ao backend — o N8N **não** envia esses
  campos; a rota chama `classifyReport(description, image_url)` (IA com visão) e preenche.

---

## 1. Contrato da API (`POST /api/reports`)

- **URL:** `https://linha-map.vercel.app/api/reports`
- **Método:** `POST` · `Content-Type: application/json`
- **Auth:** nenhuma (aceita anônimo → `user_id: null`). _Ver "Hardening" no fim._
- **Resposta:** `201` com o objeto `Report` completo (`id`, `category`, `severity`,
  `confidence`, `status: "aberta"`, …).

### Payload

| campo | tipo | obrigatório | observação |
|---|---|---|---|
| `description` | string | recomendado | texto/transcrição do problema (alimenta a IA) |
| `road_segment_id` | UUID | **sim (p/ aparecer no mapa)** | ver lookup abaixo |
| `phone` | string | não | número do WhatsApp (`from`), só dígitos |
| `reporter_name` | string | não | nome do denunciante (toque pessoal) |
| `latitude` | number | não | pino do Zap (até 6 casas) |
| `longitude` | number | não | pino do Zap (até 6 casas) |
| `image_url` | string | não | **data URI base64** (`data:image/jpeg;base64,…`) ou URL |
| `category` | slug | **não enviar** | backend classifica |
| `severity` | slug | **não enviar** | backend classifica |

> **Crítico:** a denúncia só vira polyline no mapa se tiver `road_segment_id`. Não há
> geocoding nem matching automático por nome de linha ou por lat/lng — daí o lookup fixo.

### Slugs (caso algum dia se queira enviar manualmente)

- `category`: `buraco | lama | erosao | ponte_danificada | atolamento | outro`
- `severity`: `baixa | media | alta | critica`

---

## 2. Lookup fixo: nome da linha → `road_segment_id`

Embutir no N8N (nó `Code` ou `Set`). Valores reais do seed:

```js
// chave: rural_line normalizada -> { trechos: { keyword: uuid }, default: uuid }
const SEGMENTS = {
  "linha 57,5":   { default: "11111111-1111-1111-1111-000000000006" }, // Cafezal Alto
  "linha 60":     { default: "11111111-1111-1111-1111-000000000007" }, // Atravessa Igarapé
  "linha c-60":   { default: "11111111-1111-1111-1111-000000000003" }, // Sítio Boa Vista
  "linha c-65":   {                                                     // AMBÍGUA (2 trechos)
    trechos: {
      "ponte":  "11111111-1111-1111-1111-000000000001",  // Ponte do Branco (crítico)
      "branco": "11111111-1111-1111-1111-000000000001",
      "serra":  "11111111-1111-1111-1111-000000000008",  // Curva da Serra
      "curva":  "11111111-1111-1111-1111-000000000008",
    },
    default:    "11111111-1111-1111-1111-000000000001",  // sem referência → Ponte do Branco
  },
  "linha c-70":   { default: "11111111-1111-1111-1111-000000000002" }, // Igarapé Verde
  "linha c-75":   { default: "11111111-1111-1111-1111-000000000004" }, // Laticínio
  "linha gaúcha": { default: "11111111-1111-1111-1111-000000000005" }, // Travessão 40
};

// resolução: normaliza "C 65", "c-65", "linha 65" -> "linha c-65"; aplica keyword do trecho
function resolveSegment(rural_line, referencia = "") {
  const key = ("linha " + String(rural_line))
    .toLowerCase()
    .replace(/linha\s+linha/, "linha")
    .replace(/c\s*-?\s*/, "c-")
    .trim();
  const seg = SEGMENTS[key];
  if (!seg) return null;                       // sem match → agente pede a linha de novo
  if (seg.trechos) {
    const ref = referencia.toLowerCase();
    for (const kw of Object.keys(seg.trechos)) if (ref.includes(kw)) return seg.trechos[kw];
  }
  return seg.default;
}
```

> Ao adicionar/renomear trechos no Supabase, atualizar esta tabela. Conferência rápida:
> `SELECT id, rural_line, name FROM road_segments ORDER BY rural_line;`

---

## 3. Fluxo N8N (nós em ordem)

1. **Trigger** — webhook do Evolution/Z-API. Extrai `from` (telefone) e o tipo da mensagem
   (texto / áudio / imagem / localização).
2. **Mídia → texto/base64:**
   - **Áudio:** baixa o arquivo → transcrição (Whisper/Groq) → vira `description`.
   - **Imagem:** baixa → converte para **data URI base64** → `image_url`.
   - **Localização (pino):** extrai `latitude` / `longitude`.
3. **Agente conversacional** (LLM com o System Prompt v2, seção 4) — responde curto e
   empático; mantém estado por `from` (memória do nó de IA).
4. **Extração estruturada** (nó separado / function-calling — **não** JSON inline no balão):
   retorna `{ rural_line, referencia?, description, reporter_name? }`. **Sem** category/severity.
5. **Resolver trecho** — `Code` com `resolveSegment(rural_line, referencia)` → `road_segment_id`.
   Sem match → volta ao passo 3 pedindo a linha/pino.
6. **HTTP Request** — `POST https://linha-map.vercel.app/api/reports`:
   ```json
   {
     "description": "<transcrição limpa>",
     "road_segment_id": "<uuid do lookup>",
     "reporter_name": "<nome ou null>",
     "phone": "<from>",
     "latitude": null,
     "longitude": null,
     "image_url": "<data URI base64 ou null>"
   }
   ```
7. **Resposta ao usuário** — confirma o registro (mensagem curta de encerramento).

---

## 4. System Prompt v2 (nó do agente conversacional)

```
# CONTEXTO E OBJETIVO
Você é o Assistente Virtual do LinhaMap, operando via WhatsApp. Seu objetivo é ajudar
produtores rurais, motoristas de caminhão e moradores das linhas vicinais de Ariquemes/RO
a registrarem problemas nas estradas de terra de forma rápida, amigável e sem burocracia.
Você recebe áudios, textos e fotos informais, acolhe o usuário e descobre o necessário
para o registro.

# PERSONA E TOM DE VOZ
- Identidade: amigável, empático, prestativo, com os pés na terra.
- Tom: simples e direto; linguagem do dia a dia do campo, sem forçar gírias.
- Formato: mensagens MUITO curtas (2 a 3 linhas por balão). Quem está no trânsito ou no
  campo não lê blocos grandes.
- Empatia: demonstre compreensão ("Poxa, atolar o caminhão com leite é complicado, vamos
  registrar isso já").
- Proibição: NUNCA use jargão de TI (banco de dados, sistema, JSON, coordenadas, API).

# O QUE VOCÊ PRECISA DESCOBRIR (apenas 2 coisas obrigatórias)
1. O QUE aconteceu — pela foto e/ou pela descrição em áudio/texto.
2. ONDE é — o número da Linha (ex.: Linha C-65) OU o pino de localização do WhatsApp.
   (Opcional: o NOME do usuário, só para um toque pessoal.)

NÃO pergunte a gravidade nem o tipo do problema — isso é classificado automaticamente
depois. Foque em entender o relato e o local.

# ROTEIRO FLEXÍVEL
1. Só "Oi" ou foto solta: cumprimente, diga que é do LinhaMap e pergunte o que aconteceu
   e em qual Linha a pessoa está.
2. Faltou o local: peça gentilmente a "localização aqui do Zap" OU o número da Linha.
   Reforce que sem o local não dá para avisar os vizinhos nem a Secretaria.
3. Linha com mais de um trecho (ex.: Linha C-65 tem "Ponte do Branco" e "Curva da Serra"):
   pergunte o ponto de referência ("é mais na ponte ou na curva da serra?"). Se a pessoa
   não souber, siga assim mesmo.
4. Encerramento: ao ter o problema + o local, confirme o registro. Diga que isso alerta
   os vizinhos e ajuda a Secretaria de Obras a agir rápido. Encerre.

# IMPORTANTE
A classificação oficial (tipo do problema e gravidade) é feita automaticamente pelo
LinhaMap a partir do que você coletou — você NÃO precisa decidir nem informar isso ao
usuário. Seu papel é acolher, entender o relato e garantir o local.
```

### Schema da extração estruturada (nó/função separada)

```json
{
  "rural_line":     "string | null  (ex.: 'C-65', 'C-70'; null se não informado)",
  "referencia":     "string | null  (ponto de referência p/ desambiguar trecho, ex.: 'ponte')",
  "description":    "string        (relato limpo do problema)",
  "reporter_name":  "string | null"
}
```

---

## 5. Checklist de demo / verificação

1. **POST cru primeiro** (sem WhatsApp) — payload mínimo, sem category/severity:
   ```bash
   curl -i -X POST https://linha-map.vercel.app/api/reports \
     -H "Content-Type: application/json" \
     -d '{"description":"Muita lama na descida, caminhão atolou","road_segment_id":"11111111-1111-1111-1111-000000000001","phone":"5569999990000","reporter_name":"Teste N8N"}'
   ```
   Esperar **201** com `category`/`severity` preenchidos pela IA e `status: "aberta"`.
2. **Conferir no produto:** abrir `/mapa` e ver o risco do trecho da C-65 (Ponte do Branco)
   refletir a denúncia.
3. **Fluxo completo:** áudio "atolei o caminhão de leite na C-65 perto da ponte" →
   transcrição → extração (`rural_line: "C-65"`, `referencia: "ponte"`) → POST 201 →
   confirmação no WhatsApp.
4. **Foto:** mandar imagem de um buraco → backend classifica `buraco` pela visão.
5. **Limpar dados de teste** no Supabase após a demo:
   ```sql
   DELETE FROM reports WHERE reporter_name = 'Teste N8N' OR phone = '5569999990000';
   ```

---

## 6. Riscos e hardening (opcional, fora do escopo da PoC)

- **Endpoint aberto:** o `POST /api/reports` não tem auth nem assinatura — qualquer um pode
  postar. Para produção, checar um header secreto (`x-webhook-secret`) na rota e configurá-lo
  no nó HTTP do N8N. É a única mudança de backend necessária.
- **Foto base64 incha o banco** (vai como TEXT, sem Supabase Storage). Limitar o tamanho no
  N8N (a UI usa 2 MB) para não estourar o payload.
- **Estado de conversa** deve ser por `from` (telefone) para a conversa multi-balão não
  perder o contexto do que já foi dito.
```
