# Integração Frontend Web × API — registro vivo

> Documento de contexto da branch `feature/integracao-api`, atualizado **a cada entrega aprovada**.
> Para retomar em qualquer máquina: leia **§1 Forma de trabalhar**, siga **§2 Retomar** e continue pelo **Próximo passo** (§4).
> Plano completo e justificativas: [plano-integracao-api.md](plano-integracao-api.md).

**Última atualização:** 2026-11-23

---

## 1. Forma de trabalhar

Combinado com o responsável (João Pedro Matias):

1. **Passos pequenos**: cada entrega é uma mudança pequena e isolada.
2. **Ao terminar um passo**, enviar um resumo **bem curto** com:
   - o que foi feito;
   - o que fazer para testar (passos concretos, URLs, contas).
3. **Aguardar a aprovação** antes de commitar.
4. **Após aprovado**: atualizar este documento (estado, próximo passo, descobertas, histórico), commitar e dar push no GitHub.
5. Antes de cada push rodam os mesmos checks da CI: `npm run lint && npm test && npm run build` (no backend: `./mvnw verify`).
6. O **modo demonstração** nunca é quebrado: tudo o que lê a API fica atrás da flag `VITE_USE_API`.
7. Tudo o que for descoberto durante o trabalho (comportamentos da API, armadilhas do ambiente, divergências de contrato) é anotado em **§6 Descobertas**.
8. Commits seguem o padrão do repositório (`feat(frontend): …`, `docs(frontend): …`, `fix(cors): …`). PR para `develop` ao fim de cada fase.

---

## 2. Retomar em outra máquina

### Pré-requisitos
- Git, Node.js 22+ e Java 17+ (testado com Java 26). Não é necessário PostgreSQL nem Docker.

### Clonar e preparar
```bash
git clone https://github.com/PrjDoaSync/doasync-frontend.git
git clone https://github.com/PrjDoaSync/doasync-backend.git

cd doasync-frontend
git switch feature/integracao-api
cd web
npm ci
```

Para o `npm run dev` ler a API, crie **`web/.env.development.local`** (ignorado pelo git):
```
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_API=true
```
Sem esse arquivo o front roda em modo demonstração. **Não use `.env` nem `.env.local`** (ver §6).

### Subir o backend (terminal 1)
```bash
cd doasync-backend
git switch fix/cors-frontend     # enquanto a correção de CORS não estiver na develop (ver §5)
cd backend
./mvnw spring-boot:run           # Windows: .\mvnw.cmd spring-boot:run
```
- Pronto quando aparecer `Started DoasyncApplication` (~15 s). Porta **8080**.
- Banco H2 **em memória**: tudo é apagado ao parar; só o admin é recriado.
- Admin: `admin@doasync.local` / `admin12345`. Swagger: http://localhost:8080/swagger-ui.html
- ⚠️ Não use `npm start` no backend: é um MVP antigo em Node na mesma porta.

### Popular o backend com dados de teste (terminal 2)
```bash
cd doasync-frontend/web
node scripts/popular-api.mjs
```
Cria e aprova 2 entidades e 4 campanhas (3 ativas + 1 rascunho). Pode ser executado de novo sem duplicar. Contas criadas:

| Conta | Senha | Tipo |
|---|---|---|
| `admin@doasync.local` | `admin12345` | ADMIN |
| `apae@doasync.local` | `senha1234` | ENTIDADE (APAE Florianópolis) |
| `amor@doasync.local` | `senha1234` | ENTIDADE (Associação Amor Inclusivo) |

### Subir o frontend
```bash
cd doasync-frontend/web
npm run dev                      # http://localhost:5173
```
O Vite só lê os arquivos `.env*` na inicialização: reinicie o `npm run dev` ao mudar a flag.

---

## 3. Configuração

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Base do cliente Axios (`src/services/config.js`) |
| `VITE_USE_API` | `false` | `true` liga a leitura da API nas telas já integradas; `false` mantém o modo demonstração |

---

## 4. Estado atual

| Passo | Descrição | Status |
|---|---|---|
| 1 | Plano de integração | ✅ |
| — | Este documento de contexto | ✅ |
| 2 | `.env.example` (`/api/v1`) e flag `VITE_USE_API` (`src/services/config.js`) | ✅ |
| 3 | `normalizeError` lendo `error` / `erros` | ✅ |
| 4 | Interceptor `Authorization: Bearer` (`src/services/token.js`) | ✅ |
| 5 | Mappers API → front (`src/services/mappers.js`) | ✅ |
| — | CORS no backend (`fix/cors-frontend`) | ✅ |
| 6 | Home/Explorar via `GET /campanhas` (`useCampanhasPublicas`) + script de seed | ✅ |
| 7 | Detalhe via `GET /campanhas/{id}` | ⏳ |

### Próximo passo
**Passo 7** — `DetalheCampanha` (`src/pages/Publico.jsx`) lê `GET /campanhas/{id}` quando `VITE_USE_API=true`, incluindo `ultimasDoacoes`; 404 vira "campanha não encontrada". Fecha a Fase 1 → abrir PR de `feature/integracao-api` para `develop`.

### Telas integradas até agora
| Tela | Rota | Fonte com `VITE_USE_API=true` |
|---|---|---|
| Home | `/` | `GET /campanhas?limit=50` |
| Explorar | `/explorar` | `GET /campanhas?limit=50` (busca, filtros e paginação no front) |

---

## 5. Dependências externas

| Item | Repositório | Branch / PR | Status |
|---|---|---|---|
| CORS em `/api/v1/**` para o front | doasync-backend (Equipe 2) | `fix/cors-frontend` (commit `8986154`) | 🔄 branch no GitHub; PR para `develop` a abrir: https://github.com/PrjDoaSync/doasync-backend/pull/new/fix/cors-frontend |
| Expor `versao` na resposta de campanha | doasync-backend (Equipe 2) | — | ⏳ necessário na Fase 4 |

---

## 6. Descobertas

Anotações feitas durante o trabalho. Acrescente aqui tudo o que não é óbvio.

### Ambiente
- **Variáveis do Vite:** o Vitest também lê `.env.local`. Com `VITE_USE_API=true` nesse arquivo, a suíte roda em modo API e 8 testes falham. Use `.env.development.local`, que só vale para o `npm run dev`. `.env` não está no `.gitignore` (só `*.local`), então não deve ser usado.
- **Acentos no `curl` do Git Bash (Windows):** JSON com acentos passado como argumento chega corrompido e o backend rejeita. Use o script Node (`scripts/popular-api.mjs`) ou o Swagger.
- **Fim de linha:** os arquivos do front usam CRLF. Scripts com regex de `\n` falham silenciosamente.
- **Upstream do git:** ao criar uma branch a partir de `origin/develop`, ela passa a rastrear a `develop`. Rode `git branch --unset-upstream` e faça o primeiro push com `git push -u origin <branch>`.
- O `gh` (GitHub CLI) não está instalado na máquina de origem: PRs são abertos pelo link impresso no `git push`.

### API (doasync-backend)
- **Base `/api/v1`**; o front apontava para `/api`, que só existe como alias legado somente leitura (cliente antigo da Equipe 4).
- **Erros:** `{ "error": "..." }` em geral e `{ "erros": { "campo": "..." } }` em validação (422). `normalizeError` expõe `message` e `campos`.
- **Vitrine pública** (`GET /campanhas` sem token): só campanhas `ATIVA` de entidade `APROVADA` dentro do período. `RASCUNHO` nunca aparece. O filtro "Encerradas" do Explorar fica vazio no modo API.
- **Paginação:** `limit` máximo 50. A vitrine busca uma página de 50 e filtra no front, o que basta para o volume atual.
- **Campos sem equivalente na API:** cidade, doação de itens (`necessidades`, `itensMeta`), galeria. O mapper preenche com valores neutros, e o filtro "Localização" fica sem opções.
- **Sem upload de imagem:** sem `imagemUrl`, o mapper usa `/images/cestas.jpg`.
- **`POST /doacoes`:** o contrato diz que `entidadeId` é sempre obrigatório, mas a API exige **exatamente um** entre `campanhaId` e `entidadeId` (enviar os dois → 422). O comprovante tem formato `DS-XXXXXXXXXXXX`, e não `DOA-2025-00001` como no contrato.
- **`PATCH /campanhas/{id}`** exige `versao` (lock otimista), mas nenhuma resposta de campanha devolve esse campo.
- **Status de campanha:** a API usa `RASCUNHO | AGENDADA | ATIVA | ENCERRADA | DESATIVADA`; a criação com `dataInicio` ≤ hoje já nasce `ATIVA`.
- O `main` e o `develop` do backend diferem só por uma linha do README; o PR de CORS parte da `develop`.

### Frontend
- Todas as telas leem de um único `DemoProvider` (`useDemo().dados`). A integração é feita tela a tela com hooks que escolhem entre API e demonstração (ex.: `useCampanhasPublicas`).
- Os IDs da demonstração são números; os da API são UUIDs. A ordenação "recentes" usa `criadaEm` quando os IDs não são numéricos.
- No modo API, a data de referência das telas é o dia real; na demonstração é o `HOJE_DEMO` fixo.
- Não existe tela de cadastro de doador, embora a API tenha `POST /doadores`.

---

## 7. Decisões

- 2026-11-23 — Trabalho na branch `feature/integracao-api`; PR para `develop` ao fim de cada fase.
- 2026-11-23 — O modo demonstração é preservado por flag (`VITE_USE_API`); a suíte existente continua usando mocks.
- 2026-11-23 — A correção de CORS vira PR no backend (`fix/cors-frontend`); revisão e merge com a Equipe 2.
- 2026-11-23 — Ciclo de entrega: resumo curto + como testar → aprovação → documento + commit + push (§1).

---

## 8. Histórico de commits

| Data | Commit | Resumo |
|---|---|---|
| 2026-11-23 | `docs(frontend): adicionar plano de integração com a API` | Plano por fases |
| 2026-11-23 | `docs(frontend): adicionar registro vivo da integração` | Este documento |
| 2026-11-23 | `feat(frontend): configurar URL da API v1 e flag VITE_USE_API` | Passo 2 |
| 2026-11-23 | `feat(frontend): ler erros no formato do backend em normalizeError` | Passo 3 |
| 2026-11-23 | `feat(frontend): enviar token JWT nas requisições à API` | Passo 4 |
| 2026-11-23 | `feat(frontend): adicionar mappers de campanha da API para as telas` | Passo 5 |
| 2026-11-23 | `fix(cors): liberar /api/v1/** para o frontend Web` | **Backend** `8986154` (`fix/cors-frontend`), 269 testes |
| 2026-11-23 | `docs(frontend): registrar correção de CORS no backend` | Estado do CORS |
| 2026-11-23 | `feat(frontend): exibir campanhas da API na Home e no Explorar` | Passo 6 + `scripts/popular-api.mjs` + forma de trabalhar e descobertas |
