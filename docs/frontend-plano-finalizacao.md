# Plano de finalização do frontend Web — DoaSync

Base: [auditoria completa](frontend-auditoria-completa.md). Endpoints: contrato oficial `doa-sync/docs/backend/contrato-api.md` + descobertas verificadas em [integracao-api.md](integracao-api.md). Cada item continua a numeração de passos de `integracao-api.md §4`.

Regras desta execução:

- Só frontend; nenhum endpoint novo é presumido.
- Tela integrada lê só a API; o que não tem contrato fica fora do fluxo ou em demonstração **identificada** (faixa de demonstração apenas nessas telas).
- Testes usam o simulador de contrato `src/test/fixtures/apiCampanhas.js`.
- Sem `npm` nesta sessão: a validação de lint/testes/build fica para a CI (`frontend-qa.yml`) ao enviar a branch.

| Ordem | Pendência | Passo | Entrega | Status |
|---|---|---|---|---|
| 1 | P0-01, P1-01 | 20 | Editar campanha: `GET /campanhas/{id}` (lê `versao`) + `PATCH /campanhas/{id}`; 409 com nova leitura | Concluído no código |
| 2 | P0-01, P1-02 | 21 | Acompanhamento: detalhe da API, doações da campanha (`GET /entidades/{id}/doacoes?campanhaId`), publicar rascunho, encerrar, desativar com motivo e reativar (`PATCH /campanhas/{id}/status`) | Concluído no código |
| 3 | P1-03 | 22 | Doações recebidas: `GET /entidades/{id}/doacoes` com busca, filtro por campanha e paginação no front | Concluído no código |
| 4 | P1-03 | 22–23 | Dashboard: entidade via `GET /entidades/{id}/arrecadacao`; ADMIN via `GET /dashboard/kpis`; análise por campanha via detalhe + arrecadação | Concluído no código |
| 5 | P1-04 | 25 | Entidades (ADMIN): `GET /usuarios?tipo=ENTIDADE` + `PATCH /entidades/{id}/status` (motivo obrigatório em reprovação) | Concluído no código |
| 6 | P2-01, P2-02 | — | Layout com a sessão real (nome, perfil, entidade, sair) e faixa de demonstração só nas telas sem API | Concluído no código |
| 7 | P2-03 | — | Doadores derivados das doações recebidas (sem expor anônimos) | Concluído no código |
| 8 | P2-03 | 24 | Usuários (ADMIN): `GET /usuarios` + `PATCH /usuarios/{id}/status`; equipe da entidade sem API | Pendente (próxima rodada) |
| 9 | P2-03 | — | Relatórios: arrecadação por período com exportação CSV no navegador | Pendente (próxima rodada) |
| 10 | P3-01 | — | `tsconfig.json` mínimo para o `typecheck` | Pendente |
| 11 | — | — | Auditoria visual Figma × tela renderizada (screenshots) | Bloqueado: sem execução local da aplicação |
