# Auditoria do GitHub

Em 26/11/2026 o GitHub CLI autenticado retornou quatro repositórios na organização. A navegação pública renderizou a página do frontend. O canal nativo do navegador integrado do VS Code estava indisponível, então as consultas de histórico, branches, PRs e arquivos usaram Git e GitHub CLI.

| Repositório | Papel | Revisão observada | PRs abertos |
|---|---|---|---|
| [doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend) | SPA React/Vite, serviços Axios, testes Vitest | `main` em `e73ad24`, `develop` em `1c8eaa8` | 0 |
| [doasync-backend](https://github.com/PrjDoaSync/doasync-backend) | API Spring, persistência, JWT, CORS e testes de contrato | `main` em `3c911d7`, `feat/campanha-versao` em `014bbc6` | 12 |
| [doa-sync](https://github.com/PrjDoaSync/doa-sync) | Requisitos, regras de negócio e contrato publicado | `b049881` no levantamento anterior | #208 a #211, documentação |
| [quality](https://github.com/PrjDoaSync/quality) | Matriz de QA e cenários | `d32ec1b` no levantamento anterior | 0 |

## Frontend

- O Git inventariou 13 branches remotas. A branch de entrega incorpora `origin/main`, `origin/develop` e `origin/feature/integracao-api`. O merge local `1335fff` consolidou o trabalho de João Pedro e a `main`. Os PRs #143–145 já estavam mesclados no remoto. A lista dos 11 PRs fechados consta no [relatório de finalização](FINALIZACAO_DOASYNC.md).
- Os quatro commits exclusivos de integração incorporados foram `d8fa5d4`, `5569193`, `371246a` e `0ad34ff`.
- `feature/login` mantém o login demonstrativo anterior. `feature/nickolas-gestao` mantém os protótipos de estoque, relatórios e equipe. A passagem à produção depende dos contratos e da conferência do design. As demais branches e issues constam no inventário anterior.
- O checkout de origem `develop` estava em `75f14fc`, 11 commits atrás de `origin/develop` e com 52 entradas de trabalho. A validação usa o worktree de entrega para preservar o conteúdo local.

## Backend

Foi feito fetch do histórico e das 30 referências de branches remotas. A busca em anotações de controladores Java procurou estoque, prestação de contas, movimentação, agendamento de doação e recuperação. A referência de contrato enumera 22 rotas e concorda com a ausência dessas operações.

| PRs abertos | Escopo | Decisão |
|---|---|---|
| #49–#55 | Pilha de campanha para gestão, filtros, permissões, desativação, progresso, imagens e regressão | A pilha tem bases intermediárias. O material fica pendente de revisão e integração pelos mantenedores |
| #56, #57, #66 | Cadastro e aprovação de entidades | A API oficial oferece cadastro e mudança de status. Os PRs permanecem pendentes de revisão |
| #68, #69 | Testes de escrita e vitrine | Permanecem abertos |
| Branch `feat/campanha-versao` | Versão persistida no detalhe para a trava otimista | `014bbc6` é filho direto de `3c911d7`, com um commit exclusivo. A base da validação local incorpora a branch. A publicação na `main` continua pendente |

O backend local de validação usa a branch `codex/doasync-versao-postgres` em `a981d18`. A cópia local `doasync-backend-validacao` está pronta para revisão. Os PRs de documentação e os PRs pendentes acima continuam disponíveis para revisão no GitHub.
