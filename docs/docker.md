# Execução com Docker Compose

## Arquitetura

```
navegador -> Nginx (frontend estático + proxy /api/v1) -> Spring Boot (backend) -> PostgreSQL 16
```

- O frontend chama `/api/v1` na mesma origem (`VITE_API_URL=/api/v1` no build); o Nginx encaminha para `backend:8080`.
- Rede interna `doasync-net`. O PostgreSQL não publica porta. O backend só publica em `127.0.0.1:${API_PORT}` (Swagger/testes). Só o frontend (`WEB_PORT`) é o ponto de entrada.
- Dados em volume nomeado `doasync-pgdata` (no Compose: `doasync_doasync-pgdata`).

## Layout de diretórios

Repositórios adjacentes (o `build.context` do backend aponta para a pasta `backend/` dele):

```
<pasta>/doasync-frontend/   <- este repositório (docker-compose.yml na raiz)
<pasta>/doasync-backend/backend/
```

Outro caminho: `DOASYNC_BACKEND_DIR=../outro-diretorio/backend` no `.env`.

## Variáveis (`.env`)

Copie `.env.example` para `.env` (não versionado) e troque todos os valores. Segredos: `openssl rand -hex 32`.

| Variável | Uso |
| --- | --- |
| `DOASYNC_BACKEND_DIR` | Contexto de build do backend |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Banco (senha obrigatória) |
| `DOASYNC_JWT_SEGREDO` | Segredo do JWT (obrigatório, forte) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Administrador inicial (senha obrigatória) |
| `SWAGGER_ENABLED` | `false` em produção |
| `DOASYNC_CORS_ORIGINS` | Origens permitidas (padrão: `http://localhost:WEB_PORT`) |
| `WEB_PORT` / `API_PORT` | Portas no host (8090 / 8091 em loopback) |

## Comandos

```
docker compose up -d --build     # subir (constrói se preciso)
docker compose ps                # estado e healthchecks
docker compose logs -f backend   # logs
docker compose stop              # parar SEM apagar dados
docker compose start             # retomar
```

Nunca use `docker compose down -v`: o `-v` apaga o volume do banco.

## Migrations

O Flyway roda automaticamente na inicialização do backend. Nunca execute `clean` (está desabilitado no perfil `prod`).

## Backup e restauração

```
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < backup.sql
```

Restaure em banco vazio (ou de homologação). Guarde backups fora do host e teste a restauração periodicamente.

## Atualização e rollback

```
git fetch --tags && git checkout <tag-ou-commit>   # frontend
# idem no repositório do backend
docker compose up -d --build
```

Rollback: volte ao tag/commit anterior nos dois repositórios e repita `up -d --build`. Faça backup antes: migrations já aplicadas não são desfeitas automaticamente.

## HTTPS e domínio

Coloque um proxy reverso com TLS (Caddy, Traefik, Nginx + Let's Encrypt) na frente do serviço `frontend`, encaminhando para `WEB_PORT` com `X-Forwarded-Proto`. Defina `DOASYNC_CORS_ORIGINS=https://seu-dominio`. Não exponha backend nem banco.

## Checklist de publicação

- [ ] `.env` com segredos fortes e únicos; `SWAGGER_ENABLED=false`
- [ ] `DOASYNC_CORS_ORIGINS` com o domínio HTTPS
- [ ] TLS e domínio configurados no proxy reverso
- [ ] Apenas o frontend acessível externamente (`ss -tlnp`/firewall)
- [ ] `docker compose ps` com 3 serviços `healthy`
- [ ] Backup do banco testado e agendado
- [ ] Tag/commit de frontend e backend registrados para rollback
