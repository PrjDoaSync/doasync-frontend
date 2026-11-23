# Integração Frontend Web × API — registro vivo

> Documento atualizado **a cada commit** da branch `feature/integracao-api`.
> Serve para retomar o trabalho em qualquer máquina: leia a seção **Próximo passo** e siga.
> Plano completo e justificativas: [plano-integracao-api.md](plano-integracao-api.md).

**Última atualização:** 2026-11-23

---

## 1. Retomar em outra máquina

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
cp .env.example .env    # PowerShell: Copy-Item .env.example .env
```

### Subir o backend (terminal 1)
```bash
cd doasync-backend/backend
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run
```
- Pronto quando aparecer `Started DoasyncApplication` (~15 s). Porta **8080**.
- Banco H2 **em memória**: tudo é apagado ao parar; só o admin é recriado.
- Admin: `admin@doasync.local` / `admin12345`. Swagger: http://localhost:8080/swagger-ui.html
- ⚠️ Não use `npm start` no backend: é um MVP antigo em Node na mesma porta.
- Se a correção de CORS ainda não estiver na `develop` do backend, use a branch `fix/cors-frontend` (ver §4).

### Subir o frontend (terminal 2)
```bash
cd doasync-frontend/web
npm run dev                      # http://localhost:5173
```

### Verificações antes de cada push (iguais à CI)
```bash
npm run lint && npm test && npm run build
```

### Popular o backend com dados de teste
O banco começa vazio (sem campanhas). Fluxo mínimo, via Swagger ou curl:
1. `POST /api/v1/auth/login` como admin → token.
2. `POST /api/v1/entidades` (público) → entidade `PENDENTE`.
3. `PATCH /api/v1/entidades/{id}/status` com token admin, `{"status":"APROVADA"}`.
4. Login com a entidade → `POST /api/v1/campanhas` (`dataInicio` ≤ hoje para ficar `ATIVA`).

---

## 2. Configuração

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Base do cliente Axios (`src/services/api.js`) |
| `VITE_USE_API` | `false` | `true` liga a leitura da API nas telas já integradas; `false` mantém o modo demonstração |

---

## 3. Estado atual

| Passo | Descrição | Status |
|---|---|---|
| 1 | Plano de integração | ✅ |
| — | Este documento vivo | ✅ |
| 2 | `.env.example` (`/api/v1`) e flag `VITE_USE_API` (`src/services/config.js`) | ✅ |
| 3 | `normalizeError` lendo `error` / `erros` | ✅ |
| 4 | Interceptor `Authorization: Bearer` | ✅ |
| 5 | Mappers API → front (campanha) | ✅ |
| — | CORS no backend (`fix/cors-frontend`) | ✅ |
| 6 | Home/Explorar via `GET /campanhas` | ⏳ |
| 7 | Detalhe via `GET /campanhas/{id}` | ⏳ |

### Próximo passo
**Passo 6** — Home e Explorar leem `GET /campanhas` quando `VITE_USE_API=true` (service + mapper; modo demonstração intacto com a flag desligada). Abrir o PR do backend: https://github.com/PrjDoaSync/doasync-backend/pull/new/fix/cors-frontend (base `develop`).

---

## 4. Dependências externas

| Item | Repositório | Branch / PR | Status |
|---|---|---|---|
| CORS em `/api/v1/**` para o front | doasync-backend (Equipe 2) | `fix/cors-frontend` (commit `8986154`) | 🔄 branch no GitHub, PR para `develop` a abrir; revisão/merge com a Equipe 2 |
| Expor `versao` na resposta de campanha (o `PATCH /campanhas/{id}` exige o campo, mas o `GET` não o devolve) | doasync-backend (Equipe 2) | — | ⏳ necessário na Fase 4 |

---

## 5. Decisões

- 2026-11-23 — Trabalho na branch `feature/integracao-api`, com push a cada commit e PR para `develop` ao fim de cada fase.
- 2026-11-23 — O modo demonstração é preservado por flag (`VITE_USE_API`); a suíte existente continua usando mocks.
- 2026-11-23 — A correção de CORS vira PR no backend (`fix/cors-frontend`); revisão e merge com a Equipe 2.

---

## 6. Histórico de commits

| Data | Commit | Resumo |
|---|---|---|
| 2026-11-23 | `docs(frontend): adicionar plano de integração com a API` | Plano por fases |
| 2026-11-23 | `docs(frontend): adicionar registro vivo da integração` | Este documento |
| 2026-11-23 | `feat(frontend): configurar URL da API v1 e flag VITE_USE_API` | Passo 2 |

| 2026-11-23 | `feat(frontend): ler erros no formato do backend em normalizeError` | Passo 3 |
| 2026-11-23 | `feat(frontend): enviar token JWT nas requisições à API` | Passo 4 — `src/services/token.js` e interceptor |
| 2026-11-23 | `feat(frontend): adicionar mappers de campanha da API para as telas` | Passo 5 — `src/services/mappers.js` |
| 2026-11-23 | `fix(cors): liberar /api/v1/** para o frontend Web` | **Backend** `8986154` na branch `fix/cors-frontend` — 269 testes passando |