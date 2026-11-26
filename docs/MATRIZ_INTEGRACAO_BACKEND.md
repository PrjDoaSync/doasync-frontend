# Matriz de integração com o backend

Os caminhos usam o prefixo `/api/v1`. A referência executável é o Spring do repositório `doasync-backend`. Mantêm-se Axios, interceptores, `AuthProvider`, `useRequest`, `useAsyncAction`, mapeadores e serviços por domínio. Para contratos e regras versionados, consulte o [documento da API](https://github.com/PrjDoaSync/doa-sync/blob/main/docs/backend/rotas-api.md) e o [backend](https://github.com/PrjDoaSync/doasync-backend).

| Operação | Método e rota | Entrada ou resposta relevante | Acesso | Serviço no frontend |
|---|---|---|---|---|
| Entrar | `POST /auth/login` | E-mail e senha. Retorna token, expiração e usuário | Público | `authService` |
| Cadastrar doador | `POST /doadores` | Pessoa física ou jurídica, conforme o DTO de cadastro | Público | `authService` |
| Conta atual | `GET /usuarios/me` | Perfil da conta autenticada | Autenticado | `usuariosService` |
| Alterar conta | `PATCH /usuarios/me` | Dados de perfil. Senha atual exigida para troca autenticada | Autenticado | `usuariosService` |
| Cadastrar entidade | `POST /entidades` | Dados cadastrais. A entidade começa pendente | Público | `authService` |
| Listar entidades | `GET /entidades` | Lista de entidades aprovadas | Público | `entidadesService` |
| Detalhe da entidade | `GET /entidades/{id}` | Perfil com campos de acordo com o acesso | Público para entidade aprovada. Dados privados dependem de vínculo ou administração | `entidadesService` |
| Alterar entidade | `PATCH /entidades/{id}` | Dados cadastrais permitidos | Conta vinculada ou administrador, conforme regras do serviço | `entidadesService` |
| Aprovar, reprovar ou desativar entidade | `PATCH /entidades/{id}/status` | Status e informações exigidas para a transição | Administrador | `entidadesService` |
| Vitrine e campanhas da entidade | `GET /campanhas` | Filtros e paginação com limite de 50 por página | Público ou proprietário, conforme consulta | `campanhasService` |
| Detalhe da campanha | `GET /campanhas/{id}` | Detalhe e progresso. `versao` na branch `feat/campanha-versao` | Público para campanhas visíveis. Acesso restrito para rascunhos | `campanhasService` |
| Criar campanha | `POST /campanhas` | Título, descrição, meta, datas, categoria e capa por URL | Entidade com acesso permitido pelo backend | `campanhasService` |
| Editar campanha | `PATCH /campanhas/{id}` | Dados editáveis e `versao` da última leitura. Versão desatualizada retorna `409` | Entidade proprietária | `campanhasService` |
| Mudar status | `PATCH /campanhas/{id}/status` | Transição permitida de status | Entidade proprietária ou administrador, conforme transição | `campanhasService` |
| Registrar PIX | `POST /doacoes` | Valor, destino único, anonimato, observação e `Idempotency-Key` | Doador PF ou PJ | `doacoesService` |
| Detalhar doação | `GET /doacoes/{id}` | Registro e comprovante do sistema | Doador proprietário, entidade destinatária ou administrador | `doacoesService` |
| Histórico próprio | `GET /usuarios/me/doacoes` | Histórico paginado | Doador PF ou PJ | `doacoesService` |
| Doações recebidas | `GET /entidades/{id}/doacoes` | Campanha opcional, período opcional e paginação | Entidade destinatária ou administrador | `doacoesService` |
| Arrecadação e CSV | `GET /entidades/{id}/arrecadacao` | Período opcional e agregado das doações confirmadas. O frontend exporta o resultado | Entidade destinatária ou administrador | `doacoesService` |
| Indicadores gerais | `GET /dashboard/kpis` | Indicadores administrativos | Administrador | `dashboardService` |
| Listar contas | `GET /usuarios` | Filtro por tipo e paginação | Administrador | `usuariosService` |
| Ativar ou desativar conta | `PATCH /usuarios/{id}/status` | Novo status da conta | Administrador | `usuariosService` |

## Concorrência e PostgreSQL

- `014bbc6`, de João Pedro, estende a resposta de detalhe com a versão persistida. A `main` oficial em `3c911d7` ainda não inclui essa resposta. O frontend bloqueia a edição sem uma versão inteira e envia exatamente a versão retornada. Após conflito, uma ação explícita permite carregar um novo detalhe.
- A validação com PostgreSQL 16.16 identificou `SQLSTATE 42P18` nas consultas com filtros opcionais. O ajuste local usa comparações temporais tipadas com `COALESCE` e ativa o predicado de campanha apenas quando há filtro. Mantém o escopo por entidade e inclui doações diretas quando o filtro de campanha está ausente.

## Dependências

- PIX efetua um registro de doação no sistema. A liquidação bancária exige provedor.
- O contrato publicado e as 30 referências remotas de backend examinadas não apresentaram controladores Java para estoque, prestação de contas, agendamento de doação ou recuperação de senha. Essas operações permanecem sem simulação.
- Upload de documentos, galeria, envio de comprovante, notificações e convites da equipe dependem de contratos. A busca de doadores por nome usa registros autorizados e preserva o anonimato.
