# Matriz de rastreabilidade — Figma × Issues × Rotas × API

**Atualizada em:** 2026-11-27 · **Branch:** `feature/finalizacao-frontend`
Figma oficial: arquivo `JaIKR7tTkfIJ3fSk4weadC` (`https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=<id>`). Os 30 *node IDs* foram conferidos no arquivo em 27/11. Issues: `PrjDoaSync/doasync-frontend`. Endpoints sob `/api/v1`.

Legenda de **Status**:
- **II**: implementada e integrada à API.
- **IP**: implementada, com parte dependente de rota inexistente (a pendência aparece na tela).
- **ISI**: implementada com dados de demonstração isolados (faixa de demonstração ou aviso).
- **BLQ**: ação final bloqueada por falta de rota; a tela existe, valida os dados e não registra nada.

Todas as pendências estão centralizadas em `web/src/services/indisponivel.js` (`RECURSOS_PENDENTES`). A coluna **Testes** indica o arquivo Vitest que cobre a tela.

## CAM — Campanhas

| ID | Tela | Figma | Issue | Rota | API | Testes | Status |
|---|---|---|---|---|---|---|---|
| CAM-01 | Home pública | `49:3215` | #85 | `/` | `GET /campanhas` | vitrineApi | II |
| CAM-02 | Listagem com filtros | `49:3324` | #86 | `/explorar` | `GET /campanhas` (filtros no front) | vitrineApi, fluxos | II (sem filtro de cidade: a API não informa) |
| CAM-03 | Detalhe da campanha | `49:3494` | #87 | `/campanhas/:id` | `GET /campanhas/{id}` | vitrineApi, doacao | II |
| CAM-04 | Criar — dados básicos | `49:3603` | #88 | `/campanhas/nova` (etapa 1) | `POST /campanhas` | criarCampanha | II |
| CAM-05 | Criar — metas e itens | `49:3729` | #89 | `/campanhas/nova` (etapa 2) | meta em `POST /campanhas` | criarCampanha | IP · itens só na tela (`itensCampanha`) |
| CAM-06 | Criar — imagens, revisão e publicação | `51:2870` | #90 | `/campanhas/nova` (etapa 3) | `POST /campanhas` (`rascunho`) | criarCampanha | IP · capa por URL; galeria/upload pendente (`uploadImagens`) |
| CAM-07 | Minhas campanhas | `51:3029` | #91 | `/campanhas` | `GET /campanhas?status=` ×5 | gestaoCampanhas | II |
| CAM-08 | Editar campanha | `51:3186` | #92 | `/campanhas/:id/editar` | `GET`/`PATCH /campanhas/{id}` (`versao`) | gestaoApi | II · depende de `versao` no detalhe (PR #71 do backend) |
| CAM-09 | Acompanhamento | `51:3364` | #93 | `/campanhas/:id/acompanhamento` | `GET /campanhas/{id}`, `GET /entidades/{id}/doacoes?campanhaId`, `PATCH /campanhas/{id}/status` | gestaoApi | II |
| CAM-10 | Encerramento e prestação de contas | `51:3588` | #94 | acompanhamento (encerrar) · `/campanhas/:id/prestacao-de-contas` | `PATCH /campanhas/{id}/status`, `GET /campanhas/{id}` | gestaoApi, prestacao | IP · relatório na sessão; publicação BLQ (`prestacaoContas`) |

## DOA — Doações

| ID | Tela | Figma | Issue | Rota | API | Testes | Status |
|---|---|---|---|---|---|---|---|
| DOA-01 | Escolha do tipo de doação | `53:2143` | #95 | `/doar/:id`, `/doar/entidade/:id` (etapa 1) | — | doacao, doacaoCompleta | II |
| DOA-02 | Identificação do doador | `53:2505` | #96 | etapa 3, `/cadastro-doador`, `/login` | `POST /doadores`, `POST /auth/login` | doacao, cadastroDoador | II |
| DOA-03 | Doação financeira | `53:2246` | #97 | etapa 2 | `POST /doacoes` | doacao | II |
| DOA-04 | Pagamento via PIX | `53:2639` | #98 | etapa 4 | `POST /doacoes` (`Idempotency-Key`) | doacao | IP · registro real sem cobrança; sem QR (`provedorPix`) |
| DOA-05 | Cartão ou boleto | `55:2609` | #99 | etapa 4 | — | doacaoCompleta | BLQ (`cartao`, `boleto`): valida, nada é enviado |
| DOA-06 | Doação de itens | `53:2361` | #100 | etapa 2 (itens) | — | doacaoCompleta | BLQ (`doacaoItens`): itens de exemplo em `mocks/itensDemo.js` |
| DOA-07 | Agendamento | `55:2749` | #101 | etapa 4 (itens) | — | doacaoCompleta | BLQ (`agendamento`): valida, nada é enviado |
| DOA-08 | Confirmação | `55:2891` | #102 | `/doar/:id/confirmacao/:doacaoId`, `/doar/entidade/:id/confirmacao/:doacaoId` | `GET /doacoes/{id}` | doacao | II |
| DOA-09 | Minhas doações | `55:3024` | #103 | `/minhas-doacoes` | `GET /usuarios/me/doacoes` | doacoes | II |
| DOA-10 | Detalhe da doação | `55:3207` | #104 | `/minhas-doacoes/:doacaoId` | `GET /doacoes/{id}` | doacoes | II (sem linha do tempo/destinação: a API não informa) |

## GES — Gestão e Dashboard

| ID | Tela | Figma | Issue | Rota | API | Testes | Status |
|---|---|---|---|---|---|---|---|
| GES-01 | Login e recuperação de senha | `65:3954` | #105 | `/login` | `POST /auth/login` | auth, gestaoTelas, paginasSistema | IP · login II; recuperação BLQ (`recuperacaoSenha`) |
| GES-02 | Cadastro da entidade | `65:4035` | #106 | `/cadastro-entidade` | `POST /entidades` | cadastroEntidade | II |
| GES-03 | Dashboard geral | `65:4199` | #107 | `/dashboard` | `GET /entidades/{id}/arrecadacao`, `GET /campanhas`, `GET /entidades/{id}/doacoes`; ADMIN `GET /dashboard/kpis` | gestaoApi | II |
| GES-04 | Dashboard analítico | `65:4357` | #108 | `/dashboard/campanha` | detalhe + arrecadação + doações | gestaoApi | II |
| GES-05 | Doações recebidas | `65:4559` | #109 | `/doacoes` | `GET /entidades/{id}/doacoes` | gestaoApi | II |
| GES-06 | Doadores e histórico | `69:4727` | #110 | `/doadores` | derivado de `GET /entidades/{id}/doacoes` | gestaoApi | II (sem rota própria; anônimos não identificados) |
| GES-07 | Controle de itens doados | `69:4901` | #111 | `/itens` | — | gestaoTelas, telasDemo | ISI (`estoqueItens`) |
| GES-08 | Relatórios e exportação | `69:5096` | #112 | `/relatorios` | `GET /entidades/{id}/arrecadacao`, `GET /entidades/{id}/doacoes` | relatorios | II · CSV no navegador; PDF BLQ (`relatorioPdf`) |
| GES-09 | Usuários e permissões | `69:5282` | #113 | `/usuarios` (ADMIN) · `/configuracoes/usuarios` (equipe) | `GET /usuarios`, `PATCH /usuarios/{id}/status` | gestaoApi, telasDemo | IP · ADMIN II; equipe ISI (`equipeEntidade`) |
| GES-10 | Perfil da entidade | `69:5500` | #114 | `/configuracoes` | `GET`/`PATCH /entidades/{id}` | perfilEntidade | II |

## Telas e funcionalidades além do Figma

| Tela | Rota | API | Testes | Status |
|---|---|---|---|---|
| Cadastro de doador (PF/PJ) | `/cadastro-doador` | `POST /doadores` | cadastroDoador | II |
| Minha conta (RF-003) | `/perfil-usuario` | `GET`/`PATCH /usuarios/me` | doacaoCompleta | II |
| Entidades públicas (RF-009) | `/entidades-publicas`, `/entidades-publicas/:id` | `GET /entidades`, `GET /entidades/{id}`, `GET /campanhas?entidadeId=` | doacaoCompleta | II |
| Doação direta à entidade | `/doar/entidade/:id` | `POST /doacoes` com `entidadeId` | doacaoCompleta | II |
| Aprovação de entidades (ADMIN) | `/entidades` | `GET /usuarios?tipo=ENTIDADE`, `PATCH /entidades/{id}/status` | gestaoApi | II |
| Ajuda, privacidade e termos | `/ajuda`, `/privacidade`, `/termos` | — | — | II (conteúdo estático) |
| Não encontrada, acesso restrito, indisponível | `*`, `/acesso-restrito`, `/indisponivel` | — | paginasSistema | II |
| Erro inesperado de renderização | `ErrorBoundary` | — | paginasSistema | II |
| Proteção de rotas | `RotaProtegida` (ENTIDADE/ADMIN) | sessão JWT | auth, gestaoTelas | II |

## Totais

- **30 telas do Figma:**
  - 20 integradas (II);
  - 6 com parte pendente de rota e identificada (IP; a equipe da GES-09 usa demonstração isolada);
  - 1 em demonstração isolada (ISI, GES-07);
  - 3 com ação final bloqueada (BLQ, DOA-05 a DOA-07). Essas telas validam os dados e não registram nada.
- **Validação em 27/11/2026:**
  - `oxlint --deny-warnings` sem avisos;
  - Vitest com 25 arquivos e 312 testes passando;
  - `vite build` ok.
- **Verificação visual no navegador:** pendente, porque a extensão do Chrome desconectou durante a sessão.
