# Auditoria completa do frontend Web — DoaSync

**Data:** 2026-11-26 · **Branch auditada:** `develop` (`1c8eaa8`) + `feature/integracao-api` (`0ad34ff`) · **Branch de trabalho:** `feature/finalizacao-frontend`

Este documento registra o diagnóstico inicial (fases 0 a 3 do prompt mestre). O plano está em [frontend-plano-finalizacao.md](frontend-plano-finalizacao.md), a matriz em [frontend-matriz-rastreabilidade.md](frontend-matriz-rastreabilidade.md) e o resultado em [frontend-validacao-final.md](frontend-validacao-final.md).

## 1. Ambiente e acesso às fontes

| Fonte | Acesso | Observação |
|---|---|---|
| Repositório local (`Desktop\doasync-frontend`) | Parcial | Leitura de arquivos pela ponte do desktop. O shell local não iniciou (falta de espaço em disco, ~17 GB exigidos), então `git status` e `npm` não rodaram na máquina do usuário. |
| Estado Git local | Verificado por arquivos | `HEAD → develop` em `1c8eaa8`, igual a `origin/develop`. O índice local é idêntico ao commit (nenhum arquivo em *stage*). Alterações não rastreadas na árvore não puderam ser verificadas sem o shell. |
| Repositório remoto | Leitura | Clone feito no ambiente de nuvem. **Push recusado** (o app do Claude no GitHub não tem acesso de escrita à organização). |
| Issues e PRs (REST) | Leitura | 146 itens lidos (issues + PRs). |
| GitHub Projects #8 | **Bloqueado** | GraphQL indisponível nesta sessão e o board não abre sem login no navegador interno. Status das issues foi usado como fonte. |
| Figma `3eBaQzgxDIRMbhxY0K2DWa` | Leitura | 3 páginas, 30 frames desktop mapeados (seção 5). |
| Contrato da API | Leitura | `PrjDoaSync/doa-sync` → `docs/backend/contrato-api.md` (22 rotas `/api/v1`). |
| Backend (`doasync-backend`) | **Bloqueado** | Repositório privado sem acesso nesta sessão. As descobertas verificadas pela equipe em `docs/integracao-api.md §6` foram usadas como evidência do comportamento real. |
| npm / registro | **Bloqueado** | Registro npm inacessível na nuvem; sem `node_modules` não foi possível rodar lint, testes, build nem a aplicação. |

## 2. Git e histórico

- `main` (`e73ad24`) está **10 commits à frente** da `develop`: o PR #145 (`feature/integracao-api → main`) foi mesclado direto na `main`, sem passar pela `develop`.
- `feature/integracao-api` (`0ad34ff`) descende da `develop` e contém tudo da `main` mais 4 commits (passos 16–19: cadastro de entidade, perfil, gestão de campanhas e criar campanha). CI verde nesse commit (lint, Vitest e build).
- `feature/nickolas-gestao` (`5c218e7`) tem 4 commits de alinhamento visual de GES-07/08/09/10 (#111–#114) feitos sobre uma `develop` antiga; diverge em 16 arquivos da linha atual e ainda usa dados de demonstração.
- PR #146 (`codex/finalizacao-doasync → main`, 15 commits, 80 arquivos) foi **fechado sem merge** em 2026-11-26 e a branch foi apagada. Usado apenas como referência de auditoria (ex.: matriz de endpoints).
- Commits históricos citados no prompt (`ce2aab8`, `3a666e4`, `1798a6a`) pertencem ao histórico antigo e não representam o estado atual.

**Decisão:** a branch de trabalho `feature/finalizacao-frontend` parte da `develop` (seção 28 do prompt) e avança por *fast-forward* até `feature/integracao-api`, preservando todo o trabalho já integrado pela equipe.

## 3. Stack e qualidade

- `web/`: React 19, Vite 8, React Router 7, Axios, Vitest 5 + Testing Library, oxlint (`--deny-warnings`), TypeScript só para `typecheck` (não existe `tsconfig.json` nesta linha; o script `typecheck` falharia — ver pendência P3-01).
- CI: `.github/workflows/frontend-qa.yml` roda `npm ci`, lint, `npm test` e build em `feature/**`, `develop` e `main`.
- Tipografia Inter carregada localmente (`styles/fonts.css`, pesos variáveis 100–900, `font-display: swap`). Tokens em `styles/tokens.css` com comentário de origem no Figma.
- Sem `dangerouslySetInnerHTML`, sem `console.log` em código de produção, sem segredos versionados. Sessão em `localStorage` (`doasync.sessao`) com expiração e limpeza em 401.

## 4. Contratos da API

Base `/api/v1`, envelopes `{ data }`, `{ data, meta }`, `{ error }` e `{ erros: { campo } }`, IDs UUID — confirmados no contrato oficial. Divergências registradas:

| Ponto | Contrato | Comportamento verificado pela equipe | Tratamento no front |
|---|---|---|---|
| `PATCH /campanhas/{id}` | Edita `ATIVA`, sem `versao` | Exige `versao` (lock otimista); só a branch `feat/campanha-versao` devolve `versao` no detalhe | Envia a `versao` lida; sem `versao` a edição fica bloqueada com aviso; 409 oferece recarregar |
| `PATCH /campanhas/{id}/status` | Dono: só `ATIVA → ENCERRADA`; ADMIN desativa/reativa | Código aceita `RASCUNHO → AGENDADA/ATIVA` | Ações exibidas por perfil; a decisão final é do servidor e o erro é mostrado |
| `GET /entidades` | Lista aprovadas | Só `APROVADA`, inclusive para ADMIN | Aprovação usa `GET /usuarios?tipo=ENTIDADE` |
| Doadores, relatórios, estoque, prestação de contas, agendamento, recuperação de senha, upload | Fora do MVP | — | Sem simulação como se fosse real (seção 21 do prompt) |

## 5. Figma × rotas (30 frames)

Os 30 frames estão listados com *node ID* na matriz. Resumo inicial (antes desta entrega):

| Módulo | Integradas à API | Só demonstração | Bloqueadas por contrato |
|---|---|---|---|
| CAM | 6 (01, 02, 03, 04, 06 parcial, 07) | 08, 09, 10 | itens (05), upload (06), prestação (10) |
| DOA | 6 (02, 03, 04 registro, 08, 09, 10) | — | cartão/boleto (05), itens (06), agendamento (07); escolha (01) só financeira |
| GES | 3 (01 login, 02, 10) | 03, 04, 05, 06, 07, 08, 09 | recuperação de senha (01), itens (07), exportação no servidor (08), equipe (09) |

## 6. Problemas encontrados

| ID | Prioridade | Descrição | Arquivos |
|---|---|---|---|
| P0-01 | P0 | "Gestão de campanhas" (integrada, IDs UUID) leva para `/campanhas/{uuid}/editar` e `/acompanhamento`, que ainda leem a demonstração com `Number(id)`: **sempre "Campanha não encontrada"**. | `EditarCampanha.jsx`, `AcompanhamentoCampanha.jsx` |
| P1-01 | P1 | Editar campanha não salva na API (passo 20). | `EditarCampanha.jsx`, `campanhasService.js` |
| P1-02 | P1 | Troca de status (publicar rascunho, encerrar, desativar, reativar) inexistente (passo 21, CAM-10). | `AcompanhamentoCampanha.jsx` |
| P1-03 | P1 | Doações recebidas e dashboards usam dados fictícios com a sessão real (passos 22–23). | `DoacoesGestao.jsx`, `Dashboard.jsx` |
| P1-04 | P1 | Aprovação de entidades (ADMIN) lê `mocks` (passo 25). | `Entidades.jsx` |
| P2-01 | P2 | Cabeçalho e menu da gestão mostram usuária fictícia ("Ana Silva · demonstração") e o nome da entidade da demonstração; "Acesso da entidade" leva ao login estando logado. | `AdminHeader.jsx`, `AdminSidebar.jsx` |
| P2-02 | P2 | Faixa "Ambiente de demonstração" aparece em todas as telas da gestão, inclusive nas integradas. | `AdminLayout.jsx` |
| P2-03 | P2 | Doadores, relatórios, usuários (ADMIN) e itens seguem em demonstração. | `Doadores.jsx`, `Relatorios.jsx`, `Usuarios.jsx`, `Itens.jsx` |
| P3-01 | P3 | Script `typecheck` sem `tsconfig.json`. | `web/package.json` |
| P3-02 | P3 | `pages/Doacoes.jsx` não é usado por nenhuma rota (código morto). | `pages/Doacoes.jsx` |
| P4-01 | P4 | Conflito de escopo: o prompt pede preservar cartão, boleto, itens e agendamento; a equipe decidiu removê-los do fluxo por falta de API (`integracao-api.md §7`). Mantida a decisão da equipe; registrado como bloqueio externo. | — |
