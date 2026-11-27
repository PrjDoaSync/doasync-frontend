# Plano de finalização do frontend Web — DoaSync

Base: [auditoria completa](frontend-auditoria-completa.md). Endpoints: contrato oficial `doa-sync/docs/backend/contrato-api.md` + descobertas verificadas em [integracao-api.md](integracao-api.md). Cada item continua a numeração de passos de `integracao-api.md §4`.

Regras desta execução:

- Só frontend; nenhum endpoint novo é presumido.
- Tela integrada lê só a API; o que não tem contrato fica fora do fluxo ou em demonstração **identificada** (faixa de demonstração apenas nessas telas).
- Testes usam o simulador de contrato `src/test/fixtures/apiCampanhas.js`.
- Sem `npm` nesta sessão: a validação de lint/testes/build fica para a CI (`frontend-qa.yml`) ao enviar a branch.

| Ordem | Pendência | Passo | Entrega | Status |
|---|---|---|---|---|
| 1 | P0-01, P1-01 | 20 | Editar campanha: `GET /campanhas/{id}` (lê `versao`) + `PATCH /campanhas/{id}`; 409 com nova leitura | Validado (27/11) |
| 2 | P0-01, P1-02 | 21 | Acompanhamento: detalhe da API, doações da campanha (`GET /entidades/{id}/doacoes?campanhaId`), publicar rascunho, encerrar, desativar com motivo e reativar (`PATCH /campanhas/{id}/status`) | Validado (27/11) |
| 3 | P1-03 | 22 | Doações recebidas: `GET /entidades/{id}/doacoes` com busca, filtro por campanha e paginação no front | Validado (27/11) |
| 4 | P1-03 | 22–23 | Dashboard: entidade via `GET /entidades/{id}/arrecadacao`; ADMIN via `GET /dashboard/kpis`; análise por campanha via detalhe + arrecadação | Validado (27/11) |
| 5 | P1-04 | 25 | Entidades (ADMIN): `GET /usuarios?tipo=ENTIDADE` + `PATCH /entidades/{id}/status` (motivo obrigatório em reprovação) | Validado (27/11) |
| 6 | P2-01, P2-02 | — | Layout com a sessão real (nome, perfil, entidade, sair) e faixa de demonstração só nas telas sem API | Validado (27/11) |
| 7 | P2-03 | — | Doadores derivados das doações recebidas (sem expor anônimos) | Validado (27/11) |
| 8 | P2-03 | 24 | Usuários (ADMIN): `GET /usuarios` + `PATCH /usuarios/{id}/status`; equipe da entidade sem API | Implementado, não validado (`/usuarios`); equipe da entidade bloqueada |
| 9 | P2-03 | — | Relatórios: arrecadação por período com exportação CSV no navegador | Feito e validado (27/11) |
| 10 | P3-01 | — | `tsconfig.json` mínimo para o `typecheck` | Feito (`7c76dbc`) |
| 11 | — | — | Auditoria visual Figma × tela renderizada (screenshots) | Pendente: extensão do Chrome desconectada em 27/11; fazer na etapa Docker |
| 12 | — | — | Telas restantes do Figma (DOA-01, DOA-05 a DOA-07, CAM-05/06 em 3 etapas, CAM-10 com campanha real, GES-01 recuperação), Minha conta, entidades públicas, páginas de erro | Feito e validado (27/11) |

**Checkpoint 2026-11-27:** itens 1–8 validados localmente (lint, 312 testes, build). Ver [estado da execução](frontend-estado-execucao.md).
