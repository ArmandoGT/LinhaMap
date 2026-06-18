# LinhaMap — Papéis e Contas

> Controle de acesso por papel (RBAC) introduzido para separar **quem denuncia**
> de **quem resolve**. Complementa a autenticação (cadastro/login via Supabase Auth).

## Papéis

| Papel        | Quem é                         | O que acessa |
| ------------ | ------------------------------ | ------------ |
| `cidadao`    | Produtor/morador (padrão)      | Mapa, Trajeto, **Denúncia**, "Minha conta" (minhas denúncias, follows, notificações) |
| `secretaria` | Secretaria de Obras (operador) | Tudo do cidadão **+ back-office**: Dashboard, Relatórios, Ordens de serviço, mudar status de denúncia, recalcular trechos, exportar CSV |

Toda conta nova nasce `cidadao` (trigger `on_auth_user_created`). A promoção a
`secretaria` é **manual**.

## Modelo técnico (resumo)

- Tabela `profiles` (1:1 com `auth.users`), enum `user_role`. Migração:
  `add_profiles_and_roles` (refletida em `database/schema.sql`).
- **Enforcement real é na aplicação** (server components + route handlers via
  `checkSecretariaAccess` / `requireSecretariaApi` em `lib/supabase/auth-server.ts`),
  porque o app acessa o banco com a **service-role**, que **bypassa o RLS**.
- O RLS em `profiles` (`profiles_select_own`) é **defesa em profundidade**: protege
  apenas acesso direto anon/PostgREST; **não** protege as rotas de back-office.
- **Modo mock local** (sem `NEXT_PUBLIC_SUPABASE_*`): o operador é tratado como
  `secretaria` (acesso total), para não travar o dev offline.

## Promover / rebaixar uma conta (manual)

Via SQL (Supabase SQL Editor ou MCP — a service-role bypassa o RLS, é o caminho previsto):

```sql
-- Promover a Secretaria
update profiles set role='secretaria'
where id = (select id from auth.users where email='EMAIL_AQUI');

-- Rebaixar a Cidadão
update profiles set role='cidadao'
where id = (select id from auth.users where email='EMAIL_AQUI');

-- Conferir papéis
select u.email, p.role
from profiles p join auth.users u on u.id = p.id
order by p.role desc, u.email;
```

## Contas de demonstração (produção)

| Conta                       | Papel        | Uso |
| --------------------------- | ------------ | --- |
| `armandogiordani@gmail.com` | `secretaria` | Demonstrar o back-office |
| `topolniak@gmail.com`       | `cidadao`    | Demonstrar a visão restrita do cidadão |

> Senhas **não** são versionadas. Para uma conta de secretaria nova, cadastre pelo
> `/cadastro` e rode o `update` acima.
