# Plano de integração Frontend Web × API DoaSync

> **Branch:** `feature/integracao-api` (a partir de `develop`)
> **Backend:** [PrjDoaSync/doasync-backend](https://github.com/PrjDoaSync/doasync-backend) — Spring Boot, base `/api/v1`, contrato em `docs/api-contract.md`
> **Responsável:** João Pedro Matias

## 1. Situação de partida

Todas as telas leem dados de um único `DemoProvider` (`useDemo().dados`), alimentado por `carregarDemo` em `src/mocks/gestao.js`. O formato dos mocks difere do contrato da API:

| Mock (front) | API (backend) |
|---|---|
| `id: 1` (número) | `id: "uuid"` |
| `nome`, `meta`, `arrecadado`, `encerraEm` | `titulo`, `metaValor`, `valorArrecadado`, `dataFim` |
| `status: 'Ativa'` | `status: 'ATIVA'` |
| `entidade: 'Rede Esperança'` | `entidade: { id, razaoSocial, nomeFantasia }` |

## 2. Estratégia

- **Mappers puros** convertem respostas da API para o formato consumido pelas telas, testados isoladamente.
- **Flag `VITE_USE_API`**: quando `true`, os dados vêm da API; quando ausente/`false`, o modo demonstração continua igual. A suíte de testes existente segue usando os mocks.
- **Entrega incremental**: cada commit é uma mudança pequena; antes de cada push rodam `npm run lint`, `npm test` e `npm run build` (mesmos passos da CI `frontend-qa.yml`).
- **PR para `develop` ao final de cada fase.**

## 3. Fases

### Fase 0 — Fundação (sem mudança visível)
1. Este documento.
2. `.env.example` com `VITE_API_URL=http://localhost:8080/api/v1` e `VITE_USE_API`.
3. `normalizeError` lendo `error` / `erros` (formato de erro do backend).
4. Interceptor Axios com `Authorization: Bearer <token>`.
5. Mappers API → front (campanha primeiro).

### Fase 1 — Leitura pública (apenas GET)
6. Home e Explorar via `GET /campanhas`.
7. Detalhe da campanha via `GET /campanhas/{id}`.

### Dependência no backend — CORS
Hoje o backend só libera `GET` em `/api/v1/campanhas/**` para `localhost:5173`. PR no `doasync-backend` (branch `fix/cors-frontend`) para CORS em `/api/v1/**` com os métodos usados pelo front. **Bloqueia as fases 2 a 5 no navegador.**

### Fase 2 — Autenticação
8. `authService` + `AuthContext` (token, usuário, expiração).
9. Login real, logout e redirecionamento por tipo de usuário.
10. Proteção das rotas de gestão.

### Fase 3 — Doação (PIX)
11. `POST /doacoes` com `Idempotency-Key`.
12. Confirmação/comprovante via `GET /doacoes/{id}`.
13. Minhas doações via `GET /usuarios/me/doacoes`.

### Fase 4 — Gestão da entidade
14. Cadastro de entidade (`POST /entidades`).
15. Minhas campanhas, criar, editar (com `versao`) e trocar status.
16. Doações recebidas, arrecadação e edição do perfil da entidade.

### Fase 5 — Administração
17. KPIs do dashboard, usuários e aprovação de entidades.

## 4. Fora do escopo da API (permanece em demonstração)

Doação de itens, cartão/boleto, agendamento de entrega, controle de itens/estoque, relatórios/exportação, prestação de contas, equipe da entidade e upload de documentos.

## 5. Pendências e divergências

- Não existe tela de **cadastro de doador** no front, embora a API tenha `POST /doadores`.
- `POST /doacoes`: o contrato diz que `entidadeId` é sempre obrigatório, mas a API exige **exatamente um** entre `campanhaId` e `entidadeId`.
- A vitrine pública da API só retorna campanhas `ATIVA` dentro do período; os mocks mostram também encerradas.

## 6. Acompanhamento

| Passo | Status | Commit |
|---|---|---|
| 1 — Plano | ✅ | — |
| 2 — `.env.example` | ⏳ | |
| 3 — `normalizeError` | ⏳ | |
| 4 — Interceptor de token | ⏳ | |
| 5 — Mappers | ⏳ | |
| 6 — Home/Explorar | ⏳ | |
| 7 — Detalhe | ⏳ | |
| CORS backend | ⏳ | |
