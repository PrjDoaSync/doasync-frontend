# CLAUDE.md — DoaSync, frontend Web

Contexto permanente para agentes (Claude Code). Leia também `docs/frontend-estado-execucao.md` (último checkpoint) antes de alterar código.

## Projeto

DoaSync conecta doadores, entidades e campanhas solidárias. Projeto de extensão de ADS do UNISENAI-SP (Sorocaba). Este repositório é o **frontend Web** (Equipe 4); o código está em `web/`.

## Fontes oficiais (ordem de autoridade por assunto)

- **Requisitos e regras:** issues deste repositório e o board https://github.com/orgs/PrjDoaSync/projects/8.
- **Visual:** Figma https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync (30 frames; *node IDs* em `docs/frontend-matriz-rastreabilidade.md`) e `web/src/styles/tokens.css`.
- **Contratos:** https://github.com/PrjDoaSync/doa-sync/blob/main/docs/backend/contrato-api.md, mais o comportamento verificado em `docs/integracao-api.md §6`.
- **Processo:** `docs/frontend-algoritmo-mestre.md`.

## Stack e comandos (em `web/`)

React 19 · Vite 8 · React Router 7 · Axios · Vitest 5 + Testing Library · oxlint.

```bash
npm ci
npm run dev        # http://localhost:5173, API em http://localhost:8080/api/v1
npm run lint       # oxlint --deny-warnings (aviso = falha)
npm test
npm run typecheck  # tsc --noEmit (web/tsconfig.json)
npm run build
```

A CI (`.github/workflows/frontend-qa.yml`) roda lint, testes e build em `feature/**`, `develop` e `main`.

## Arquitetura

- `src/services/`: cliente Axios (`api.js`, `normalizeError`, token e 401), um serviço por domínio e `mappers.js` (API → formato das telas). Nenhuma tela chama Axios diretamente.
- `src/hooks/useRequest.js` (leitura com cancelamento) + `components/RequestState.jsx` (carregando/erro/vazio); `useAsyncAction` para ações.
- `src/context/AuthContext.jsx`: sessão `{ token, expiraEm, usuario }` em `localStorage` (`doasync.sessao`); `RotaProtegida` exige `ENTIDADE` ou `ADMIN` na gestão.
- `src/context/DemoContext.jsx` + `src/mocks/`: **apenas** telas ainda sem API (itens, relatórios, equipe, prestação de contas). A faixa de demonstração aparece só nelas (`utils/gestao.js → emDemonstracao`).
- Testes: `src/test/setup.js` instala o simulador de contrato `src/test/fixtures/apiCampanhas.js` como adaptador Axios e uma sessão de entidade aprovada.

## Regras

- Só frontend. Não altere backend, banco ou contratos; não invente endpoints.
- Tela integrada lê só a API; o que não tem contrato fica fora do fluxo ou em demonstração identificada. Nunca apresente pagamento simulado como real.
- Não exporte funções utilitárias de arquivos de componente (fast refresh / `react/only-export-components`); use `src/utils/`.
- Arquivos usam CRLF no Windows; cuidado com scripts que dependem de `\n`.
- Variáveis locais em `web/.env.development.local` (não use `.env`/`.env.local`).
- Git: trabalhe em branch derivada da `develop`, PR para a `develop`, commits semânticos, nunca *force push* nem merge na `main`. Identidade: `LucasIanovski <ianovskilucas@gmail.com>`.
- Não declare algo validado sem rodar lint, testes e build.

## Estado atual

Branch `feature/finalizacao-frontend`: integra editar/acompanhar campanha, troca de status, doações recebidas, dashboards, doadores, aprovação de entidades e usuários (ADMIN). **Ainda não validado** — ver `docs/frontend-estado-execucao.md §13` para a próxima atividade.
