# Documentação técnica do frontend Web — DoaSync

> Responsável pela documentação: LucasIanovski (Issue [#78](https://github.com/PrjDoaSync/doasync-frontend/issues/78))<br>
> Repositório: [PrjDoaSync/doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend)<br>
> Referência de design: [Doasync no Figma](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=0-1&m=dev)

## Estado e escopo

Esta documentação descreve o código observado em `web/` na branch `develop` durante a revisão de 10/11/2026. A aplicação Web existe e pode ser compilada. Ela é uma demonstração local baseada em dados fictícios; não há autenticação real, processamento financeiro, upload persistente ou integração de tela confirmada com API. As conclusões abaixo não declaram aceite visual ou funcional das 30 telas.

O escopo documentado é o frontend Web desktop de Campanhas, Doações e Gestão/Dashboard. As Issues de Mobile e backend permanecem em suas frentes correspondentes. Não foram introduzidos contratos, regras de negócio ou telas fora do escopo aprovado.

## Stack e comandos disponíveis

| Item | Evidência no projeto |
|---|---|
| Framework | React 19 (`web/package.json`) |
| Build/desenvolvimento | Vite 8 (`web/vite.config.js`) |
| Linguagem | JavaScript e JSX (`web/src`) |
| Rotas | React Router DOM 7 (`web/src/App.jsx`) |
| Cliente HTTP | Axios (`web/src/services/api.js`) |
| Testes | Vitest 5, jsdom e React Testing Library (`web/vitest.config.js`, `web/src/test`) |
| Lint | oxlint (`web/package.json`) |
| Gerenciador | npm; lockfile em `web/package-lock.json` |

Execute a partir de `web/`:

```bash
npm ci
npm run dev
npm test
npm run build
npm run lint
```

Os resultados efetivamente verificados em 10/11/2026 estão no [registro de testes](frontend-testes-unitarios.md). Não usar o lockfile não rastreado da raiz do repositório como lockfile da aplicação.

## Estrutura observada

```text
web/src/
  App.jsx                    Rotas e composição dos layouts
  main.jsx                   Entrada React
  components/                UI compartilhada, feedback, formulários, tabelas e gráficos
  components/layout/         Layout público e administrativo
  context/DemoContext.jsx    Estado em memória da demonstração
  hooks/useRequest.js        Estado assíncrono, cancelamento e nova tentativa
  mocks/                     Amostras e serviços locais simulados
  pages/                     Páginas e fluxos das três áreas
  services/                  Cliente Axios e serviços por domínio
  test/                      Testes Vitest/Testing Library
  utils/                     Formatação, validações e cálculos de domínio
```

`App.jsx` define as rotas. `DemoProvider` carrega os dados locais por `carregarDemo` e mantém alterações somente na memória da sessão. Há componentes reutilizáveis, por exemplo `RequestState`, `Loading`, `ErrorMessage`, `PageHeader`, `DataTable`, `Filtros`, `StatusBadge`, `KpiCard` e `Grafico`.

## Rotas implementadas

| Rota | Página / arquivo | Observação do comportamento atual |
|---|---|---|
| `/` | Home — `pages/Publico.jsx` | Vitrine com dados de demonstração |
| `/explorar` | Explorar — `pages/Publico.jsx` | Busca, filtros e paginação locais |
| `/campanhas/:id` | Detalhe — `pages/Publico.jsx` | Detalhe da amostra; campanha inexistente tem estado próprio |
| `/doar/:id` | Fluxo — `pages/FluxoDoacao.jsx` | Fluxo parcial; não processa pagamento |
| `/login` | Login — `pages/Login.jsx` | Demonstração local; recuperação/envio de e-mail não conectado |
| `/dashboard` | Dashboard — `pages/Dashboard.jsx` | Indicadores da amostra |
| `/dashboard/campanha` | Análise — `pages/Dashboard.jsx` | Dashboard analítico com dados locais |
| `/campanhas` | Campanhas — `pages/Campanhas.jsx` | Gestão local das campanhas |
| `/campanhas/nova` | Criar — `pages/CriarCampanha.jsx` | Cadastro/rascunho local; não representa as três etapas separadas do Figma |
| `/campanhas/:id/editar` | Editar — `pages/EditarCampanha.jsx` | Alterações em estado de demonstração |
| `/campanhas/:id/acompanhamento` | Acompanhamento — `pages/AcompanhamentoCampanha.jsx` | Indicadores e atualizações de demonstração |
| `/campanhas/:id/prestacao-de-contas` | Prestação — `pages/PrestacaoContas.jsx` | Regras e publicação apenas na demonstração |
| `/doacoes` | Doações recebidas — `pages/DoacoesGestao.jsx` | Não é “Minhas doações” do usuário doador |
| `/entidades` | Entidades — `pages/Entidades.jsx` | Diretório local preservado |
| `/doadores` | Doadores — `pages/Doadores.jsx` | Histórico local |
| `/itens` | Itens — `pages/Itens.jsx` | Estoque local |
| `/relatorios` | Relatórios — `pages/Relatorios.jsx` | Prévia local; exportação de arquivo não implementada |
| `/cadastro-entidade` | Cadastro — `pages/CadastroEntidade.jsx` | Dados/documentos apenas locais; sem envio persistente |
| `/configuracoes` | Perfil — `pages/CadastroEntidade.jsx` | Reutiliza a tela de cadastro em modo perfil |
| `/configuracoes/usuarios` | Usuários — `pages/Usuarios.jsx` | Edição local; sem convite ou controle real de acesso |
| `*` | Página não encontrada — `components/Ui.jsx` | Fallback definido dentro do layout público |

As rotas administrativas não possuem proteção de autenticação identificada. O fallback e a navegação direta estão definidos no roteador; sua cobertura por teste está indicada no registro de testes, não presumida por esta tabela.

## Dados, serviços e configuração

Os dados exibidos pelas páginas vêm principalmente de `src/mocks/` e do `DemoContext`. O serviço em `src/mocks/index.js` simula chamadas assíncronas. Isso deve ser diferenciado dos serviços Axios em `src/services/`.

`src/services/api.js` cria um cliente Axios com `VITE_API_URL` e fallback `http://localhost:8080/api`, timeout de 15 segundos e normalização de erros. Existem serviços de leitura para campanhas, doações e entidades em `src/services/*Service.js`. **A revisão do código não encontrou consumidores desses serviços Axios nas telas;** algumas páginas usam serviços simulados importados de `src/mocks`. A URL fallback e os caminhos de serviço são código existente, não confirmação de endpoint ou contrato do backend.

Nenhuma integração nova foi iniciada. Antes dela, as equipes precisam confirmar contratos, autenticação, permissões, uploads, pagamentos, persistência e comportamento de erros. Não inserir segredos no repositório; valores de ambiente reais não devem ser copiados para esta documentação.

## Limites funcionais confirmados

- Pagamento via PIX, boleto ou cartão não é processado.
- Recuperação de senha não envia e-mail.
- Dados e edições da demonstração não persistem ao recarregar a página.
- Seleção de documentos não envia arquivos.
- Usuários/permissões são representados localmente, sem conceder acesso real.
- Relatórios não geram ou baixam PDF/CSV.
- As telas ausentes de confirmação, “Minhas doações” e detalhe da doação não têm rota correspondente em `App.jsx` na `develop` consultada.
- A criação de campanha ainda não reproduz como fluxo separado as três etapas descritas no protótipo.

## Qualidade, acessibilidade e responsividade

Há tratamento compartilhado de carregamento/erro e foco programático do título após a troca de rota em `App.jsx`. A presença desses elementos não comprova que todas as telas tratem todos os estados aplicáveis. Os resultados de lint incluem dois avisos descritos no [registro de testes](frontend-testes-unitarios.md). A comparação visual completa com o Figma, teste responsivo sistemático e aprovação de acessibilidade permanecem pendentes.

## Referências e dependências

- [Issue #78 — documentação Web](https://github.com/PrjDoaSync/doasync-frontend/issues/78)
- [Issue #21 — validação com equipe/cliente](https://github.com/PrjDoaSync/doasync-frontend/issues/21)
- [Issue #79–#82 — testes unitários por área](https://github.com/PrjDoaSync/doasync-frontend/issues/79)
- [Issue #136 — pipeline de testes](https://github.com/PrjDoaSync/doasync-frontend/issues/136)
- [Figma Doasync](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=0-1&m=dev)

Contratos e endpoints dependem do backend. Revisão visual/aceite depende da autenticação no Figma e da equipe/cliente. A pipeline de testes depende da atividade da equipe responsável por DevOps/QA.
