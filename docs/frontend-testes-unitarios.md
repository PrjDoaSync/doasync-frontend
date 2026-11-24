# Registro de testes unitários — Frontend Web DoaSync

> Coordenação da documentação: LucasIanovski — [Issue #78](https://github.com/PrjDoaSync/doasync-frontend/issues/78)<br>
> Testes por área: [#79](https://github.com/PrjDoaSync/doasync-frontend/issues/79), [#80](https://github.com/PrjDoaSync/doasync-frontend/issues/80), [#81](https://github.com/PrjDoaSync/doasync-frontend/issues/81) e [#82](https://github.com/PrjDoaSync/doasync-frontend/issues/82)

## Ferramentas e comandos

O projeto declara Vitest 5, jsdom e React Testing Library em `web/package.json`; a configuração está em `web/vitest.config.js`, e os testes estão em `web/src/test/`. O lockfile da aplicação fica em `web/package-lock.json`.

Execute a partir de `web/`:

```bash
npm ci
npm test
npm run build
npm run lint
```

Não instalar ou atualizar versões ad hoc para corrigir resultados de teste. Use o lockfile da aplicação (`web/`), não o arquivo não rastreado encontrado na raiz do repositório.

## Execução registrada — 10/11/2026

| Verificação | Comando | Resultado | Evidência/observação |
|---|---|---|---|
| Instalação reproduzível | `npm ci` | Aprovada | Instalou 129 pacotes a partir do lockfile. O npm reportou 1 vulnerabilidade alta transitiva; pacote `follow-redirects`, faixa `1.16.0–1.16.1`, correção disponível. Nenhuma correção de dependência foi aplicada nesta revisão. |
| Testes | `npm test` | Aprovado | 4 arquivos e 63 testes passaram. Duração reportada pelo Vitest: 12,91 s. |
| Build | `npm run build` | Aprovado | Vite 8.3.4 transformou 62 módulos e gerou `dist/`. |
| Lint | `npm run lint` | Aprovado com avisos | Oxlint terminou com código 0 e reportou 2 avisos listados abaixo. |
| Inicialização local | `npm run dev -- --host 127.0.0.1` | Aprovada | Vite iniciou em `http://127.0.0.1:5173/`; servidor encerrado após a verificação. |

Ambiente observado: Node.js 22.19.0 e npm 10.9.2. Os resultados são locais e não demonstram execução em CI nem aprovação de QA.

### Avisos de lint a encaminhar

- `web/src/context/DemoContext.jsx:32`: `react(only-export-components)` — arquivo exporta também símbolo que não é componente.
- `web/src/pages/Publico.jsx:107`: `eslint(no-unused-expressions)` — expressão sem uso esperado.

Os avisos foram registrados, não corrigidos nesta tarefa documental. O segundo pode indicar código sem efeito; precisa de revisão do responsável técnico antes de qualquer alteração funcional.

## Execução registrada — 18/11/2026

Branch `feature/gustavo-testes-e-estados-web`, criada a partir de `develop` no commit `c65621d`. Ambiente: Node.js 24.20.0, npm 11.19.0, Windows 11. Todos os comandos foram executados a partir de `web/`.

| Verificação | Comando | Resultado | Evidência/observação |
|---|---|---|---|
| Instalação reproduzível | `npm ci` | Aprovada | Encerrou com código 0. |
| Testes (antes das alterações) | `npm test` | Aprovado | 6 arquivos e 87 testes na `develop` (o registro de 10/11 tinha 4 arquivos e 63 testes). |
| Testes (depois) | `npm test` | Aprovado | 10 arquivos e 241 testes passaram. Duração reportada pelo Vitest: 63,14 s. |
| Lint | `npm run lint` | Aprovado com avisos | Código 0 e os mesmos 2 avisos listados acima; nenhum aviso novo. |
| Build | `npm run build` | Aprovado | Vite transformou 73 módulos e gerou `dist/`. |

Foram adicionados 154 testes em 4 arquivos novos (tabela abaixo). Eles exercitam a implementação local e seus mocks; não validam contratos de API, pagamentos, autenticação, persistência nem a aderência visual ao Figma. Os resultados são locais e não demonstram execução em CI nem aprovação de QA.

### Lacunas conhecidas

- `web/src/pages/Doacoes.jsx` (lista com `useRequest`) e `web/src/components/layout/Layout.jsx` não são importados por nenhum arquivo; não receberam testes por serem código sem uso. Cabe ao responsável técnico decidir se permanecem.
- `web/src/pages/CadastroEntidade.jsx` continua coberto apenas pelos cenários de `fluxos.test.jsx` (CNPJ e arquivo acima de 10 MB).
- Os critérios de aceite das Issues #79–#82 que dependem de revisão interna, QA ou comparação com o Figma permanecem para os responsáveis; este registro não os considera atendidos.

## Escopo e limites dos testes existentes

| Arquivo | Área observada |
|---|---|
| `web/src/test/campanhas.test.jsx` | Validação/edição e telas de acompanhamento de campanhas |
| `web/src/test/fluxos.test.jsx` | Navegação pública, doação demonstrativa, gestão, relatórios e estados |
| `web/src/test/gestao.test.js` | Cálculos, filtros, validações, estoque e carregamento da amostra |
| `web/src/test/prestacao.test.jsx` | Regras e tela demonstrativa de prestação de contas |
| `web/src/test/infra.test.jsx` | [#79](https://github.com/PrjDoaSync/doasync-frontend/issues/79): hooks `useRequest` e `useAsyncAction`, `RequestState`, `ErrorMessage`, `Loading`, cliente Axios e services, serviços simulados, `DemoProvider`, layouts, `DataTable`, `Filtros` e UI base (`Ui.jsx`) |
| `web/src/test/campanhasGestao.test.jsx` | [#80](https://github.com/PrjDoaSync/doasync-frontend/issues/80): gestão e filtros de campanhas, `CampanhaCard`/`Progresso`, edição (erros e salvamento), acompanhamento e `diasRestantes` |
| `web/src/test/doacoesFluxo.test.jsx` | [#81](https://github.com/PrjDoaSync/doasync-frontend/issues/81): `valorDoacao`, `SelecaoItens`, `PagamentoPix`, `Agendamento`, identificação do doador e gestão de doações recebidas |
| `web/src/test/gestaoTelas.test.jsx` | [#82](https://github.com/PrjDoaSync/doasync-frontend/issues/82): Login, Entidades, Doadores, Usuários, Itens/estoque, Relatórios, Dashboard e `Grafico` |

Os testes exercitam a implementação local e seus mocks; não validam contratos, autenticação, pagamentos, persistência, endpoints de backend, visual de todas as 30 telas nem integração com QA.

## Issues e gates

As Issues #79–#82 descrevem testes por componentes/infraestrutura, Campanhas, Doações e Gestão. Os 63 testes aprovados não demonstram que todos os critérios e cenários requeridos nessas issues estejam cobertos. Cada responsável deve vincular casos/evidências à sua Issue e relacionar lacunas ao comportamento confirmado, sem presumir regras ausentes.

A Issue #136 registra a necessidade de workflow de testes em GitHub Actions, estruturado inicialmente em [`.github/workflows/frontend-qa.yml`](../.github/workflows/frontend-qa.yml) e documentado em [`docs/frontend-pipeline-qa.md`](frontend-pipeline-qa.md). Esta verificação local não substitui o pipeline; a execução contínua da CI deve ser acompanhada junto ao responsável de DevOps/QA.

## Segurança de dependências

`npm audit` (somente leitura, após `npm ci`) reportou uma vulnerabilidade alta transitiva em `follow-redirects`, faixa `1.16.0–1.16.1`, com correção disponível. Nenhuma atualização foi aplicada para preservar as versões travadas e o escopo da revisão documental. Encaminhar a avaliação e eventual atualização de dependência ao mantenedor frontend responsável, validar regressões e registrar o resultado antes de fechar a pendência.

## Regra de registro

Para execuções futuras, anotar data, branch/commit, ambiente, comando exato, resultado, falhas, correções e link de CI/PR quando houver. Não afirmar cobertura, QA aprovado ou teste executado sem log correspondente. Não anexar tokens, senhas, arquivos `.env` ou dados sensíveis.
