# Matriz de rastreabilidade — Figma × Issues × Rotas × API

**Atualizada em:** 2026-11-26 · **Branch:** `feature/finalizacao-frontend`
Figma: arquivo `3eBaQzgxDIRMbhxY0K2DWa` (links `https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=<id>`). Issues: `PrjDoaSync/doasync-frontend`. Endpoints sob `/api/v1`.

Legenda de **Status** (seção 14 do prompt): NI não implementada · IP implementação parcial · ID implementada com divergências · ISI implementada sem integração (demonstração) · II implementada e integrada · BLQ bloqueada por dependência externa.

Coluna **Testes**: arquivo Vitest que cobre a tela (CI `frontend-qa.yml`). Coluna **Render** indica verificação no navegador nesta entrega (✔ renderizou sem erros em 1440 e 390 px; ✱ fluxo interativo executado).

## CAM — Campanhas

| ID | Tela | Figma | Issue | Rota | API | Testes | Render | Status |
|---|---|---|---|---|---|---|---|---|
| CAM-01 | Home pública | `49:3215` | #85 | `/` | `GET /campanhas` | vitrineApi | ✔ | II |
| CAM-02 | Listagem com filtros | `49:3324` | #86 | `/explorar` | `GET /campanhas` (filtros no front) | vitrineApi, fluxos | — | II (sem filtro de localização: API não tem cidade) |
| CAM-03 | Detalhe da campanha | `49:3494` | #87 | `/campanhas/:id` | `GET /campanhas/{id}` | vitrineApi, fluxos | — | II |
| CAM-04 | Criar — dados básicos | `49:3603` | #88 | `/campanhas/nova` | `POST /campanhas` | criarCampanha | — | II |
| CAM-05 | Criar — metas e itens | `49:3729` | #89 | `/campanhas/nova` | meta financeira em `POST /campanhas` | criarCampanha | — | IP · itens BLQ (sem contrato) |
| CAM-06 | Criar — imagens, revisão e publicação | `51:2870` | #90 | `/campanhas/nova` (etapa 2) | `POST /campanhas` (`rascunho`) | criarCampanha | — | ID · upload/galeria BLQ (capa por URL) |
| CAM-07 | Minhas campanhas | `51:3029` | #91 | `/campanhas` | `GET /campanhas?status=` ×5 | gestaoCampanhas | ✔ | II |
| CAM-08 | Editar campanha | `51:3186` | #92 | `/campanhas/:id/editar` | `GET /campanhas/{id}` (`versao`) + `PATCH /campanhas/{id}` | gestaoApi | ✔ ✱ | II · depende de `versao` no detalhe (backend `feat/campanha-versao`) · itens BLQ |
| CAM-09 | Acompanhamento | `51:3364` | #93 | `/campanhas/:id/acompanhamento` | `GET /campanhas/{id}`, `GET /entidades/{id}/doacoes?campanhaId` | gestaoApi | ✔ ✱ | II · timeline e itens BLQ |
| CAM-10 | Encerramento e prestação de contas | `51:3588` | #94 | acompanhamento (encerrar) · `/campanhas/:id/prestacao-de-contas` | `PATCH /campanhas/{id}/status` | gestaoApi, prestacao | ✱ | IP · encerramento II · prestação de contas ISI/BLQ |

## DOA — Doações

| ID | Tela | Figma | Issue | Rota | API | Testes | Render | Status |
|---|---|---|---|---|---|---|---|---|
| DOA-01 | Escolha do tipo de doação | `53:2143` | #95 | `/doar/:id` | — | doacao | — | ID · só financeira (itens BLQ, decisão da equipe §7) |
| DOA-02 | Identificação do doador | `53:2505` | #96 | `/doar/:id`, `/cadastro-doador`, `/login` | `POST /doadores`, `POST /auth/login` | doacao, cadastroDoador | — | II |
| DOA-03 | Doação financeira | `53:2246` | #97 | `/doar/:id` | `POST /doacoes` | doacao | — | II |
| DOA-04 | Pagamento via PIX | `53:2639` | #98 | `/doar/:id` | `POST /doacoes` (`Idempotency-Key`) | doacao | — | ID · registro real, sem QR/liquidação (sem provedor) |
| DOA-05 | Cartão ou boleto | `55:2609` | #99 | — | — | — | — | BLQ (API só aceita PIX) |
| DOA-06 | Doação de itens | `53:2361` | #100 | — | — | — | — | BLQ (sem contrato) |
| DOA-07 | Agendamento | `55:2749` | #101 | — | — | — | — | BLQ (fora do MVP) |
| DOA-08 | Confirmação | `55:2891` | #102 | `/doar/:id/confirmacao/:doacaoId` | `GET /doacoes/{id}` | doacao | — | II |
| DOA-09 | Minhas doações | `55:3024` | #103 | `/minhas-doacoes` | `GET /usuarios/me/doacoes` | doacoes | — | II |
| DOA-10 | Detalhe da doação | `55:3207` | #104 | `/minhas-doacoes/:doacaoId` | `GET /doacoes/{id}` | doacoes | — | ID · sem linha do tempo/destinação (sem contrato) |

## GES — Gestão e Dashboard

| ID | Tela | Figma | Issue | Rota | API | Testes | Render | Status |
|---|---|---|---|---|---|---|---|---|
| GES-01 | Login e recuperação de senha | `65:3954` | #105 | `/login` | `POST /auth/login` | auth, gestaoTelas | — | IP · login II · recuperação BLQ (RF04 fora do MVP) |
| GES-02 | Cadastro da entidade | `65:4035` | #106 | `/cadastro-entidade` | `POST /entidades` | cadastroEntidade | — | II |
| GES-03 | Dashboard geral | `65:4199` | #107 | `/dashboard` | `GET /entidades/{id}/arrecadacao`, `GET /campanhas`, `GET /entidades/{id}/doacoes`; ADMIN `GET /dashboard/kpis` | gestaoApi | ✔ ✱ | II · indicadores de itens/famílias BLQ |
| GES-04 | Dashboard analítico | `65:4357` | #108 | `/dashboard/campanha?campanha=` | detalhe + arrecadação + doações | gestaoApi | ✔ | II |
| GES-05 | Doações recebidas | `65:4559` | #109 | `/doacoes` | `GET /entidades/{id}/doacoes` | gestaoApi | ✔ ✱ | II · confirmação de recebimento de itens BLQ |
| GES-06 | Doadores e histórico | `69:4727` | #110 | `/doadores` | derivado de `GET /entidades/{id}/doacoes` | gestaoApi | ✔ | ID · sem rota de doadores (fora do MVP); anônimos não identificados |
| GES-07 | Controle de itens doados | `69:4901` | #111 | `/itens` | — | gestaoTelas, fluxos | ✔ | ISI · BLQ (sem contrato de estoque) |
| GES-08 | Relatórios e exportação | `69:5096` | #112 | `/relatorios` | (`POST /relatorios/exportar` fora do MVP) | gestaoTelas, fluxos | — | ISI · pendente: arrecadação + CSV no navegador |
| GES-09 | Usuários e permissões | `69:5282` | #113 | `/configuracoes/usuarios` (equipe) · `/usuarios` (ADMIN) | `GET /usuarios`, `PATCH /usuarios/{id}/status` | gestaoTelas, gestaoApi | ✔ | IP · ADMIN II · equipe da entidade ISI/BLQ |
| GES-10 | Perfil da entidade | `69:5500` | #114 | `/configuracoes` | `GET`/`PATCH /entidades/{id}` | perfilEntidade | — | II |

## Transversais

| Tela | Rota | API | Status |
|---|---|---|---|
| Cadastro de doador | `/cadastro-doador` | `POST /doadores` | II |
| Aprovação de entidades (ADMIN) | `/entidades` | `GET /usuarios?tipo=ENTIDADE`, `PATCH /entidades/{id}/status` | II (✔ ✱) |
| Ajuda, privacidade, termos | `/ajuda`, `/privacidade`, `/termos` | — | II (conteúdo estático) |
| Acesso restrito / não encontrada | `/acesso-restrito`, `*` | — | II |
| Proteção de rotas | `RotaProtegida` | sessão JWT | II |

## Totais

- 30 telas oficiais: **18 integradas** (II), **6 parciais ou com divergências** por falta de contrato, **2 em demonstração** (GES-07, GES-08), **4 bloqueadas** (DOA-05, DOA-06, DOA-07 e prestação de contas/recuperação de senha dentro de telas parciais).
- Nenhuma tela foi marcada como **Validada**: a suíte Vitest, o lint e o build não puderam ser executados nesta sessão (ver [validação final](frontend-validacao-final.md)).
