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

## Escopo e limites dos testes existentes

| Arquivo | Área observada |
|---|---|
| `web/src/test/campanhas.test.jsx` | Validação/edição e telas de acompanhamento de campanhas |
| `web/src/test/fluxos.test.jsx` | Navegação pública, doação demonstrativa, gestão, relatórios e estados |
| `web/src/test/gestao.test.js` | Cálculos, filtros, validações, estoque e carregamento da amostra |
| `web/src/test/prestacao.test.jsx` | Regras e tela demonstrativa de prestação de contas |

Os testes exercitam a implementação local e seus mocks; não validam contratos, autenticação, pagamentos, persistência, endpoints de backend, visual de todas as 30 telas nem integração com QA.

## Issues e gates

As Issues #79–#82 descrevem testes por componentes/infraestrutura, Campanhas, Doações e Gestão. Os 63 testes aprovados não demonstram que todos os critérios e cenários requeridos nessas issues estejam cobertos. Cada responsável deve vincular casos/evidências à sua Issue e relacionar lacunas ao comportamento confirmado, sem presumir regras ausentes.

A Issue #136 registra a necessidade de workflow de testes em GitHub Actions. Esta verificação local não substitui o pipeline; a existência e execução da CI devem ser confirmadas com o responsável de DevOps/QA.

## Segurança de dependências

`npm audit` (somente leitura, após `npm ci`) reportou uma vulnerabilidade alta transitiva em `follow-redirects`, faixa `1.16.0–1.16.1`, com correção disponível. Nenhuma atualização foi aplicada para preservar as versões travadas e o escopo da revisão documental. Encaminhar a avaliação e eventual atualização de dependência ao mantenedor frontend responsável, validar regressões e registrar o resultado antes de fechar a pendência.

## Regra de registro

Para execuções futuras, anotar data, branch/commit, ambiente, comando exato, resultado, falhas, correções e link de CI/PR quando houver. Não afirmar cobertura, QA aprovado ou teste executado sem log correspondente. Não anexar tokens, senhas, arquivos `.env` ou dados sensíveis.
