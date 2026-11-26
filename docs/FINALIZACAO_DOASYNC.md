# Finalização do DoaSync

Revisão de 26/11/2026. A entrega usa o worktree `doasync-finalizacao`, branch local `codex/finalizacao-doasync`. O checkout original `doasync-frontend` permanece em `develop` com as 52 entradas de trabalho preexistentes. O Git compartilha o histórico entre os dois diretórios.

## Continuação da validação

- O worktree manteve a arquitetura de João Pedro. Em conflito de edição, o formulário bloqueia a gravação e mantém o rascunho até a ação explícita de carregar novamente. A gravação seguinte usa a versão devolvida pelo Spring.
- A execução com PostgreSQL 16.16 isolado revelou o erro `42P18` nas consultas de arrecadação e doações recebidas com filtros opcionais. A correção local mantém o método HTTP, o DTO e o escopo de entidade. A branch de backend `codex/doasync-versao-postgres` inclui a versão de campanha de `014bbc6` e a correção `a981d18`. A cópia de trabalho do backend fica em `doasync-backend-validacao`.
- A validação com Playwright e PostgreSQL passou para vitrine e detalhe, login, painel, doações recebidas, CSV, perfil, registro direto e por campanha, comprovante, histórico, gestão de contas e ciclo de campanha. Foram verificadas as larguras de 390, 768 e 1366 px nas telas de fumaça. O teste de edição em duas abas confirmou `409`, manutenção do rascunho e nova gravação com a versão relida.
- O frontend passou em 232 testes, lint, typecheck e build. A suíte do backend passou em 270 testes e o `DoacaoControllerTest` passou nos 11 casos também em PostgreSQL isolado. As auditorias npm do frontend e do cliente de contrato do backend retornaram zero alertas após atualizar a dependência transitiva do cliente.
- O Figma recusou a leitura e a captura. O navegador integrado do VS Code também ficou indisponível para automação. A matriz descreve cobertura funcional com base no inventário versionado. A inspeção da vitrine em Chrome levou à remoção da oferta de doação de itens e de marcações vazias de categoria e localização.
- Documentação complementar. [Auditoria GitHub](AUDITORIA_GITHUB.md) · [Matriz Figma](MATRIZ_FIGMA_FRONTEND.md) · [Matriz backend](MATRIZ_INTEGRACAO_BACKEND.md)

## Revisão para publicação

O frontend e o backend mantêm os históricos verificados das entregas anteriores. A pipeline do backend passa a usar o PostgreSQL também no teste de doações. A auditoria npm da API Express legada revelou alertas em dependências transitivas. O lockfile foi atualizado e a suíte de sete cenários voltou a passar com zero alertas nessa auditoria.

O escopo documentado mantém itens físicos, estoque e prestação de contas fora da entrega MVP. A interface ainda depende de acesso de leitura ao Figma para validação visual. A avaliação operacional classifica a aplicação como não pronta para deploy integral e registra os procedimentos de implantação e reversão. [Auditoria da organização](ORGANIZACAO_AUDITORIA_COMPLETA.md) · [Preparação para produção](PRODUCTION_READINESS.md)

### Evidências da revisão

| Medida | Resultado | Critério |
|---|---:|---|
| Fluxo principal das telas com backend oficial | 15/30 | Telas desktop do inventário com operação principal e API disponível |
| Fluxo principal das telas com backend local | 16/30 | Mesmo inventário, com a edição de campanha validada em PostgreSQL |
| Axe-core nas páginas públicas amostradas | 3/3 | Home, Explorar e login sem violações nas regras automatizadas executadas |
| Comparação visual contra o Figma | 0/30 | Só conta com comparação direta do frame oficial |
| Operações REST catalogadas | 22/22 | Rotas do contrato MVP com correspondência documentada no serviço do frontend. A lista não representa teste E2E individual por operação |
| Testes frontend | 233/233 | Execução em instalação limpa do lockfile |
| Testes Spring | 270/270 | Maven verify com PostgreSQL isolado nas suítes de contrato e doações |
| Regressão Express legada | 7/7 | Cenários da suíte Node |
| Cobertura de linhas React | 1.204/1.341 (89,78%) | Vitest com provider V8 instalado somente no checkout descartável de medição |
| Requisitos operacionais aferidos | 6/15 | Itens validados localmente na matriz de preparação para produção |

O teste em navegador repetiu a confirmação do 409 em duas abas, manteve o rascunho e gravou após reler a versão. O backend foi publicado em `de5d079` para revisão contra `main`. [PR do backend #71](https://github.com/PrjDoaSync/doasync-backend/pull/71)

## GitHub e fontes auditadas

| Fonte | Revisão | Evidência examinada |
|---|---|---|
| [doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend) | `origin/main` em `e73ad24`, `origin/develop` em `1c8eaa8` | Branches, PRs, issues de implementação, roteador, serviços, testes e pipeline |
| [doasync-backend](https://github.com/PrjDoaSync/doasync-backend) | `main` em `3c911d7` e `feat/campanha-versao` em `014bbc6` | Controladores Spring, DTOs, validação, segurança, configuração CORS, estados de campanha e doação. O projeto Express no mesmo repositório é uma referência de vitrine com fixtures |
| [doa-sync](https://github.com/PrjDoaSync/doa-sync) | `main` em `b049881` | Escopo MVP, requisitos, regras de negócio e contrato de rotas |
| [quality](https://github.com/PrjDoaSync/quality) | `main` em `d32ec1b` | Índice de documentação, matrizes de QA e suítes manuais e de contrato |

As branches remotas inventariadas foram `main`, `develop`, `codex/lucas-documentation-audit`, `feature/componentes`, `feature/gustavo-testes-e-estados-web`, `feature/integracao-api`, `feature/login`, `feature/matheus-integracao-api`, `feature/matheus-telas-gestao`, `feature/nickolas-campanhas`, `feature/nickolas-doacoes`, `feature/nickolas-gestao` e `fix/campanhas-visual`. As branches locais preexistentes eram `main` e `develop`. O fetch não encontrou tags. O `develop` original estava 11 commits atrás do remoto, com 0 commits locais exclusivos.

A API do GitHub retornou zero PRs abertos e 11 fechados, todos mesclados. São eles [#115](https://github.com/PrjDoaSync/doasync-frontend/pull/115), [#135](https://github.com/PrjDoaSync/doasync-frontend/pull/135), [#137](https://github.com/PrjDoaSync/doasync-frontend/pull/137), [#138](https://github.com/PrjDoaSync/doasync-frontend/pull/138), [#139](https://github.com/PrjDoaSync/doasync-frontend/pull/139), [#140](https://github.com/PrjDoaSync/doasync-frontend/pull/140), [#141](https://github.com/PrjDoaSync/doasync-frontend/pull/141), [#142](https://github.com/PrjDoaSync/doasync-frontend/pull/142), [#143](https://github.com/PrjDoaSync/doasync-frontend/pull/143), [#144](https://github.com/PrjDoaSync/doasync-frontend/pull/144) e [#145](https://github.com/PrjDoaSync/doasync-frontend/pull/145). Nenhum merge remoto era necessário. As issues #21, #35 a #37 e #85 a #114 seguem abertas no GitHub.

A branch de João Pedro foi usada como base. O merge local `1335fff` integrou `origin/main` sem conflitos e manteve os quatro commits exclusivos da integração, `d8fa5d4` (cadastro de entidade), `5569193` (perfil), `371246a` (gestão de campanhas) e `0ad34ff` (criação). A branch também contém os commits de vitrine `361ee31`, sessão `dbd64a0` e registro de doação `65dc0c9`. As duas branches de produto com commits exclusivos fora dessa base são `feature/login`, com autenticação demonstrativa anterior, e `feature/nickolas-gestao`, com telas de estoque, relatórios e equipe demonstrativa em `3076487`, `099c0c1` e `5c218e7`. O trabalho está preservado nas respectivas branches para a revisão visual. Os dados simulados e as rotas concorrentes dessas versões ficaram fora da integração real.

## Arquitetura e contratos

A aplicação continua com React, React Router, Axios, `AuthProvider`, `useRequest`, `useAsyncAction`, serviços por domínio e mapeadores DTO → interface conforme [o registro da integração](integracao-api.md). `VITE_API_URL` configura a base `/api/v1`. Os tokens seguem a sessão existente. O interceptor passou a restringir o destino ao caminho e à origem da API, a omitir o token no login e a encerrar somente a sessão que originou um 401. A autorização final é aplicada no Spring.

| Fluxo | Contratos confirmados | Escopo entregue |
|---|---|---|
| Conta | `POST /auth/login`, `POST /doadores`, `GET/PATCH /usuarios/me` | Login, logout local, cadastro PF/PJ, perfil e alteração autenticada de senha |
| Entidade | `POST/GET /entidades`, `GET/PATCH /entidades/{id}` | Cadastro, consulta pública de aprovadas, perfil da entidade e edição. `GET /entidades` retorna lista sem paginação no Spring. Busca e paginação do catálogo são locais |
| Campanhas | `GET/POST /campanhas`, `GET/PATCH /campanhas/{id}`, `PATCH /campanhas/{id}/status` | Vitrine, listagem, criação, acompanhamento, transição de status e edição com trava otimista. A API de listagem limita cada resposta a 50, e o serviço busca as páginas adicionais para os filtros locais |
| Doações | `POST /doacoes`, `GET /doacoes/{id}`, `GET /usuarios/me/doacoes`, `GET /entidades/{id}/doacoes` | Registros por campanha ou diretamente para entidade aprovada, anonimato, chave de idempotência, confirmação, histórico e recebidas. O backend exige exatamente um identificador de destino |
| Gestão | `GET /dashboard/kpis`, `GET /entidades/{id}/arrecadacao` | KPIs do administrador, painel da entidade, agrupamento por campanha e CSV criado a partir da arrecadação retornada pela API |
| Administração | `GET /usuarios`, `PATCH /usuarios/{id}/status`, `PATCH /entidades/{id}/status` | Busca e paginação de contas, ativação/desativação e aprovação de entidade. Como a vitrine de entidades só expõe aprovadas, a lista administrativa usa `GET /usuarios?tipo=ENTIDADE` |

O caminho principal deixou de montar `DemoProvider`, banners e mutações simuladas. As rotas antigas sem API exibem uma mensagem de indisponibilidade. A interface identifica o PIX como registro no sistema. O status confirmado do backend expressa a confirmação prevista no MVP simulado e não comprova transferência bancária.

## Matriz de rastreabilidade

O inventário de 30 frames vem da revisão anterior em [frontend-validacao.md](frontend-validacao.md). O [arquivo oficial do Figma](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=65-3954) ainda requer acesso detalhado. O conector recusou sessão e metadados por permissão. O Computer Use encerrou a sessão após falhar na verificação de URL no Windows. Nenhuma linha abaixo indica aceite visual.

| Tela/componente | Figma | Frontend atual | Situação | Ação |
|---|---|---|---|---|
| Home | CAM-01 | `/` | API | Comparar visualmente |
| Explorar e filtros | CAM-02 | `/explorar` | API | Confirmar filtros de localização com produto e API |
| Detalhe | CAM-03 | `/campanhas/:id` | API | Comparar visualmente |
| Criar, dados básicos | CAM-04 | `/campanhas/nova` | API | Comparar visualmente |
| Criar, metas e itens | CAM-05 | `/campanhas/nova` | Parcial | Meta financeira disponível. Itens dependem de contrato |
| Criar, imagens/revisão/publicação | CAM-06 | `/campanhas/nova` | Parcial | Revisão e capa por URL disponíveis. Upload e galeria pendentes |
| Minhas campanhas | CAM-07 | `/campanhas` | API | Comparar visualmente |
| Editar | CAM-08 | `/campanhas/:id/editar` | Condicional | Integrar no backend o campo `versao` da branch `014bbc6` |
| Acompanhamento | CAM-09 | `/campanhas/:id/acompanhamento` | API | Indicadores, registros recentes e status disponíveis. Atualizações públicas e indicadores de itens dependem de contrato |
| Encerramento e prestação | CAM-10 | acompanhamento e `/prestacao-de-contas` | Parcial | Encerramento disponível. Destinação, despesas, anexos e publicação sem API |
| Escolha de modalidade | DOA-01 | `/doar/:id` | Parcial | MVP suporta registro PIX; outras modalidades do protótipo ficam pendentes |
| Identificação | DOA-02 | `/doar/:id` | API | Confirmar identidade, anonimato e retorno ao fluxo com produto |
| Financeira | DOA-03 | doação por campanha ou entidade | API | Comparar visualmente |
| PIX | DOA-04 | etapa de revisão | Parcial | Registro real em base, com confirmação simulada pelo backend. Falta gateway |
| Cartão e boleto | DOA-05 | indisponível | Fora do MVP financeiro | Requer definição de produto e provedor |
| Doação de itens | DOA-06 | indisponível | Sem API | Definir cadastro, aceitação, itens e estoque |
| Agendamento | DOA-07 | indisponível | Sem API | Definir entrega e retirada |
| Confirmação | DOA-08 | `/doar/.../confirmacao/:doacaoId` | API | PDF e envio dependem de contrato |
| Minhas doações | DOA-09 | `/minhas-doacoes` | API | Comparar visualmente |
| Detalhe da doação | DOA-10 | `/minhas-doacoes/:doacaoId` | API | Comparar visualmente |
| Login e recuperação | GES-01 | `/login` | Parcial | Login validado. Falta emissão de token e recuperação por e-mail |
| Cadastro da entidade | GES-02 | `/cadastro-entidade` | Parcial | Cadastro disponível. Falta envio documental |
| Dashboard geral | GES-03 | `/dashboard` | API | Comparar KPIs por papel com os frames |
| Dashboard por campanha | GES-04 | `/dashboard/campanha` | API | Comparar detalhamento e hierarquia visual |
| Doações recebidas | GES-05 | `/doacoes` | API | Filtro temporal, paginação e detalhe. Identificação segue anonimato do backend |
| Histórico de doadores | GES-06 | `/doadores` | Parcial | Busca nominal nos registros recebidos, sem anônimos. A API omite o identificador para entidades (RN73). Histórico por pessoa exige contrato compatível com essa regra |
| Estoque | GES-07 | `/itens` | Sem API | Definir recebimento, movimentações e saldo |
| Relatórios | GES-08 | `/relatorios` | API e CSV local | CSV da arrecadação disponível. Revisar exportações adicionais do protótipo |
| Usuários e permissões | GES-09 | `/configuracoes/usuarios` | Parcial | ADMIN gerencia status de contas; convites e papéis internos da entidade sem API |
| Perfil e configurações | GES-10 | `/configuracoes`, `/perfil-usuario` | Parcial | Edição de entidade e conta disponível. Documentos e preferências específicas pendentes |

Contagem por módulo pelo critério **API disponível e fluxo principal implementado**, sem crédito para linhas parciais, condicionais ou sem API. Campanhas 6/10 (60%), Doações 5/10 (50%) e Gestão 4/10 (40%). O total é 15/30 telas (50%). Com a branch local do backend em PostgreSQL, o fluxo de edição de campanha acrescenta uma tela e a cobertura funcional fica em 16/30 (53,3%). A verificação visual detalhada contra o Figma continua sem aceite. Notificações, PDF, recuperação de senha, uploads e gateway continuam como dependências de produto/backend.

## Qualidade

- Antes da intervenção, a árvore original passou nos 292 testes e o worktree com a integração de João Pedro passou nos 286 testes.
- A suíte da entrega substitui as asserções de fluxos demonstrativos removidos da navegação por cenários que falham se o frontend usar dados simulados ou enviar métodos, corpo e permissões incorretos. Os testes puros de protótipos e utilitários foram preservados onde seguem aplicáveis.
- `npm test`, `npm run lint`, `npm run typecheck` e `npm run build` passaram. O Vitest registrou 231 testes em 21 arquivos e zero falhas. O TypeScript verifica a camada JavaScript de serviços com `checkJs`. A interface continua em JSX.
- O `npm audit` encontrou um alerta alto transitivo em `follow-redirects`. O lockfile foi atualizado e a nova auditoria retornou zero alertas.
- Playwright com Chrome e o Spring real em H2 descartável validou vitrine e detalhe, login e logout, dashboard e filtro por campanha, doações recebidas, consulta nominal e comprovante, CSV baixado, atualização do perfil, listagem administrativa e ativação/desativação de conta. Validou registro de doação por campanha e diretamente à entidade, com comprovante e histórico.
- As telas Home, Explorar, Dashboard e Gestão de entidades foram medidas em 390, 768 e 1366 px. Os cenários medidos passaram sem rolagem horizontal do documento.
- A edição foi bloqueada corretamente na `main` do backend quando faltava `versao`. No Spring em `014bbc6`, o Chrome validou a criação em rascunho, a gravação com incremento de versão e a ativação. O Vitest cobre o conflito 409.

## Segurança revisada na integração

A API aplica as permissões de acesso no Spring. O teste em navegador verificou o login e o logout e a ativação e desativação de uma conta em base descartável. As requisições passam pelo cliente Axios existente, que restringe o envio do token ao destino configurado e descarta a sessão quando o mesmo token recebe `401`. O armazenamento da sessão no navegador continua em `localStorage`, conforme o contrato atual de JWT. Segredos da validação ficaram na instância isolada e fora do Git.

## Pendências para aceite

1. Obter leitura detalhada do Figma e validar os frames, estados e interações com a equipe. O QA de layout em Chrome mediu responsividade e não compara fidelidade visual.
2. Publicar na versão oficial do backend o detalhe de campanha com `versao` para liberar edição em produção. Confirmar gateway PIX antes de divulgar o fluxo como pagamento.
3. Definir os contratos pendentes da matriz, priorizando recuperação de senha, itens, prestação de contas e equipe interna.
4. Conciliar a branch de entrega com o trabalho preexistente do checkout principal. A pasta original está íntegra, porém a `develop` de trabalho ainda aponta ao commit anterior ao fetch. A integração dos commits aprovados está no worktree de entrega.
5. Repetir o aceite no ambiente de homologação compartilhado após revisão das branches. O PostgreSQL isolado e a base H2 de desenvolvimento já foram usados localmente.
