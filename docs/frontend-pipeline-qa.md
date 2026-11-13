# Pipeline Front-end — QA, Build e Testes Automatizados

> **Observação de Governança:** O desenvolvimento e a sustentação de CI/CD são responsabilidade de **DevOps**. Este documento cobre a estruturação inicial da pipeline de testes de QA do frontend ([Issue #136](https://github.com/PrjDoaSync/doasync-frontend/issues/136)), a ser alinhada com a Gestão e DevOps.

## 1. Objetivo

A Pipeline Front-end tem como objetivo automatizar a validação de QA e a compilação da aplicação desenvolvida em React (`web/`), utilizando o GitHub Actions.

O processo permite identificar erros durante o desenvolvimento, executar testes automatizados de QA e verificar se a aplicação está apta para gerar uma versão de produção.

A pipeline é independente da pipeline do back-end, que utiliza Java e Spring Boot.

## 2. Tecnologias utilizadas

- **React 19 + Vite 8:** ferramentas utilizadas no desenvolvimento e empacotamento da interface em `web/`.
- **Node.js 22:** ambiente de execução utilizado para gerenciar as dependências e executar os comandos do projeto.
- **npm (`npm ci`):** gerenciador de pacotes utilizado para instalar as dependências de forma determinística a partir do `web/package-lock.json`.
- **GitHub Actions:** ferramenta responsável pela automação da pipeline.
- **Oxlint (`npm run lint`):** ferramenta de análise estática configurada no projeto para identificar possíveis problemas no código.
- **Vitest 5 + React Testing Library (`npm test`):** ferramentas configuradas para execução dos testes automatizados unitários, de componentes e de fluxos da interface.

## 3. Gatilhos de execução

A pipeline é executada automaticamente nos seguintes eventos:

### Push

Quando alterações são enviadas para as branches:

- `main`
- `develop`
- `feature/**`
- `feat/**`
- `fix/**`
- `ci/**`

### Pull Request

Quando um Pull Request é aberto ou atualizado com destino às branches:

- `main`
- `develop`

### Execução manual

Também é possível executar a pipeline manualmente pelo GitHub Actions, utilizando a opção `workflow_dispatch`.

A execução automática é acionada por alterações nos arquivos da pasta `web/` e nos arquivos de workflows em `.github/workflows/`.

## 4. Etapas da Pipeline

### 4.1. Checkout do repositório

Utiliza a action `actions/checkout@v4` para obter o código-fonte do repositório, disponibilizando os arquivos necessários para a execução das próximas etapas.

### 4.2. Configuração do Node.js

Utiliza `actions/setup-node@v4` para configurar o Node.js na versão 22.

Também habilita o cache do npm com base em `web/package-lock.json`, permitindo otimizar instalações futuras das dependências.

### 4.3. Instalação das dependências

Executa o comando no diretório `web/`:

```bash
npm ci --no-audit --no-fund
```

Esse comando instala exatamente as dependências declaradas no `web/package-lock.json`, garantindo consistência entre as instalações realizadas localmente e no ambiente da pipeline.

### 4.4. Análise estática do código

Executa o linter configurado no projeto por meio do comando:

```bash
npm run lint --if-present
```

Essa etapa verifica possíveis problemas de escrita, organização e qualidade do código JavaScript/JSX.

### 4.5. Execução dos testes automatizados

Executa os testes automatizados da aplicação React por meio do comando:

```bash
npm test
```

O script executa `vitest run` sobre as suítes localizadas em `web/src/test/`:
- `gestao.test.js`: testes unitários de indicadores, filtros, série financeira, validação de entrada (CNPJ, datas, valores) e estoque;
- `campanhas.test.jsx`: testes de validação e componentes de edição e acompanhamento de campanhas;
- `prestacao.test.jsx`: testes de regras e fluxos da tela de encerramento e prestação de contas;
- `fluxos.test.jsx`: testes de componentes e fluxos de navegação pública, doação, dashboard, relatórios, cadastro de entidade e usuários.

### 4.6. Build e validação de compilação

Executa:

```bash
npm run build
```

Essa etapa verifica se a aplicação consegue ser compilada pelo Vite e gerar o bundle de produção em `web/dist/`. Caso existam erros de compilação, a pipeline será interrompida.

### 4.7. Publicação de relatórios e artefatos

Utiliza `actions/upload-artifact@v4` para disponibilizar os arquivos gerados durante a execução:

- Relatórios de cobertura dos testes (`web/coverage/`), quando gerados;
- Arquivos de distribuição de build (`web/dist/`).

A publicação utiliza `if: always()`, permitindo disponibilizar as evidências mesmo quando alguma etapa anterior falhar.

## 5. Critérios de aprovação

A pipeline será considerada aprovada quando as etapas obrigatórias de instalação (`npm ci`), lint, testes automatizados (`npm test`) e build (`npm run build`) forem executadas sem erros.

Caso alguma dessas etapas apresente falhas, a execução será marcada como malsucedida, permitindo que a equipe identifique e corrija os problemas antes do merge das alterações.

## 6. Estado Atual e Próximos Passos (Alinhamento com Gestão e DevOps)

### 6.1. Estado atual
- Workflow inicial estruturado em `.github/workflows/frontend-qa.yml` com o job `qa-frontend`.
- Ambiente Node.js 22 configurado com cache de dependências e instalação reproduzível via `npm ci`.
- Execução automatizada de 4 suítes de testes (`Vitest` + `React Testing Library` em `web/src/test/`), análise estática (`oxlint`) e validação de build (`vite build`).

### 6.2. Próximos passos
1. **Alinhamento e Governança com DevOps:**
   - Validar o workflow junto à equipe de DevOps e Gestão para padronização de CI/CD no repositório.
   - Configurar *Branch Protection Rules* nas branches `main` e `develop` para exigir a aprovação do status check `Build e Suite de Testes QA (Frontend)` antes da conclusão de Pull Requests.
2. **Evolução para Testes E2E com Selenium:**
   - Adicionar um job ou etapa dedicada aos testes End-to-End (E2E) com Selenium WebDriver (Chrome Headless), iniciando a aplicação compilada (`npm run preview`) no runner e executando os fluxos críticos de ponta a ponta.
3. **Cobertura de Testes e Relatórios de QA:**
   - Habilitar geração de relatório de cobertura (`vitest run --coverage`) e exportação de resultados em formato JUnit/HTML nos artefatos do GitHub Actions.
4. **Integração com Ambiente de Homologação / API:**
   - Configurar variáveis de ambiente (`VITE_API_URL`) via *GitHub Secrets/Variables* quando os contratos de backend e o ambiente de homologação estiverem disponíveis.

## 7. Benefícios da Pipeline

- Automatização das verificações de QA do front-end.
- Identificação antecipada de regressões e erros de compilação.
- Padronização do processo de desenvolvimento e revisão de PRs.
- Maior segurança na integração de alterações nas branches `develop` e `main`.
- Disponibilização de relatórios e artefatos como evidências de QA.

## 8. Estrutura do arquivo

O workflow está localizado em:

`.github/workflows/frontend-qa.yml`

A pipeline utiliza o job `qa-frontend` (`Build e Suite de Testes QA (Frontend)`), responsável por executar todas as etapas de qualidade, testes automatizados e build da aplicação React no diretório `web/`.
