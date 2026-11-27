# CLAUDE.md — DoaSync, frontend Web

Contexto permanente para agentes (Claude Code). Leia também `docs/frontend-estado-execucao.md` (último checkpoint) antes de alterar código.

## Projeto

DoaSync conecta doadores, entidades e campanhas solidárias. Projeto de extensão de ADS do UNISENAI-SP (Sorocaba). Este repositório é o **frontend Web** (Equipe 4); o código está em `web/`.

## Fontes oficiais (ordem de autoridade por assunto)

- **Requisitos e regras:** issues deste repositório e o board https://github.com/orgs/PrjDoaSync/projects/8.
- **Visual:** Figma https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync (30 frames; *node IDs* em `docs/frontend-matriz-rastreabilidade.md`) e `web/src/styles/tokens.css`. Consulte o Figma pelo Chrome; o frontend consolidado é a referência principal.
- **Contratos:** https://github.com/PrjDoaSync/doa-sync/blob/main/docs/backend/contrato-api.md, mais o comportamento verificado em `docs/integracao-api.md §6`.
- **Processo:** `docs/frontend-algoritmo-mestre.md`.

## Stack e comandos (em `web/`)

React 19 · Vite 8 · React Router 7 · Axios · Vitest 5 + Testing Library · oxlint.

```bash
npm ci
npm run dev        # http://localhost:5173, API em http://localhost:8080/api/v1
npm run lint       # oxlint (use npx oxlint --deny-warnings: aviso = falha)
npm test           # no Windows, rode a partir de C:\ (unidade em maiúscula) ou o Vitest não encontra o runner
npm run build
```

A CI (`.github/workflows/frontend-qa.yml`) roda lint, testes e build em `feature/**`, `develop` e `main`.

## Arquitetura

- `src/services/`: cliente Axios (`api.js`, `normalizeError`, token e 401), um serviço por domínio e `mappers.js` (API → formato das telas). Nenhuma tela chama Axios diretamente.
- `src/hooks/useRequest.js` (leitura com cancelamento) + `components/RequestState.jsx` (carregando/erro/vazio); `useAsyncAction` para ações.
- `src/context/AuthContext.jsx`: sessão `{ token, expiraEm, usuario }` em `localStorage` (`doasync.sessao`); `RotaProtegida` exige `ENTIDADE` ou `ADMIN` na gestão.
- `src/context/DemoContext.jsx` + `src/mocks/`: **apenas** dados sem API (itens/estoque, equipe da entidade, itens de exemplo da doação e o relatório da prestação de contas na sessão). A faixa de demonstração aparece só em `/itens` e `/configuracoes/usuarios` (`utils/gestao.js → emDemonstracao`).
- `src/services/indisponivel.js` (`RECURSOS_PENDENTES`) + `components/AvisoIndisponivel.jsx`: recursos sem rota no backend. Os serviços expõem funções nomeadas que rejeitam com `RecursoIndisponivelError`; ao integrar, troque só a implementação do serviço.
- Testes: `src/test/setup.js` instala o simulador de contrato `src/test/fixtures/apiCampanhas.js` como adaptador Axios e uma sessão de entidade aprovada.

## Regras

- Só frontend. Não altere backend, banco ou contratos; não invente endpoints.
- Tela integrada lê só a API; o que não tem contrato fica fora do fluxo ou em demonstração identificada. Nunca apresente pagamento simulado como real.
- Não exporte funções utilitárias de arquivos de componente (fast refresh / `react/only-export-components`); use `src/utils/`.
- Arquivos usam CRLF no Windows; cuidado com scripts que dependem de `\n`.
- Variáveis locais em `web/.env.development.local` (não use `.env`/`.env.local`).
- Git: trabalhe em branch derivada da `develop`, PR para a `develop`, commits semânticos, nunca *force push* nem merge na `main`. Identidade: `LucasIanovski <ianovskilucas@gmail.com>`.
- Não declare algo validado sem rodar lint, testes e build.

## Estado atual (checkpoint 27/11/2026 16:50)

- Frontend: branch `feature/finalizacao-frontend` (PR #148 → `develop`, rascunho). 30 telas do Figma (20 integradas; demais com pendência do backend indicada), Minha conta, entidades públicas, doação direta, páginas de erro, Docker e suíte E2E.
- Backend: `PrjDoaSync/doasync-backend`, branch `codex/doasync-versao-postgres` (PR #71 → `main`), commit `ff7fe5a`: inclui `versao` no detalhe da campanha, correções PostgreSQL, validação de CPF/CNPJ (422) e período da campanha (422 em vez de 500).
- Validação: lint sem avisos; Vitest 312 passando (+1 integração real opcional); build ok; npm audit 0; Maven verify 277 testes ok; E2E `web/scripts/e2e-api.mjs` 74/74 PASS no Docker/PostgreSQL sem 5xx; serviços do front contra a API real ok; Playwright 1440/390 em 64 visitas sem erros de console/CSP/rede/overflow; persistência confirmada após restart.
- Detalhes: `docs/frontend-estado-execucao.md`, `docs/frontend-matriz-rastreabilidade.md`, `docs/docker.md`, `docs/qa-e2e.md`.

## Ambiente integrado (Docker) e retomada em outra máquina

1. Clone lado a lado: `doasync-frontend` (branch `feature/finalizacao-frontend`) e `doasync-backend` (branch `codex/doasync-versao-postgres`).
2. Na raiz do frontend: `cp .env.example .env` e preencha segredos próprios (senha do banco, `DOASYNC_JWT_SEGREDO` ≥ 32 bytes, admin inicial). Ajuste `DOASYNC_BACKEND_DIR` (padrão `../doasync-backend/backend`). Nunca versione o `.env`.
3. `docker compose up -d --build --wait` → app em http://localhost:8090, API em http://localhost:8090/api/v1, Swagger em http://127.0.0.1:8091/swagger-ui.html.
4. Dados de homologação: `API_URL=http://localhost:8090/api/v1 node --env-file=.env web/scripts/e2e-api.mjs --seed`; testes: o mesmo sem `--seed`. Só em homologação.
5. Nunca use `docker compose down -v` (apaga o banco). Backup/restauração e deploy em `docs/docker.md`.

Pendências: revisão e merge dos PRs #148 e #71 por outro integrante; recursos sem rota no backend (pagamento real, itens/estoque/agendamento, upload, prestação de contas, recuperação de senha por e-mail, equipe, PDF) seguem identificados em `web/src/services/indisponivel.js`.
