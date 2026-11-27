# Transferência para o Claude Code no VS Code

Este guia leva o trabalho da sessão em nuvem (branch `feature/finalizacao-frontend`) para o repositório local `C:\Users\Lucas\Desktop\doasync-frontend` **sem sobrescrever nada** e diz como retomar.

## Links oficiais

- Organização: https://github.com/PrjDoaSync
- Repositórios: https://github.com/orgs/PrjDoaSync/repositories
- Frontend: https://github.com/PrjDoaSync/doasync-frontend
- Board: https://github.com/orgs/PrjDoaSync/projects/8
- Figma: https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync
- PR #146: https://github.com/PrjDoaSync/doasync-frontend/pull/146
- Contrato da API: https://github.com/PrjDoaSync/doa-sync/blob/main/docs/backend/contrato-api.md

## 1. O que há na pasta `_transferencia-claude/`

| Arquivo | Para que serve |
|---|---|
| `doasync-finalizacao.bundle` | Bundle Git com a branch `feature/finalizacao-frontend` (todos os commits). É o caminho recomendado. |
| `patches/*.patch` | Os mesmos commits desta execução em formato `git format-patch` (alternativa ao bundle). |
| `SHA256SUMS.txt` | Somas para conferir a integridade. |
| `LEIA-ME.txt` | Resumo destes passos. |

A pasta fica **fora do controle de versão** só enquanto você não fizer `git add` nela: não a inclua em commits. Depois de importar, apague-a.

## 2. Importar sem tocar no trabalho existente (PowerShell ou Git Bash)

```bash
cd C:/Users/Lucas/Desktop/doasync-frontend

# 1) Veja o estado local antes de qualquer coisa (nada abaixo altera a árvore de trabalho).
git status
git branch --show-current

# 2) Confira o bundle.
git bundle verify _transferencia-claude/doasync-finalizacao.bundle

# 3) Crie a branch local a partir do bundle. Isto só cria uma ref nova;
#    não muda a branch atual nem os arquivos abertos.
git fetch _transferencia-claude/doasync-finalizacao.bundle feature/finalizacao-frontend:feature/finalizacao-frontend

# 4) Compare com a develop local.
git log --oneline develop..feature/finalizacao-frontend
```

Se `git status` mostrar alterações suas não commitadas, **não troque de branch ainda**: faça commit delas na branch onde estão ou use `git worktree` para abrir a branch nova em outra pasta:

```bash
git worktree add ../doasync-finalizacao feature/finalizacao-frontend
```

Com a árvore limpa, basta:

```bash
git switch feature/finalizacao-frontend
```

### Alternativa: patches

Numa branch criada a partir de `origin/feature/integracao-api` (commit `0ad34ff`):

```bash
git switch -c feature/finalizacao-frontend origin/feature/integracao-api
git am _transferencia-claude/patches/*.patch
```

## 3. Validar (primeira tarefa no VS Code)

```bash
cd web
npm ci
npm run lint
npm test
npm run typecheck
npm run build
```

Nada disso foi executado na nuvem. Corrija o que falhar antes de qualquer push. Pontos de atenção:

- `src/test/gestaoApi.test.jsx` (25 casos novos) nunca rodou.
- Testes de demonstração removidos/ajustados em `gestaoTelas`, `fluxos`, `doacoesFluxo`, `campanhas`, `campanhasGestao`, `layout` e `infra`.
- `oxlint --deny-warnings`: confira imports não usados e `react/only-export-components`.

Para testar contra o backend real, siga `docs/integracao-api.md §2` (backend na branch `feat/campanha-versao`, `node scripts/popular-api.mjs`).

## 4. Publicar

Depois de tudo verde:

```bash
git push -u origin feature/finalizacao-frontend
```

Abra o PR para a **`develop`** (não para a `main`) e marque as issues #92, #93, #94, #107–#110, #113 e #35/#36 como relacionadas — sem fechá-las até a revisão.

## 5. Prompt de retomada sugerido para o Claude Code

> Leia `CLAUDE.md`, `docs/frontend-estado-execucao.md`, `docs/frontend-matriz-rastreabilidade.md` e `docs/frontend-algoritmo-mestre.md`. Estamos na branch `feature/finalizacao-frontend`, com código ainda não validado. Execute a seção 3 de `docs/frontend-transferencia-vscode.md`, corrija as falhas, atualize a matriz e o estado de execução com as evidências e depois continue pela próxima pendência do plano (`docs/frontend-plano-finalizacao.md`, item 9: Relatórios).

## 6. Se o bundle não chegar ao computador

O trabalho também pode ser recuperado da conversa em que foi feito: os arquivos `doasync-finalizacao.bundle` e o `.zip` dos patches foram enviados como anexos. Os commits não estão no GitHub.
