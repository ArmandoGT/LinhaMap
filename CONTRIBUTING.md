# Convenções do Projeto LinhaMap

Guia rápido de padronização para a equipe durante o hackathon.

## Convenção de commits (Conventional Commits)

Formato: `<tipo>(<escopo opcional>): <descrição curta em português>`

**Tipos:**

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação (README, declaração de IA, etc.) |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem mudar comportamento |
| `chore` | Configuração, scaffolding, dependências |
| `db` | Scripts SQL / migrações / seed |
| `ci` | GitHub Actions / automação |

**Escopos sugeridos:** `frontend`, `backend`, `db`, `ci`, `docs`, `infra`.

**Exemplos:**
```
chore(infra): scaffolding do monorepo e arquivos de governança (Etapa 0)
db: schema inicial e seed de Ariquemes (Etapa 1)
feat(backend): endpoint POST /reports com classificacao por IA (Etapa 5)
feat(frontend): mapa de risco com Leaflet (Etapa 9)
```

## Branches

- `main` — código estável e deployável.
- `dev` — integração (opcional).
- `feat/<etapa>-<descricao>` — trabalho por etapa (opcional para times pequenos).

## Mensagens de commit (rodapé)

Cada etapa do [Plano de Ação](./PLANO_DE_ACAO.md) corresponde a um ou mais commits, facilitando a
rastreabilidade da entrega para a banca avaliadora.

## Padrões de código

- **Backend (Python):** PEP 8, type hints, docstrings; organização em `routes/`, `services/`, `models/`, `schemas/`.
- **Frontend (TS):** componentes funcionais, Tailwind para estilo, shadcn/ui para componentes base.
- **Comentários:** explicativos e em português, conforme exigência de "código fácil de apresentar em hackathon".
