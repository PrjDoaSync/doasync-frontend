# Integração Frontend Web × API — registro vivo

> Documento de contexto da branch `feature/integracao-api`, atualizado **a cada entrega aprovada**.
> Para retomar em qualquer máquina: leia **§1 Forma de trabalhar**, siga **§2 Retomar** e continue pelo **Próximo passo** (§4).
> Plano completo e justificativas: [plano-integracao-api.md](plano-integracao-api.md).

**Última atualização:** 2026-11-23

---

## 1. Forma de trabalhar

Combinado com o responsável (João Pedro Matias):

1. **Passos pequenos**: cada entrega é uma mudança pequena e isolada.
2. **A partir do passo 16 (2026-11-25):** os passos seguem em sequência **sem pausa para aprovação**. Cada passo: código + testes → checks → atualizar este documento (estado, próximo passo, descobertas, histórico) → commit → push.
3. **Ao final da sequência**, entregar ao responsável **um roteiro único** com tudo o que deve ser testado.
4. (Passos 1–15: cada passo terminava com um resumo curto + como testar, e só era commitado após aprovação.)
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
git switch feat/campanha-versao  # main + versao no detalhe de campanha (§5); depois do merge, use a main
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
| 11 | Proteção das rotas de gestão (`RotaProtegida`) + "Acesso restrito" para doador | ✅ |
| **Fase 3** | **Doação (PIX)** | |
| 12 | Fluxo `/doar/:id` → `POST /doacoes` (PIX, doador logado, anônima, `Idempotency-Key`); itens/cartão/boleto/agendamento removidos | ✅ |
| 13 | Tela `/cadastro-doador` (`POST /doadores`, PF/PJ) com login automático e volta à doação | ✅ |
| 14 | Comprovante `/doar/:id/confirmacao/:doacaoId` via `GET /doacoes/{id}`; o fluxo navega para ele ao concluir | ✅ |
| 15 | Minhas doações (`GET /usuarios/me/doacoes`) + detalhe = comprovante (`/minhas-doacoes/:id`) | ✅ |
| **Fase 4** | **Gestão da entidade** (hoje: telas protegidas, mas com dados de demonstração) | |
| 16 | Cadastro de entidade (`/cadastro-entidade` → `POST /entidades`, no layout público; documentos removidos) | ✅ |
| 17 | Perfil da entidade (`/configuracoes` → `GET` + `PATCH /entidades/{id}`); preferências e documentos removidos | ✅ |
| 18 | Gestão de campanhas (`/campanhas` → `GET /campanhas` por status; entidade = as próprias, ADMIN = todas) | ✅ |
| 19 | Criar campanha (`/campanhas/nova` → `POST /campanhas`, `rascunho: true` para rascunho) | ⏳ |
| 20 | Editar campanha (`PATCH /campanhas/{id}` com `versao`) — **depende do backend expor `versao`** (§5) | ⏳ |
| 21 | Trocar status da campanha (`PATCH /campanhas/{id}/status`, `motivo` obrigatório para `DESATIVADA`) | ⏳ |
| 22 | Doações recebidas (`/doacoes` → `GET /entidades/{id}/doacoes`) e arrecadação (`GET /entidades/{id}/arrecadacao`) no dashboard | ⏳ |
| **Fase 5** | **Administração** | |
| 23 | Dashboard do ADMIN (`GET /dashboard/kpis`) | ⏳ |
| 24 | Usuários (`GET /usuarios`, `PATCH /usuarios/{id}/status`) | ⏳ |
| 25 | Aprovação de entidades (`GET /entidades` + `PATCH /entidades/{id}/status`, `motivo` em `REPROVADA`) | ⏳ |

### Próximo passo
**Passo 19** — criar campanha (`/campanhas/nova` → `POST /campanhas`; `rascunho: true` para rascunho). Itens, galeria e upload de imagem saem (imagem vira URL).

Pontos já conhecidos para a Fase 4:
- Ao integrar cada tela de gestão, **apagar os mocks que só ela usava** (`mocks/gestao.js`, `mocks/campanhasDetalhe.js`, `mocks/dados.js`, `mocks/index.js`); quando a última sair, o `DemoProvider` e o `DemoBanner` saem também.
- Itens, estoque, prestação de contas, equipe da entidade e upload de documentos **não têm API** → seguir a decisão vigente de remover do fluxo o que a API não suporta (§7).
- Telas da gestão leem `usuario.entidadeId` da sessão (`useAuth()`) para montar as rotas `/entidades/{id}/...`.
- Uma entidade `PENDENTE` faz login e entra na gestão; criar campanha responde 409 até a aprovação.

**Antes de começar:** subir o backend (`main`) e rodar `node scripts/popular-api.mjs`. **Reinicie o backend se as doações começarem a dar 500** (ver §6).

**PR pendente:** Fases 2 e 3 (+ Fase 4 em andamento) → `develop`: https://github.com/PrjDoaSync/doasync-frontend/compare/develop...feature/integracao-api

### Telas integradas até agora
| Tela | Rota | Fonte (sempre a API) |
|---|---|---|
| Home | `/` | `GET /campanhas?limit=50` |
| Explorar | `/explorar` | `GET /campanhas?limit=50` (busca, filtros e paginação no front) |
| Detalhe | `/campanhas/:id` | `GET /campanhas/{id}` (404 → "Campanha não encontrada") |
| Login | `/login` | `POST /auth/login` (recuperação de senha segue sem backend) |
| Doação | `/doar/:id` | `GET /campanhas/{id}` + `POST /doacoes` |
| Cadastro de doador | `/cadastro-doador` | `POST /doadores` + `POST /auth/login` |
| Comprovante | `/doar/:id/confirmacao/:doacaoId` | `GET /doacoes/{id}` (exige login) |
| Cadastro de entidade | `/cadastro-entidade` | `POST /entidades` (público; não autentica) |
| Perfil da entidade | `/configuracoes` | `GET` + `PATCH /entidades/{id}` (id da sessão) |
| Gestão de campanhas | `/campanhas` | `GET /campanhas?status=…` × 5 (entidade: `entidadeId` da sessão; ADMIN: todas) |
| Minhas doações | `/minhas-doacoes`, `/minhas-doacoes/:doacaoId` | `GET /usuarios/me/doacoes` (limit 50) + `GET /doacoes/{id}` |
| Gestão (guarda) | `/dashboard`, `/campanhas`, `/doacoes`, … | exige sessão `ENTIDADE`/`ADMIN`; conteúdo ainda é demonstração (Fase 4) |

---

## 5. Dependências externas

| Item | Repositório | Branch / PR | Status |
|---|---|---|---|
| CORS em `/api/v1/**` para o front | doasync-backend (Equipe 2) | PR #70 (`fix/cors-frontend`) | ✅ mesclado na **`main`** (não na `develop`) |
| Expor `versao` na resposta de campanha (necessário para editar) | doasync-backend (Equipe 2) | `feat/campanha-versao` (commit `014bbc6`, 270 testes) | 🔄 branch no GitHub; PR para a `main`: https://github.com/PrjDoaSync/doasync-backend/pull/new/feat/campanha-versao — **até o merge, rode o backend por essa branch** |
| H2 (perfil `dev`) quebra o `INSERT` em `doacoes` após ~30–40 min de execução (ver §6) | doasync-backend (Equipe 2) | — | ⏳ reportar; contorno: reiniciar o backend |

---

## 6. Descobertas

Anotações feitas durante o trabalho. Acrescente aqui tudo o que não é óbvio.

### Ambiente
- **Suíte do front sob carga:** com backend + Vite + testes rodando juntos, uma execução derrubou ~75 testes aleatórios (incluindo Gráfico e layout) e na seguinte passou tudo. Se aparecerem falhas sem relação com a mudança, rode de novo antes de investigar.
- **Testes do backend × servidor rodando:** com o `spring-boot:run` ativo na mesma pasta, `mvnw test` falhou ao subir o contexto ("DOASYNC_JWT_SEGREDO deve ser definido"). Pare o servidor antes de rodar a suíte do backend.
- **Variáveis do Vite:** o Vitest também lê `.env.local` (isso já quebrou 8 testes quando havia uma flag lá). Use `.env.development.local`, que só vale para o `npm run dev`. `.env` não está no `.gitignore` (só `*.local`), então não deve ser usado.
- **Acentos no `curl` do Git Bash (Windows):** JSON com acentos passado como argumento chega corrompido e o backend rejeita. Use o script Node (`scripts/popular-api.mjs`) ou o Swagger.
- **Fim de linha:** os arquivos do front usam CRLF. Scripts com regex de `\n` falham silenciosamente.
- **Upstream do git:** ao criar uma branch a partir de `origin/develop`, ela passa a rastrear a `develop`. Rode `git branch --unset-upstream` e faça o primeiro push com `git push -u origin <branch>`.
- O `gh` (GitHub CLI) não está instalado na máquina de origem: PRs são abertos pelo link impresso no `git push`.

### API (doasync-backend)
- **⚠️ Bug do H2 no perfil `dev`:** depois de ~30–40 min com o backend no ar, **todo** `POST /doacoes` responde 500. No log: `Check constraint invalid: "CONSTRAINT_97AA"` com causa `The database has been closed` em `SessionLocal.getCompareMode`. O H2 2.4.240 avalia a CHECK com uma sessão já fechada (provavelmente reciclada pelo pool Hikari, `maxLifetime` padrão de 30 min). Reiniciar o backend resolve; PostgreSQL não deve ter o problema. GETs e login continuam funcionando.
- **⚠️ CPF/CNPJ com máscara:** as colunas têm `CHECK (LENGTH(cpf) = 14)` e `CHECK (LENGTH(cnpj) = 18)` e o backend não valida nem normaliza o formato: CPF só com dígitos vira **500** ("Check constraint violation") em vez de 422. O front sempre envia `000.000.000-00` / `00.000.000/0000-00` (`formatarCpf`/`formatarCnpj` em `utils/cadastroDoador.js`). O backend também não confere os dígitos verificadores; o front confere.
- **Cadastro de doador:** `POST /doadores` → 201 `{ id, nome, email, tipo, dataCadastro }` **sem token** (é preciso fazer login depois). Erros: 422 `{ erros: {...} }` com todos os campos inválidos; 409 `{ erros: { email | cpf | cnpj: "... já cadastrado." } }`; idade < 18 → 422 em `dataNascimento`.
- **⚠️ Endereço, CEP e UF da entidade:** o backend não valida o `endereco` de `POST /entidades`; o banco exige todos os campos (menos `complemento`) preenchidos, `cep` com 9 caracteres (`00000-000`) e `uf` com 2 letras maiúsculas. Qualquer desvio → **500** (verificado: CEP sem máscara = 500). O CPF do responsável também precisa de máscara (`CHECK LENGTH = 14`). O front valida e formata tudo (`utils/cadastroEntidade.js`).
- **Cadastro de entidade:** `POST /entidades` → 201 com `statusAprovacao: "PENDENTE"`, sem token. O login funciona e devolve `statusEntidade: "PENDENTE"`; `GET /entidades` (público) só lista `APROVADA`. 409 por campo para `email`/`cnpj`; RN46 vem como `{ erros: { responsavel: ... } }`.
- **Perfil da entidade:** `EntidadeResposta` **não devolve o responsável** (nome/CPF) nem o telefone da conta; o perfil só envia o par quando o usuário preenche. `PATCH` com campo ausente/`null` mantém o valor; texto vazio vira `null` (ex.: `site: ""`). `telefone_contato` e `whatsapp` são `VARCHAR(20)` (acima disso → 500; o front limita).
- **Lista de entidades:** `GET /entidades` devolve **só `APROVADA`, inclusive para o ADMIN** (o `listarTodas` do serviço não está exposto). Para a aprovação (passo 25) o caminho é `GET /usuarios?tipo=ENTIDADE` (ADMIN), que traz `entidadeId` e `statusEntidade`.
- **Campanhas da entidade dona:** `GET /campanhas?entidadeId=…` **sem `status` devolve a visão pública** (só ATIVA recebendo doações). Com `status=RASCUNHO|AGENDADA|ATIVA|ENCERRADA|DESATIVADA` a dona (e o ADMIN) veem tudo daquele status → "Minhas campanhas" faz uma chamada por status.
- **Regras de status de campanha:** `RASCUNHO → AGENDADA|ATIVA|DESATIVADA`, `AGENDADA → ATIVA|DESATIVADA`, `ATIVA → ENCERRADA|DESATIVADA`; `ENCERRADA`/`DESATIVADA` são finais; `motivo` obrigatório para `DESATIVADA`. Criar: `rascunho: true` → RASCUNHO; `dataInicio` futura → AGENDADA; senão ATIVA. Imagem: só URL http(s). `dataFim ≥ dataInicio`.
- **Histórico do doador:** `GET /usuarios/me/doacoes` devolve `{ data: DoacaoResponse[], meta }`, mais recentes primeiro. **Ignora o parâmetro `busca`** (apesar do contrato) e limita `limit` a 50 → busca/filtros ficam no front. Entidade/ADMIN recebem 403 "Sem permissão.".
- **Comprovante:** `GET /doacoes/{id}` → 200 para o doador (vê o próprio nome mesmo em doação anônima), para a entidade destino (vê "Doador anônimo" e sem `doador.id`) e para o ADMIN; **404** para qualquer outro usuário (RN71, não revela que existe); 401 sem token. Verificado no backend real.
- **Doação:** `POST /doacoes` aceita `{ campanhaId, valor, formaPagamento: "PIX", anonima, observacao? }` e responde 201 com `DoacaoResponse` já `CONFIRMADA` (não há provedor de pagamento). Mesmo `Idempotency-Key` → 200 "Doação recuperada com sucesso." com o mesmo id (verificado no backend real). Só `PESSOA_FISICA`/`PESSOA_JURIDICA` podem doar.
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
- **Perfil (passo 17):** `PerfilEntidade.jsx` lê `usuario.entidadeId` da sessão; ADMIN vê "Perfil disponível só para entidades". Removidos: `EntityPreferences` (sem API), documentos e as abas para "Usuários e permissões". Validação de responsável/endereço compartilhada com o cadastro (`validarResponsavelEEndereco`, `corpoEndereco`). `StatusBadge` ganhou os status de entidade e de campanha.
- **Gestão de campanhas (passo 18):** `campanhasService.daGestao` faz 5 chamadas em paralelo (uma por status). A ação "Prestar contas" saiu (sem API); "Editar" só para a entidade dona e status Rascunho/Agendada/Ativa (`podeEditar` em `utils/campanhas.js`). Entidade não aprovada vê aviso e não tem "Criar campanha" (o status vem de `usuario.statusEntidade`, gravado no login: após a aprovação é preciso entrar de novo).
- **Fixtures (API simulada):** `fixtures/apiCampanhas.js` mantém um acervo mutável (campanhas públicas + privadas da Rede Esperança, entidades, doações) recriado por `resetarApiSimulada()` antes de cada teste; responde listagem por status, detalhe com `versao`, criação, edição (com lock otimista) e troca de status com as transições do backend.
- **Fixtures de entidade:** `entidadesApi` (em `fixtures/apiCampanhas.js`) responde `GET`/`PATCH /entidades/{id}` e é recriada antes de cada teste (`resetarEntidadesApi` no `setup.js`).
- **Cadastro × perfil (passo 16):** `CadastroEntidade.jsx` era usado por `/cadastro-entidade` e `/configuracoes` (prop `perfil`). Agora o cadastro é uma tela pública própria e o perfil virou `PerfilEntidade.jsx`. O `nome` informado vai também como `nomeFantasia` (é o nome mostrado na vitrine).
- **Minhas doações (passo 15):** sem linha do tempo, destinação, mensagem da entidade, itens, cartão/boleto, exportação e PDFs (sem API). O detalhe reutiliza `ConfirmacaoDoacao` com a prop `historico`. Apagados: `mocks/doador.js`, `pages/DetalheDoacao.jsx`, `styles/detalhe-doacao.css`, o ramo `historicoDoador` do `DemoContext` e as regras `det-*` do CSS. Indicadores em `utils/doacoes.js` (`resumoDoacoes`).
- **Mocks que ainda existem** (só gestão): `mocks/gestao.js` (`carregarDemo`, `categorias`), `mocks/dados.js`, `mocks/campanhasDetalhe.js` (`HOJE_DEMO`, `detalheCampanha`), `mocks/index.js` (serviços simulados de Doacoes/Entidades).
- **Comprovante (passo 14):** ao confirmar, o fluxo faz `navigate(..., { replace: true })` para `/doar/:id/confirmacao/:doacaoId`, que busca a doação na API. Saíram da tela (sem endpoint): PDFs de comprovante/recibo, reenvio por e-mail, destinação; e `mensagemConfirmacao` (`utils/doacoes.js`) com o CSS morto (`.doc-card`, `.lateral-confirmacao`, `.nota-caixa`, …).
- **Fixtures:** o simulador da API guarda as doações criadas por `POST /doacoes` e as devolve em `GET /doacoes/{id}`; `DOACAO_EXISTENTE_ID` abre um comprovante direto pela URL.
- **Erros por campo (passo 13):** o `ajuda` do `Campo` mostra a mensagem e `aria-invalid` deixa borda e texto vermelhos (`index.css`, `.campo [aria-invalid]`). `normalizeError` já entrega `campos` para 409 e 422.
- **CPF de teste válido:** `111.444.777-35` (a doadora do seed usa `529.982.247-25`).
- **Fluxo de doação (passo 12):** 3 etapas (valor → identificação → confirmação). A `Idempotency-Key` é criada uma vez por tentativa (`useState(novaChaveIdempotencia)`), então reenviar após erro não duplica. Visitante vê "Entrar para doar" (volta via `state.de`); entidade/admin veem aviso de que só doadores doam. Saíram: `SelecaoItens`, `Agendamento`, `PagamentoCartaoBoleto`, `PagamentoPix`, `utils/doacao.js`, `paraHistoricoDoador` e o CSS correspondente.
- **Teste instável conhecido:** `criarCampanha.test.jsx` às vezes falha com a máquina carregada, porque `CriarCampanha` (ainda demonstração) tem `pausa(300)` e o `findByRole` espera só 1 s. Passa ao rodar de novo; some quando a tela for integrada (Fase 4).
- **Sessão (passo 9):** guardada em `localStorage` na chave `doasync.sessao` como `{ token, expiraEm, usuario }`; sessão expirada é descartada ao ler. Um 401 em requisição **com token** (exceto o próprio login) limpa a sessão e dispara o evento `doasync:sessao-encerrada`, que o `AuthProvider` escuta. O logout automático na expiração limita o `setTimeout` a 2^31−1 ms (acima disso ele dispara na hora).
- **Testes:** `setup.js` também limpa a sessão depois de cada teste. Testes que renderizam cabeçalhos fora do `App` precisam envolver com `<AuthProvider>`.
- **Login (passo 10):** destino pós-login em `src/utils/auth.js` (`ENTIDADE`/`ADMIN` → `/dashboard`, doador → `/`), ou a rota em `location.state.de`. O cabeçalho público mostra "Olá, {primeiro nome}" e "Sair"; "Área de gestão" só para `ENTIDADE`/`ADMIN`. Não há endpoint de recuperação de senha no backend.
- **Rotas protegidas (passo 11):** `src/components/RotaProtegida.jsx` envolve as rotas de gestão em `App.jsx`. Sem sessão → `/login` com `state.de`; doador → `/acesso-restrito`. `/cadastro-entidade` usa o layout de gestão, mas é **pública** (fica fora do guarda).
- **Testes com login:** `setup.js` salva por padrão a sessão `SESSAO_ENTIDADE_TESTE` (`src/test/fixtures/sessao.js`) antes de cada teste. Testes de visitante chamam `limparSessao()` antes de renderizar. Não importar `setup.js` dentro de um teste (registraria os hooks duas vezes).
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
- 2026-11-23 — O atalho "Acessar demonstração" saiu do login (passo 11): a gestão só abre com login, mesmo ainda exibindo dados de demonstração.
- 2026-11-23 — Doação: o que a API não suporta (itens, cartão/boleto, agendamento, cadastro rápido, código PIX fictício) foi **removido do fluxo**. O cadastro de doador vira tela própria (passo 13).
- 2026-11-23 — Minhas doações: o detalhe de demonstração (linha do tempo/destinação/mensagem) foi substituído pelo comprovante real, seguindo a mesma regra de remover o que a API não suporta.
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
| 2026-11-23 | `feat(frontend): proteger rotas de gestão com login` | Passo 11 — fecha a Fase 2 |
| 2026-11-23 | `feat(frontend): registrar doação PIX real com POST /doacoes` | Passo 12 |
| 2026-11-23 | `feat(frontend): cadastro de doador com POST /doadores` | Passo 13 |
| 2026-11-23 | `feat(frontend): comprovante da doação com GET /doacoes/{id}` | Passo 14 |
| 2026-11-23 | `feat(frontend): minhas doações com GET /usuarios/me/doacoes` | Passo 15 — fecha a Fase 3 |
| 2026-11-25 | `feat(frontend): cadastro de entidade com POST /entidades` | Passo 16 |
| 2026-11-25 | `feat(campanha): expor versao no detalhe para o PATCH de edição` | **Backend** `014bbc6` (`feat/campanha-versao`), 270 testes |
| 2026-11-25 | `feat(frontend): perfil da entidade com GET/PATCH /entidades/{id}` | Passo 17 |
| 2026-11-25 | `feat(frontend): gestão de campanhas com GET /campanhas por status` | Passo 18 |
