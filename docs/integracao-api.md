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
6. **Ao integrar uma tela com o backend, apagar os dados mockados que ela usava.** A tela passa a depender só da API (sem modo demonstração). Mocks ainda usados por telas não integradas continuam até a vez delas. Nos testes, a API é simulada com fixtures no formato do contrato.
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

O front usa `http://localhost:8080/api/v1` por padrão. Para apontar para outro backend, crie **`web/.env.development.local`** (ignorado pelo git) com `VITE_API_URL=...`. **Não use `.env` nem `.env.local`** (ver §6).

> As telas já integradas (§4) **precisam do backend rodando**: sem ele mostram "Não foi possível conectar ao servidor.". As demais ainda usam dados de demonstração.

### Subir o backend (terminal 1)
```bash
cd doasync-backend
git switch main                  # a correção de CORS (PR #70) está na main; a develop ainda não a tem
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
Cria e aprova 2 entidades, 4 campanhas (3 ativas + 1 rascunho), uma doadora e 2 doações. Pode ser executado de novo sem duplicar. **Rode sempre que reiniciar o backend** (o banco é em memória). Contas criadas:

| Conta | Senha | Tipo |
|---|---|---|
| `admin@doasync.local` | `admin12345` | ADMIN |
| `apae@doasync.local` | `senha1234` | ENTIDADE (APAE Florianópolis) |
| `amor@doasync.local` | `senha1234` | ENTIDADE (Associação Amor Inclusivo) |
| `maria@doasync.local` | `senha1234` | PESSOA_FISICA (doadora) |

### Subir o frontend
```bash
cd doasync-frontend/web
npm run dev                      # http://localhost:5173
```


---

## 3. Configuração

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Base do cliente Axios (`src/services/config.js`) |

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
| 7 | Detalhe via `GET /campanhas/{id}` (`useCampanhaPublica`) + últimas doações | ✅ |
| 8 | Telas públicas leem sempre a API; flag `VITE_USE_API` removida; testes com fixtures da API | ✅ |
| **Fase 2** | **Autenticação** | |
| 9 | `authService` (`POST /auth/login`) + `AuthProvider`/`useAuth` (sessão, expiração, 401, logout) | ✅ |
| 10 | Tela de login real + redirecionamento por tipo + cabeçalhos com sessão | ✅ |
| 11 | Proteção das rotas de gestão | ⏳ |

### Próximo passo
**Passo 11** — proteger as rotas de gestão (`/dashboard`, `/campanhas`, `/doacoes`, …): sem sessão de `ENTIDADE`/`ADMIN` → redireciona para `/login` guardando a rota de origem (`state.de`, já lida pelo login). Remove o botão "Acessar demonstração" do login. Testes de gestão passam a abrir com sessão.

**Antes de começar:** subir o backend (`main`) e rodar `node scripts/popular-api.mjs`.

### Telas integradas até agora
| Tela | Rota | Fonte (sempre a API) |
|---|---|---|
| Home | `/` | `GET /campanhas?limit=50` |
| Explorar | `/explorar` | `GET /campanhas?limit=50` (busca, filtros e paginação no front) |
| Detalhe | `/campanhas/:id` | `GET /campanhas/{id}` (404 → "Campanha não encontrada") |
| Login | `/login` | `POST /auth/login` (recuperação de senha segue sem backend) |

---

## 5. Dependências externas

| Item | Repositório | Branch / PR | Status |
|---|---|---|---|
| CORS em `/api/v1/**` para o front | doasync-backend (Equipe 2) | PR #70 (`fix/cors-frontend`) | ✅ mesclado na **`main`** (não na `develop`) |
| Expor `versao` na resposta de campanha | doasync-backend (Equipe 2) | — | ⏳ necessário na Fase 4 |

---

## 6. Descobertas

Anotações feitas durante o trabalho. Acrescente aqui tudo o que não é óbvio.

### Ambiente
- **Variáveis do Vite:** o Vitest também lê `.env.local` (isso já quebrou 8 testes quando havia uma flag lá). Use `.env.development.local`, que só vale para o `npm run dev`. `.env` não está no `.gitignore` (só `*.local`), então não deve ser usado.
- **Acentos no `curl` do Git Bash (Windows):** JSON com acentos passado como argumento chega corrompido e o backend rejeita. Use o script Node (`scripts/popular-api.mjs`) ou o Swagger.
- **Fim de linha:** os arquivos do front usam CRLF. Scripts com regex de `\n` falham silenciosamente.
- **Upstream do git:** ao criar uma branch a partir de `origin/develop`, ela passa a rastrear a `develop`. Rode `git branch --unset-upstream` e faça o primeiro push com `git push -u origin <branch>`.
- O `gh` (GitHub CLI) não está instalado na máquina de origem: PRs são abertos pelo link impresso no `git push`.

### API (doasync-backend)
- **Login:** `POST /auth/login` devolve `{ token, tipoToken: "Bearer", expiraEm, usuario: { id, nome, email, tipo, entidadeId, statusEntidade } }`; o token expira em 8 h. O backend ignora o header `Authorization` no login.
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
- **Sessão (passo 9):** guardada em `localStorage` na chave `doasync.sessao` como `{ token, expiraEm, usuario }`; sessão expirada é descartada ao ler. Um 401 em requisição **com token** (exceto o próprio login) limpa a sessão e dispara o evento `doasync:sessao-encerrada`, que o `AuthProvider` escuta. O logout automático na expiração limita o `setTimeout` a 2^31−1 ms (acima disso ele dispara na hora).
- **Testes:** `setup.js` também limpa a sessão depois de cada teste. Testes que renderizam cabeçalhos fora do `App` precisam envolver com `<AuthProvider>`.
- **Login (passo 10):** destino pós-login em `src/utils/auth.js` (`ENTIDADE`/`ADMIN` → `/dashboard`, doador → `/`), ou a rota em `location.state.de`. O cabeçalho público mostra "Olá, {primeiro nome}" e "Sair"; "Área de gestão" só para `ENTIDADE`/`ADMIN`. Não há endpoint de recuperação de senha no backend.
- **Fast refresh do Vite:** não exportar funções utilitárias de arquivos de componente (`pages/*.jsx`); colocá-las em `src/utils/`.
- **Mocks compartilhados:** `dados.campanhas`, `HOJE_DEMO` e `categorias` também alimentam gestão e doação; só podem ser apagados quando essas telas forem integradas. Nas telas públicas o caminho de demonstração já foi removido.
- **Testes:** `src/test/setup.js` instala, antes de cada teste, um adaptador Axios que responde como o backend (`src/test/fixtures/apiCampanhas.js`). Testes que precisam de outra resposta trocam `api.defaults.adapter`.
- **Explorar sem dados da API:** o filtro "Localização" só aparece quando houver cidades (a API não informa); as categorias vêm das campanhas recebidas; "Encerradas" fica sempre vazio na vitrine pública.
- Sem backend, as telas integradas mostram "Não foi possível conectar ao servidor." com opção de tentar novamente (verificado manualmente).
- Todas as telas leem de um único `DemoProvider` (`useDemo().dados`). A integração é feita tela a tela com hooks que escolhem entre API e demonstração (ex.: `useCampanhasPublicas`).
- Os IDs da demonstração são números; os da API são UUIDs. A ordenação "recentes" usa `criadaEm`.
- Nas telas integradas a data de referência é o dia real; nas de demonstração continua o `HOJE_DEMO` fixo.
- Não existe tela de cadastro de doador, embora a API tenha `POST /doadores`.
- **Detalhe:** `ultimasDoacoes` traz só doações `CONFIRMADA`, mais recentes primeiro; doação anônima já chega como `nomeDoador: "Doador anônimo"`. O botão "Doar itens" foi escondido no modo API (sem suporte no backend).
- O script `scripts/popular-api.mjs` também cria a doadora `maria@doasync.local` / `senha1234` com 2 doações PIX (R$ 150 e R$ 80 anônima) em "Cadeiras de rodas para a APAE".

---

## 7. Decisões

- 2026-11-23 — Trabalho na branch `feature/integracao-api`; PR para `develop` ao fim de cada fase.
- 2026-11-23 — ~~O modo demonstração é preservado por flag (`VITE_USE_API`).~~ **Substituída:** cada tela integrada usa só a API e seus mocks são apagados (§1, regra 6).
- 2026-11-23 — A correção de CORS vira PR no backend (`fix/cors-frontend`); revisão e merge com a Equipe 2.
- 2026-11-23 — A flag `VITE_USE_API` foi removida no passo 8: com os mocks saindo tela a tela, ela deixou de ter função.
- 2026-11-23 — PRs da Fase 1 aprovados: front #143 em `develop`; CORS do backend #70 em `main`. `feature/integracao-api` continua sendo a branch de trabalho (atualizada com a `develop`).
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
| 2026-11-23 | `feat(frontend): exibir detalhe da campanha a partir da API` | Passo 7 — fecha a Fase 1 |
| 2026-11-23 | `refactor(frontend): telas públicas leem apenas a API` | Passo 8 — sem modo demonstração nas telas públicas; fixtures da API nos testes |
| 2026-11-23 | `feat(frontend): adicionar sessão autenticada com POST /auth/login` | Passo 9 — `authService`, `AuthProvider`, `useAuth` |
| 2026-11-23 | `feat(frontend): login real com a API e sessão nos cabeçalhos` | Passo 10 |
