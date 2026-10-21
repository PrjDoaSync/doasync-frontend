# DoaSync — Gestão e Dashboard (Web)

Front-end web da Equipe 4, feito com React + Vite.

## Como rodar

```bash
cd web
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:8080
npm run dev
```

Outros comandos: `npm run build` (build de produção) e `npm run lint`.

## O que já existe e a qual issue pertence

| Issue | O que é | Onde está |
|---|---|---|
| #34 | Cliente HTTP Axios: URL base por variável de ambiente, timeout e erros padronizados | `src/services/` |
| #36 | Loading e tratamento de erros: hook `useRequest` e componentes `Loading`, `ErrorMessage`, `RequestState` | `src/hooks/`, `src/components/` |
| #28 | Telas de Gestão de Campanhas, Doações e Entidades, com dados mockados | `src/pages/`, `src/components/layout/`, `src/mocks/` |

## Estrutura de `src/`

```
components/        componentes reutilizáveis (tabela, filtros, badges, cards, loading/erro)
components/layout/ layout com barra lateral e topo
hooks/             useRequest (chamada de API com loading, erro e cancelamento)
mocks/             dados fictícios e services de mentira (mesma interface dos reais)
pages/             uma página por tela: Campanhas, Doações, Entidades
services/          cliente Axios e services reais da API
utils/             formatação de moeda e data
```

## Como trocar os mocks pela API (issue #35)

Os mocks em `src/mocks/index.js` têm a mesma interface dos services reais
(`listar` e `buscarPorId`). Em cada página em `src/pages/`, basta trocar:

```js
import { campanhasService } from '../mocks'
// por
import { campanhasService } from '../services/campanhasService'
```

## Observações

- Os caminhos da API (`/campanhas`, `/doacoes`, `/entidades`) e a porta 8080 são
  suposições e devem ser confirmados com o back-end (Spring Boot).
- As telas seguem o padrão visual do Figma de Gestão. O Figma não tem uma tela de
  lista de Campanhas, então ela segue o mesmo padrão das demais.
- Itens do menu sem página ainda (Dashboard, Relatórios, Configurações) aparecem
  desativados; pertencem a outras issues.
