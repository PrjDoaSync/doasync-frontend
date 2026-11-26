# Executar e demonstrar o DoaSync

Use Docker Engine com Compose v2 ou mais recente em modo Linux e Node.js 24 para a carga de demonstração. Clone os dois repositórios conforme o [README](../README.md). A API no PR [#71](https://github.com/PrjDoaSync/doasync-backend/pull/71) inclui a correção de concorrência e a imagem usada pelo Compose do frontend [#146](https://github.com/PrjDoaSync/doasync-frontend/pull/146).

## Primeira execução

Na raiz do frontend, gere um `.env` local. Este exemplo PowerShell preserva uma configuração já existente.

```powershell
function New-DoasyncSecret {
  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return ([BitConverter]::ToString($bytes) -replace '-', '').ToLowerInvariant()
}
if (-not (Test-Path .env)) {
  (Get-Content .env.example) | ForEach-Object {
    if ($_ -match '^(POSTGRES_PASSWORD|DOASYNC_JWT_SEGREDO|ADMIN_PASSWORD|DOASYNC_DEMO_PASSWORD)=$') {
      "$($Matches[1])=$(New-DoasyncSecret)"
    } else {
      $_
    }
  } | Set-Content -Encoding ASCII .env
}
docker compose up --build -d --wait
docker compose ps
node --env-file=.env web/scripts/popular-api.mjs
```

O endereço padrão é `http://localhost:8080`. Se a porta estiver ocupada, mude `DOASYNC_PORT` no `.env`. Se o backend foi clonado em outra pasta, ajuste `DOASYNC_BACKEND_DIR` para o diretório que contém seu Dockerfile.

| Serviço | Porta | Função |
| --- | --- | --- |
| `frontend` | 8080 no host por padrão, vinculada a `127.0.0.1` | Nginx serve a SPA e encaminha `/api/` ao Spring pela rede interna |
| `backend` | 8080 na rede do Compose | Spring com perfil `prod`, Flyway e API. A inicialização espera o PostgreSQL |
| `postgres` | 5432 na rede do Compose | PostgreSQL 16 com volume nomeado `postgres-data` |

O navegador usa `/api/v1` na mesma origem do frontend. A API e o PostgreSQL ficam acessíveis na rede interna. O healthcheck da API consulta a vitrine e verifica a execução de uma consulta ao banco. O Swagger fica desativado nessa configuração.

## Contas e dados

| Perfil | E-mail | Senha no arquivo local |
| --- | --- | --- |
| Administrador | `admin@doasync.local`, ou o valor de `ADMIN_EMAIL` | `ADMIN_PASSWORD` |
| Entidade de inclusão | `apae@doasync.local` | `DOASYNC_DEMO_PASSWORD` |
| Entidade de educação | `amor@doasync.local` | `DOASYNC_DEMO_PASSWORD` |
| Doador pessoa física | `maria@doasync.local` | `DOASYNC_DEMO_PASSWORD` |

O Spring cria o administrador inicial em uma base vazia. O script registra as outras contas e campanhas pela API, aprova as entidades pelo perfil administrador e insere doações demonstrativas com chaves de idempotência. Use o script apenas em uma base local dedicada. O PIX é um registro persistente no DoaSync, sem cobrança ou liquidação bancária.

## Roteiro para a banca

1. Abra a vitrine, filtre as campanhas e mostre o progresso de uma delas.
2. Entre como doador, apoie uma campanha e abra o comprovante e o histórico. Mostre o aviso sobre a natureza demonstrativa do PIX.
3. Entre como entidade, abra o dashboard, crie uma campanha em rascunho e edite-a. Mostre as doações recebidas e baixe o CSV de arrecadação.
4. Entre como administrador e mostre a lista de entidades e contas. Para demonstrar aprovação, cadastre uma entidade fictícia em uma janela anônima e aprove-a na área administrativa.
5. Para demonstrar persistência, pare e recrie os containers. Entre de novo e abra a campanha e a doação criadas.

## Parar, recriar e diagnosticar

```sh
docker compose down
docker compose up -d --wait
docker compose ps
docker compose logs --tail 50 backend
```

Use o mesmo projeto Compose e volume para reabrir a mesma base. Alterar `ADMIN_PASSWORD` no `.env` após o primeiro boot não troca a senha existente. Alterar `POSTGRES_PASSWORD` exige atualizar a credencial no banco e na aplicação de forma coordenada.

## Rodar as suítes em Linux

```sh
docker build --target build -t doasync-frontend-qa ./web
docker run --rm doasync-frontend-qa sh -ec 'npm run lint && npm run typecheck && npm test'
docker build --target qa -t doasync-backend-qa ../doasync-backend/backend
docker run --rm doasync-backend-qa ./mvnw -B verify
```

O último comando usa a configuração padrão de testes Java. Para exercitar a variante PostgreSQL, use uma instância de teste separada e forneça `DOASYNC_TEST_JDBC_URL`, `DOASYNC_TEST_JDBC_USER` e `DOASYNC_TEST_JDBC_PASSWORD` como no workflow do backend.

## Validação da entrega

- Compose subiu Nginx, Spring e PostgreSQL 16, com os três serviços saudáveis e seis migrations Flyway aplicadas. Repetir a carga manteve as mesmas campanhas e doações iniciais.
- Playwright verificou a interface em 390, 768 e 1366 px, cadastro de doador e entidade, aprovação administrativa, login, edição de perfil, doação por campanha e direta, comprovante, histórico, dashboard, CSV e controle de contas.
- O comprovante compartilhava uma classe CSS com o formulário de campanhas. Após isolar esse estilo, o comprovante persistido foi reaberto sem rolagem horizontal em 320, 390, 768 e 1366 px.
- Duas abas produziram HTTP 409 na edição de campanha. O rascunho continuou visível e o reenvio usou a versão lida novamente. A API retornou HTTP 401 sem sessão e HTTP 403 em operações restritas com o perfil errado.
- Após `docker compose down` e nova subida, mudaram os três containers e foi preservado o mesmo volume. A comparação confirmou 6 usuários, 5 campanhas, 6 doações e 6 migrations, além dos IDs e versões das campanhas e dos IDs e valores das doações. Login, histórico e comprovante responderam após a recriação.
- O frontend passou em 234 testes, lint, TypeScript e build no Windows e em Linux. Com as suítes Java e Web simultâneas em uma VM limitada, um teste de cadastro excedeu o tempo de espera durante o carregamento. A suíte Web passou em Linux com um worker, sem alterar esse teste.
- O Maven passou em 270 testes no Windows e em 270 no container Linux, com a variante PostgreSQL em uma instância isolada para as suítes configuradas.

Para homologação e nuvem, veja [Preparação para produção](PRODUCTION_READINESS.md).
