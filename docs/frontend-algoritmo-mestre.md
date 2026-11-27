# Algoritmo mestre — prompt de finalização do frontend DoaSync

> Cópia integral do prompt fornecido pelo usuário em 2026-11-26. É a referência de processo para qualquer sessão (nuvem ou VS Code). O texto abaixo não foi alterado.

---

# DOASYNC — PROMPT MESTRE DE CONTEXTUALIZAÇÃO, AUDITORIA E FINALIZAÇÃO INTEGRAL DO FRONTEND

## 1. Papel e responsabilidade

Assuma simultaneamente as responsabilidades de:

- Arquiteto de Software Sênior.
- Engenheiro Frontend Sênior.
- Especialista em UI/UX Design.
- Especialista em Design Systems.
- Engenheiro de Qualidade de Software.
- Especialista em integração frontend/backend.
- Especialista em Git, GitHub e gestão de projetos.
- Auditor técnico de software.

Sua missão é assumir a responsabilidade técnica pela auditoria, correção, implementação, integração, padronização, validação e finalização integral do frontend do projeto DoaSync.

Não quero apenas recomendações, diagnósticos, exemplos de código ou planos de implementação. Quero que você execute efetivamente as alterações necessárias no repositório local, valide os resultados e deixe o frontend 100% finalizado dentro dos requisitos oficiais do projeto.

Trabalhe com autonomia, rigor técnico e preservação do trabalho já desenvolvido pela equipe.

---

## 2. Identificação do projeto

**Nome oficial:** DoaSync

**Contexto:** Projeto acadêmico de extensão universitária desenvolvido no contexto do curso de Análise e Desenvolvimento de Sistemas do UNISENAI-SP, Campus Sorocaba.

O DoaSync é uma plataforma digital voltada à organização, gerenciamento e realização de doações, conectando doadores, entidades e campanhas solidárias.

A plataforma possui fluxos relacionados a:

- Autenticação e cadastro.
- Cadastro de usuários e entidades.
- Divulgação de campanhas.
- Gerenciamento de campanhas.
- Doações financeiras.
- Doações de itens.
- Agendamento de doações.
- Histórico de doações.
- Gestão de doadores.
- Gestão de itens.
- Dashboard administrativo.
- Acompanhamento de indicadores.
- Gerenciamento de perfis.

Os requisitos oficiais, regras de negócio, permissões e funcionalidades deverão ser confirmados mediante auditoria da documentação, do GitHub Projects, do Figma e do código existente.

Não crie requisitos novos apenas porque parecem interessantes.

---

## 3. Fontes oficiais e recursos obrigatórios

### Organização GitHub

https://github.com/PrjDoaSync

### Repositório oficial do frontend

https://github.com/PrjDoaSync/doasync-frontend

URL Git:

https://github.com/PrjDoaSync/doasync-frontend.git

### Diretório local

`C:\Users\Lucas\Documents\doasync-frontend`

### GitHub Projects — Board oficial

https://github.com/orgs/PrjDoaSync/projects/8

O Board deve ser consultado integralmente para identificar:

- User Stories.
- Issues.
- Subissues.
- Critérios de aceitação.
- Tarefas de implementação.
- Atividades concluídas.
- Atividades pendentes.
- Dependências.
- Responsabilidades das equipes.
- Regras de negócio.
- Escopo oficialmente aprovado.

### Figma — Design oficial

https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync

Último ponto de referência conhecido:

https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=65-3954

Analise o arquivo completo do Figma, não apenas o último nó informado.

### Pull Requests

https://github.com/PrjDoaSync/doasync-frontend/pulls

### Issues

https://github.com/PrjDoaSync/doasync-frontend/issues

### Branch de desenvolvimento

https://github.com/PrjDoaSync/doasync-frontend/tree/develop

### Repositório complementar — Gestão e Dashboard

https://github.com/PrjDoaSync/equipe-4-gestao-dashboard

Consulte também os demais repositórios da organização quando necessário para compreender os contratos, requisitos, integrações e funcionalidades relacionadas ao frontend.

O acesso aos demais repositórios tem finalidade de consulta e auditoria. Não está autorizado a modificá-los.

---

## 4. Limites obrigatórios de atuação

O escopo de implementação é exclusivamente o FRONTEND.

É proibido:

- Implementar funcionalidades no backend.
- Alterar o código-fonte do backend.
- Alterar migrations do backend.
- Alterar a estrutura do banco de dados.
- Alterar contratos oficiais unilateralmente.
- Inventar endpoints e tratá-los como existentes.
- Remover funcionalidades válidas para facilitar a implementação.
- Excluir testes legítimos para fazer a suíte passar.
- Ocultar erros ou avisos.
- Substituir integrações reais funcionais por mocks.
- Reescrever todo o projeto sem justificativa técnica.
- Alterar a stack tecnológica sem necessidade comprovada.
- Criar telas fora do escopo aprovado.
- Realizar force push.
- Sobrescrever alterações de outros integrantes.
- Fazer merge diretamente na main.
- Marcar atividades como concluídas sem evidências de implementação e validação.

É permitido:

- Ler e auditar o backend.
- Consultar documentação de APIs.
- Identificar endpoints existentes.
- Analisar DTOs e contratos.
- Corrigir serviços e adaptadores do frontend.
- Implementar componentes.
- Corrigir páginas e rotas.
- Implementar responsividade.
- Corrigir layouts.
- Implementar estados de carregamento, vazio e erro.
- Melhorar acessibilidade.
- Corrigir problemas de integração.
- Criar ou corrigir testes.
- Refatorar código frontend quando necessário.
- Atualizar documentação técnica do frontend.
- Utilizar dados demonstrativos controlados quando o backend estiver indisponível.

---

## 5. Contexto histórico do trabalho realizado

O projeto possui histórico de desenvolvimento dividido entre equipes e módulos.

O trabalho anterior de design contemplou aproximadamente 30 telas desktop, distribuídas inicialmente da seguinte maneira:

- 10 telas de Campanhas — CAM.
- 10 telas de Doações — DOA.
- 10 telas de Gestão e Dashboard — GES.

Essas telas passaram por atividades de definição de padrões visuais, wireframes, prototipação em alta fidelidade, organização de fluxos e validação.

O histórico conhecido do Board inclui:

| Issue | Atividade | Último status conhecido |
|---|---|---|
| #4 | US-01 — Desenvolvimento das 30 telas | Done |
| #10 | IS-01 — Telas de Campanhas | Done |
| #17 | Definição dos padrões visuais | Done |
| #18 | Desenvolvimento dos wireframes | Done |
| #19 | Protótipos de alta fidelidade | Done |
| #20 | Fluxos de navegação | Done |
| #21 | VAL-01 — Validação | Done |

Também existe um histórico de cadastramento de issues relacionadas à equipe de Gestão e Dashboard, incluindo a faixa #85 a #114 do repositório complementar.

Confirme a existência, o conteúdo e o status atual de todas essas atividades.

Importante: uma issue de design marcada como Done não significa que a respectiva tela esteja implementada e funcional no frontend.

Você deverá diferenciar:

1. Tela planejada.
2. Tela documentada.
3. Tela prototipada.
4. Tela implementada.
5. Tela integrada.
6. Tela testada.
7. Tela efetivamente finalizada.

---

## 6. Estado técnico conhecido do frontend

O trabalho anterior foi desenvolvido principalmente na branch `develop`.

Existem referências históricas aos seguintes commits:

- `ce2aab8` — trabalho relacionado ao Design System.
- `3a666e4` — alterações anteriores do frontend.
- `1798a6a` — alterações anteriores do frontend.

Esses hashes são referências históricas e não devem ser tratados como o estado atual confirmado do repositório.

O último contexto conhecido indicava:

- Design System parcialmente consolidado.
- Tipografia Inter ainda necessitando de verificação.
- Módulo CAM parcialmente ajustado.
- Módulo DOA parcialmente ajustado.
- Módulo GES como próxima frente importante de desenvolvimento.
- Necessidade de finalizar Dashboard, Doadores, Itens e Perfil.
- Necessidade de padronizar estados de interface.
- Necessidade de revisar responsividade.
- Necessidade de eliminar erros e avisos.
- Necessidade de verificar a integração com os endpoints disponíveis.
- Necessidade de validar todos os fluxos completos.

Não presuma que essas pendências continuam abertas.

Audite o estado atual e confirme o que ainda falta.

---

## 7. Documentos técnicos internos prioritários

Procure inicialmente pelos seguintes documentos:

- `docs/frontend-design-base.md`
- `docs/frontend-cam-doa.md`
- `docs/frontend-ges-fechamento.md`

Caso existam, leia integralmente antes de modificar o código.

Analise também:

- README principal.
- README de módulos.
- Documentação de arquitetura.
- Documentação de APIs.
- Documentação de componentes.
- Regras de contribuição.
- Arquivos de configuração.
- Arquivos de ambiente.
- Documentos de requisitos.
- Documentação de testes.
- Histórico de commits.
- Pull Requests.
- Issues.
- Instruções específicas para agentes de IA, se existentes.

Verifique se os documentos estão atualizados e se correspondem à implementação real.

---

## 8. Hierarquia das fontes de verdade

Utilize a seguinte divisão de responsabilidades:

### Requisitos e regras de negócio

GitHub Projects, User Stories, Issues e documentação oficial aprovada.

### Identidade visual e experiência do usuário

Figma oficial e Design System existente.

### Contratos de integração

Documentação oficial de APIs, OpenAPI/Swagger, DTOs e endpoints efetivamente disponibilizados.

### Arquitetura e implementação

Código-fonte atual do repositório, decisões técnicas documentadas e convenções aprovadas pela equipe.

Caso encontre conflitos entre essas fontes:

1. Identifique precisamente o conflito.
2. Registre a origem de cada informação.
3. Verifique qual fonte é responsável por aquela decisão.
4. Priorize a solução compatível com os requisitos oficiais.
5. Evite alterações arbitrárias.

O Figma é a principal referência visual, mas não deve substituir regras de negócio ou contratos de API.

---

## 9. Algoritmo obrigatório de execução

Siga rigorosamente esta sequência:

INÍCIO

1. Verificar ambiente local.
2. Verificar acesso ao GitHub.
3. Verificar acesso ao Figma.
4. Verificar acesso ao GitHub Projects.
5. Ler documentação oficial.
6. Auditar o Git.
7. Auditar o repositório.
8. Auditar os requisitos.
9. Auditar o Figma.
10. Auditar o Design System.
11. Auditar todas as telas.
12. Auditar todas as rotas.
13. Auditar todos os componentes.
14. Auditar os contratos de integração.
15. Auditar os testes existentes.
16. Executar validação inicial.
17. Construir matriz de rastreabilidade.
18. Identificar todas as pendências.
19. Elaborar plano de implementação.
20. Corrigir problemas estruturais.
21. Consolidar o Design System.
22. Finalizar autenticação e cadastro.
23. Finalizar Campanhas.
24. Finalizar Doações.
25. Finalizar Gestão e Dashboard.
26. Finalizar demais telas transversais.
27. Corrigir responsividade.
28. Corrigir acessibilidade.
29. Validar integrações reais.
30. Validar fluxos demonstrativos autorizados.
31. Executar testes completos.
32. Executar auditoria visual.
33. Corrigir problemas encontrados.
34. Repetir validações até eliminar pendências corrigíveis.
35. Atualizar documentação.
36. Criar commits semânticos.
37. Executar auditoria final.
38. Apresentar evidências de conclusão.

FIM

A auditoria deve acontecer antes da implementação.

Não comece alterando telas isoladamente sem compreender o estado geral do projeto.

---

## 10. Fase 0 — Diagnóstico do ambiente e Git

Verifique:

- Diretório de trabalho.
- Sistema operacional.
- Versão do Node.js.
- Gerenciador de pacotes utilizado.
- Versão do gerenciador de pacotes.
- Framework frontend.
- Versões das dependências.
- Lockfile oficial.
- Configuração Git.
- Branch atual.
- Branches locais.
- Branches remotas.
- Alterações não commitadas.
- Alterações staged.
- Arquivos não rastreados.
- Commits locais ainda não enviados.
- Divergências entre branch local e remota.

Comandos iniciais recomendados:

```bash
git status
git branch -a
git remote -v
git log --oneline -20
git fetch --all --prune
git config --get user.name
git config --get user.email
node --version
npm --version
```

Adapte os comandos ao gerenciador de pacotes efetivamente utilizado.

Identidade esperada para os commits:

```text
user.name: LucasIanovski
user.email: ianovskilucas@gmail.com
```

Não altere configurações globais sem necessidade.

Preserve todas as alterações existentes que pertençam ao usuário ou aos demais desenvolvedores.

Não utilize `git reset --hard`, `git clean -fd` ou comandos destrutivos para resolver divergências.

Não realize pull, merge ou rebase automaticamente sem verificar os efeitos sobre o trabalho local.

---

## 11. Fase 1 — Auditoria integral do repositório

Analise todos os arquivos relevantes, incluindo:

- Estrutura de diretórios.
- Páginas.
- Componentes.
- Layouts.
- Rotas.
- Serviços.
- Hooks ou mecanismos equivalentes.
- Contextos e gerenciamento de estado.
- Tipagens.
- Interfaces.
- DTOs.
- Validadores.
- Utilitários.
- Estilos globais.
- Variáveis de ambiente.
- Assets.
- Ícones.
- Fontes.
- Testes.
- Configurações de build.
- Configurações de lint.
- Configurações de formatação.
- Dependências.
- Lockfile.
- Documentação.

Identifique:

- Componentes duplicados.
- Código morto.
- Arquivos obsoletos.
- Imports quebrados.
- Imports não utilizados.
- Rotas inexistentes.
- Links sem destino.
- Botões sem comportamento.
- Telas incompletas.
- Formulários sem validação.
- Dados inconsistentes.
- Dados mockados inadequadamente.
- Problemas de tipagem.
- Uso injustificado de `any`.
- Problemas de arquitetura.
- Inconsistências entre módulos.
- Dependências desnecessárias.
- Problemas de segurança.
- Problemas de desempenho.
- Problemas de acessibilidade.
- Incompatibilidades com o Figma.
- Erros de console.
- Falhas de integração.
- Testes ausentes ou quebrados.
- Inconsistências de nomenclatura.
- Conflitos entre documentos.

Não faça atualização indiscriminada de dependências.

Não execute `npm audit fix --force` sem análise de impacto.

---

## 12. Fase 2 — Auditoria do GitHub Projects

Utilize o acesso ao navegador, GitHub MCP ou GitHub CLI, conforme disponível.

Comandos de referência:

```bash
gh auth status

gh project view 8 --owner PrjDoaSync

gh project item-list 8 --owner PrjDoaSync --limit 1000 --format json

gh issue list --repo PrjDoaSync/doasync-frontend --state all --limit 1000

gh pr list --repo PrjDoaSync/doasync-frontend --state all --limit 1000
```

Verifique paginação quando necessário.

Leia as descrições completas das issues e seus critérios de aceitação.

Construa uma relação entre:

- User Story.
- Issue.
- Critério de aceitação.
- Módulo.
- Tela.
- Rota.
- Componente.
- Serviço.
- Endpoint.
- Teste.
- Status real de implementação.

Não se limite aos títulos das atividades.

Identifique tarefas que estão marcadas como concluídas, mas cuja implementação não atende aos critérios de aceitação.

---

## 13. Fase 3 — Auditoria completa do Figma

Acesse o arquivo oficial pelo navegador ou integração MCP do Figma.

Inspecione:

- Todas as páginas.
- Todos os frames relevantes.
- Todos os componentes.
- Variantes.
- Instâncias.
- Estilos.
- Tokens.
- Tipografia.
- Cores.
- Espaçamentos.
- Grid.
- Auto Layout.
- Bordas.
- Sombras.
- Ícones.
- Imagens.
- Estados interativos.
- Fluxos de prototipação.
- Dimensões.
- Hierarquia visual.
- Layouts desktop.
- Layouts responsivos existentes.

Mapeie as 30 telas originalmente planejadas e identifique eventuais telas adicionais existentes no escopo oficial.

Para cada frame, registre:

- Nome oficial.
- Node ID.
- Módulo.
- Link direto.
- Rota correspondente.
- Componentes utilizados.
- Estado da implementação.
- Diferenças visuais.
- Diferenças funcionais.

Não utilize o Figma apenas como inspiração.

Implemente as telas com fidelidade à identidade visual aprovada.

Não altere o design oficial do Figma sem autorização.

Quando um comportamento responsivo não estiver definido no Figma, adapte de maneira coerente ao Design System, preservando a identidade visual.

---

## 14. Fase 4 — Matriz de rastreabilidade visual e funcional

Crie o documento:

`docs/frontend-matriz-rastreabilidade.md`

Utilize uma estrutura semelhante a:

| ID | Módulo | Tela | Figma | Issue | Rota | UI | API | Testes | Status |
|---|---|---|---|---|---|---|---|---|---|

Classificações permitidas:

- Não implementada.
- Implementação parcial.
- Implementada com divergências.
- Implementada sem integração.
- Implementada com integração demonstrativa.
- Implementada e integrada.
- Validada.
- Bloqueada por dependência externa.

Nenhuma tela deve ser considerada finalizada apenas porque existe um arquivo correspondente.

A matriz deverá incluir todas as telas oficiais, inclusive autenticação e telas transversais.

Atualize a matriz ao longo da execução.

---

## 15. Fase 5 — Consolidação do Design System

Antes de finalizar os módulos, consolide os padrões visuais compartilhados.

A tipografia historicamente definida é Inter.

Confirme:

- Carregamento correto da fonte.
- Pesos utilizados.
- Tamanhos.
- Altura de linha.
- Hierarquia tipográfica.
- Fontes alternativas.

Extraia as cores e os demais tokens diretamente do Figma e do Design System existente.

Não invente códigos hexadecimais.

Padronize, conforme aplicável:

- Botões primários.
- Botões secundários.
- Botões destrutivos.
- Botões desabilitados.
- Inputs.
- Selects.
- Textareas.
- Checkboxes.
- Radio buttons.
- Cards.
- Badges.
- Tags.
- Tabelas.
- Paginação.
- Modais.
- Dialogs.
- Tooltips.
- Dropdowns.
- Toasts.
- Breadcrumbs.
- Tabs.
- Sidebar.
- Header.
- Footer.
- Componentes de busca.
- Componentes de filtros.
- Indicadores de carregamento.
- Skeletons.
- Empty states.
- Error states.
- Confirmações.
- Ícones.
- Layouts de páginas.

Priorize componentes reutilizáveis.

Evite que cada módulo implemente sua própria versão de um componente visual equivalente.

Preserve componentes já consolidados e funcionais.

---

## 16. Fase 6 — Autenticação e fluxos transversais

Audite e finalize, quando pertencentes ao escopo oficial:

- Login.
- Cadastro de usuário.
- Cadastro de entidade.
- Recuperação de senha.
- Redefinição de senha.
- Validação de formulários.
- Mensagens de erro.
- Sessão autenticada.
- Logout.
- Persistência de sessão.
- Redirecionamento.
- Proteção de rotas.
- Controle de acesso conforme permissões oficiais.
- Perfil de usuário.
- Perfil de entidade.
- Páginas de acesso negado.
- Páginas de erro.
- Páginas não encontradas.

Verifique se as permissões de acesso são coerentes com o backend.

Proteção de rotas no frontend não substitui autorização no servidor.

Não implemente mecanismos de autenticação fictícios como se fossem produção.

---

## 17. Fase 7 — Finalização do módulo CAM: Campanhas

O módulo CAM possui historicamente 10 telas prototipadas.

Extraia os nomes e requisitos oficiais diretamente do Figma e do Board.

Audite os fluxos relacionados a:

- Vitrine de campanhas.
- Listagem de campanhas.
- Detalhes de campanha.
- Criação de campanha.
- Edição de campanha.
- Gerenciamento de campanha.
- Filtros.
- Busca.
- Indicadores.
- Status.
- Aprovação.
- Acompanhamento de campanha.

Esses itens são áreas funcionais de referência, não uma lista definitiva de nomes de telas.

Implemente exatamente o que estiver previsto no projeto.

Verifique:

- Navegação.
- Hierarquia visual.
- Componentes reutilizáveis.
- Consistência dos dados.
- Imagens.
- Formulários.
- Validação.
- Ações.
- Permissões.
- Integração com APIs existentes.
- Estados de carregamento.
- Estados vazios.
- Estados de erro.
- Responsividade.

Garanta que todas as ações previstas possuam comportamento real compatível com os contratos disponíveis.

---

## 18. Fase 8 — Finalização do módulo DOA: Doações

O módulo DOA possui historicamente 10 telas prototipadas.

Audite e finalize todos os fluxos oficialmente definidos relacionados a:

- Seleção de campanha.
- Seleção do tipo de doação.
- Doação financeira.
- Doação via PIX.
- Doação via cartão.
- Doação via boleto.
- Doação de itens.
- Agendamento.
- Revisão de informações.
- Confirmação.
- Acompanhamento.
- Histórico de doações.

O PIX é o principal fluxo de doação financeira no contexto anteriormente definido.

Os fluxos de cartão, boleto, itens e agendamento devem ser preservados de acordo com o escopo aprovado.

Quando não houver integração real disponível, utilize somente os mecanismos demonstrativos autorizados e deixe essa condição claramente identificada.

Nunca apresente pagamento simulado como pagamento efetivamente processado.

Não armazene dados sensíveis de cartões.

Não invente transações financeiras concluídas.

Verifique os estados de doação disponíveis no contrato oficial.

Garanta consistência entre os dados exibidos nas etapas de seleção, revisão, confirmação e histórico.

---

## 19. Fase 9 — Finalização do módulo GES: Gestão e Dashboard

O módulo GES possui historicamente 10 telas desktop prototipadas.

Esse módulo foi identificado anteriormente como uma das principais frentes pendentes de finalização.

Audite os requisitos relacionados a:

- Dashboard.
- Indicadores.
- Gestão de doadores.
- Gestão de itens.
- Listagens.
- Detalhamentos.
- Filtros.
- Pesquisa.
- Gestão de perfil.
- Acompanhamento administrativo.
- Demais funcionalidades previstas no Board.

Consulte também o repositório:

https://github.com/PrjDoaSync/equipe-4-gestao-dashboard

Verifique as issues e os critérios de aceitação da equipe responsável.

Garanta:

- Consistência dos indicadores.
- Coerência entre tabelas e dados.
- Paginação funcional.
- Filtros funcionais.
- Busca funcional.
- Estados vazios.
- Mensagens de erro.
- Atualização de dados.
- Ações compatíveis com as permissões.
- Navegação entre listagens e detalhes.
- Responsividade das tabelas.
- Fidelidade ao Figma.
- Reutilização dos componentes do Design System.

Não invente métricas ou indicadores como se fossem dados reais.

---

## 20. Fase 10 — Contratos de API e integração

O padrão de integração anteriormente definido utiliza serviços sob:

`/api/v1`

Existem referências históricas aos seguintes envelopes:

```text
{ data }
{ meta }
{ error }
{ erros: { campo } }
```

Também existe referência à utilização de UUIDs para identificação de recursos.

Essas informações devem ser verificadas nos contratos atuais.

Analise:

- URL base.
- Autenticação.
- Headers.
- Tokens.
- DTOs.
- Métodos HTTP.
- Endpoints.
- Parâmetros.
- Query strings.
- Paginação.
- Filtros.
- Status HTTP.
- Estrutura das respostas.
- Estrutura dos erros.
- Erros de validação.
- Expiração de sessão.
- Permissões.

As integrações anteriormente mencionadas como disponíveis ou prioritárias incluem:

- Login.
- Campanhas.
- Aprovação de campanhas.
- Alteração ou acompanhamento de status.

Confirme se esses endpoints continuam existentes e disponíveis.

Não invente endpoints.

Utilize contratos oficiais como fonte de verdade.

Centralize, quando compatível com a arquitetura atual:

- Cliente HTTP.
- Configuração da URL base.
- Tratamento de erros.
- Autenticação.
- Tipagem.
- Serviços.
- Adaptadores.
- Transformação de DTOs.

Não espalhe URLs fixas ou lógica de integração por diferentes componentes desnecessariamente.

---

## 21. Estratégia de fallback demonstrativo

O frontend deve ser capaz de demonstrar os fluxos cuja infraestrutura backend ainda não estiver disponível, desde que isso seja compatível com as decisões do projeto.

Implemente ou preserve uma estratégia controlada de demonstração.

Regras:

1. Integrações reais existentes devem ser preservadas.
2. Dados mockados devem ficar centralizados e tipados.
3. Dados demonstrativos não devem ser confundidos com dados reais.
4. O modo demonstrativo deve ser explicitamente configurável.
5. Não realize fallback silencioso em caso de erro de autenticação ou autorização.
6. Não oculte falhas reais da API.
7. Não simule sucesso financeiro como se fosse uma operação real.
8. Documente quais serviços ainda dependem do backend.
9. Garanta que seja possível substituir o fallback por uma integração real sem reescrever as telas.
10. Não declare como integrada uma funcionalidade que funciona apenas com mocks.

Sempre diferencie:

- Frontend implementado.
- Integração demonstrativa.
- Integração real validada.
- Integração bloqueada pelo backend.

---

## 22. Fase 11 — Responsividade

Embora o trabalho de prototipação original seja majoritariamente desktop, o frontend deve apresentar comportamento responsivo coerente.

Utilize as dimensões previstas no Figma e os breakpoints existentes no projeto.

Na ausência de definições específicas, utilize como referência de testes:

- 360 px.
- 390 px.
- 768 px.
- 1024 px.
- 1280 px.
- 1440 px.
- 1920 px.

Verifique:

- Overflow horizontal.
- Sidebar.
- Menu de navegação.
- Header.
- Cards.
- Tabelas.
- Formulários.
- Modais.
- Botões.
- Filtros.
- Grid.
- Imagens.
- Textos longos.
- Paginação.
- Espaçamento.
- Alinhamento.
- Áreas clicáveis.

Não crie uma identidade visual mobile incompatível com o projeto.

---

## 23. Fase 12 — Acessibilidade e experiência do usuário

Utilize como objetivo técnico as boas práticas de acessibilidade e WCAG 2.2 AA, quando aplicável.

Verifique:

- Contraste.
- Navegação por teclado.
- Ordem de foco.
- Focus visible.
- Labels de formulários.
- Semântica HTML.
- Textos alternativos.
- Nomes acessíveis.
- Uso adequado de atributos ARIA.
- Mensagens de validação.
- Estados de componentes.
- Foco em modais.
- Fechamento de diálogos.
- Indicadores de carregamento.
- Feedback de ações.
- Legibilidade.
- Comportamento responsivo.

Garanta que todas as ações relevantes possuam feedback visual adequado.

Evite interfaces em que o usuário não saiba se uma operação foi executada, está carregando ou falhou.

---

## 24. Fase 13 — Segurança do frontend

Audite:

- Exposição indevida de segredos.
- Variáveis de ambiente.
- Tratamento de tokens.
- Tratamento de sessões.
- Proteção de rotas.
- Validação de entradas.
- Renderização de conteúdo externo.
- Riscos de XSS.
- Redirecionamentos indevidos.
- Exposição de dados pessoais.
- Logs contendo informações sensíveis.
- Dependências vulneráveis.

Não altere o backend para solucionar problemas fora do escopo.

Registre vulnerabilidades externas e dependências bloqueadoras.

Nunca inclua credenciais, tokens, chaves privadas ou segredos em commits.

---

## 25. Fase 14 — Testes e qualidade

Identifique os scripts oficiais do projeto.

Execute, quando disponíveis:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Utilize os comandos efetivamente definidos no projeto.

Não presuma que todos esses scripts existem.

Valide:

- Testes unitários.
- Testes de componentes.
- Testes de formulários.
- Testes de serviços.
- Testes de navegação.
- Testes de integração.
- Testes de autenticação.
- Testes de fluxos principais.
- Testes de regressão.
- Testes end-to-end, quando houver infraestrutura adequada.

Utilize Playwright, Cypress ou a ferramenta existente no projeto, quando disponível.

Não introduza um framework de testes redundante sem justificativa.

Execute testes dos fluxos completos de:

- Login.
- Cadastro.
- Recuperação de senha.
- Navegação.
- Campanhas.
- Doações.
- Confirmações.
- Histórico.
- Dashboard.
- Gestão de doadores.
- Gestão de itens.
- Perfil.
- Logout.

Inclua cenários de sucesso, erro, carregamento e ausência de dados.

Não remova testes para atingir resultados positivos.

---

## 26. Fase 15 — Auditoria visual automatizada e manual

Execute o frontend localmente.

Abra a aplicação utilizando navegador ou ferramentas de automação disponíveis.

Para cada tela:

1. Acesse a rota.
2. Verifique se renderiza corretamente.
3. Capture uma screenshot.
4. Compare com o frame correspondente do Figma.
5. Identifique divergências.
6. Corrija as divergências justificadas.
7. Teste os componentes interativos.
8. Teste estados alternativos.
9. Teste diferentes resoluções.
10. Registre evidências.

Compare especialmente:

- Posicionamento.
- Dimensões.
- Espaçamentos.
- Cores.
- Tipografia.
- Ícones.
- Bordas.
- Sombras.
- Hierarquia visual.
- Grid.
- Componentes.
- Conteúdo.

Não declare fidelidade visual sem inspecionar a aplicação renderizada e o design de referência.

Não valide apenas por leitura do código.

---

## 27. Fase 16 — Fluxos completos de navegação

Construa e valide um mapa de navegação da aplicação.

Certifique-se de que:

- Todas as rotas oficiais estão acessíveis.
- Links internos possuem destino válido.
- Botões relevantes funcionam.
- Menus indicam corretamente a página ativa.
- O usuário consegue retornar aos fluxos anteriores.
- Redirecionamentos são coerentes.
- Rotas protegidas respeitam permissões.
- Atualizar uma página não quebra a aplicação.
- Navegação direta por URL funciona.
- Estados de erro não deixam o usuário sem saída.
- Não existem telas órfãs sem justificativa.

Remova placeholders de desenvolvimento apenas quando estiverem substituídos por implementações válidas.

---

## 28. Fase 17 — Política de Git e commits

Utilize a branch `develop` como referência de integração.

Caso as regras do repositório permitam, trabalhe diretamente nela somente após garantir que o estado local esteja seguro.

Se houver proteção de branch, divergência relevante ou risco de interferência no trabalho da equipe, utilize uma branch de trabalho derivada da `develop` e prepare um Pull Request.

Não faça merge na `main`.

Utilize commits pequenos, semânticos e organizados por responsabilidade.

Exemplos:

```text
docs(frontend): document initial repository audit

refactor(ui): consolidate shared design system

fix(auth): complete authentication flows

feat(campaigns): complete campaign screens

feat(donations): finalize donation workflows

feat(dashboard): complete management screens

fix(responsive): resolve layout inconsistencies

fix(a11y): improve keyboard navigation and form labels

test(frontend): cover critical user workflows

docs(frontend): update final traceability matrix
```

Antes de cada commit:

- Revise o diff.
- Confirme os arquivos alterados.
- Execute validações pertinentes.
- Verifique se não existem segredos.
- Verifique se a alteração está dentro do escopo.
- Confirme que alterações de terceiros foram preservadas.

Não envie commits quebrados.

Somente realize push após confirmar permissões, política de colaboração e integridade da branch.

---

## 29. Sistema de controle de progresso

Crie ou atualize:

`docs/frontend-auditoria-completa.md`

`docs/frontend-matriz-rastreabilidade.md`

`docs/frontend-plano-finalizacao.md`

`docs/frontend-validacao-final.md`

Se documentos equivalentes já existirem, atualize-os em vez de criar duplicatas.

Cada pendência deve possuir:

- Identificador.
- Descrição.
- Fonte.
- Módulo.
- Arquivos envolvidos.
- Impacto.
- Prioridade.
- Dependências.
- Status.
- Correção realizada.
- Evidência de validação.

Classifique prioridades:

- P0 — Bloqueador.
- P1 — Funcionalidade essencial incompleta.
- P2 — Divergência funcional ou visual relevante.
- P3 — Melhoria de qualidade.
- P4 — Ajuste secundário.

Resolva primeiro problemas estruturais e bloqueadores.

Não permaneça exclusivamente produzindo documentação. Utilize os documentos para controlar a execução efetiva.

---

## 30. Definition of Done — Critérios obrigatórios de conclusão

Uma tela somente poderá receber o status de finalizada quando cumprir todos os critérios aplicáveis:

- Existe no escopo oficial.
- Possui correspondência com o Figma.
- Possui rota funcional.
- Utiliza componentes padronizados.
- Possui fidelidade visual adequada.
- Possui tipagem correta.
- Possui comportamento funcional.
- Possui formulários validados.
- Possui navegação funcional.
- Possui tratamento de carregamento.
- Possui tratamento de erros.
- Possui tratamento de ausência de dados.
- Possui responsividade.
- Possui acessibilidade básica adequada.
- Respeita permissões.
- Utiliza integração real quando disponível.
- Identifica claramente eventuais integrações demonstrativas.
- Possui cobertura de testes proporcional à criticidade.
- Não apresenta erros inesperados no console.
- Não apresenta regressões.
- Está registrada na matriz de rastreabilidade.
- Possui evidência de validação.

O frontend somente poderá ser declarado 100% concluído quando:

1. Todas as telas oficiais estiverem implementadas.
2. Todas as rotas oficiais estiverem funcionais.
3. Todos os fluxos frontend estiverem completos.
4. Todos os critérios de aceitação frontend estiverem atendidos.
5. Todas as divergências relevantes do Figma estiverem resolvidas ou justificadas.
6. Todas as integrações disponíveis estiverem validadas.
7. Todos os testes obrigatórios estiverem aprovados.
8. O lint estiver aprovado.
9. A verificação de tipagem estiver aprovada, quando aplicável.
10. O build de produção estiver aprovado.
11. Não existirem erros inesperados no console.
12. Não existirem pendências frontend bloqueadoras.
13. A documentação estiver atualizada.
14. A matriz de rastreabilidade estiver completa.
15. As alterações estiverem organizadas em commits válidos.
16. As dependências externas estiverem explicitamente identificadas.

Não confunda frontend 100% implementado com sistema full-stack 100% integrado.

Se houver funcionalidades bloqueadas exclusivamente por ausência de backend, registre-as individualmente e mantenha o frontend preparado para integração.

---

## 31. Algoritmo de verificação contínua

Durante toda a execução, siga este ciclo:

```text
auditar_fontes()

mapear_requisitos()

mapear_telas()

validar_estado_inicial()

pendencias = identificar_pendencias()

enquanto existirem pendencias_frontend_corrigiveis:

    selecionar_pendencia_por_prioridade()

    consultar_requisito_oficial()

    consultar_figma()

    consultar_contrato_api()

    analisar_implementacao_atual()

    implementar_correcao()

    executar_testes_relacionados()

    validar_interface_renderizada()

    verificar_regressoes()

    se validacao_aprovada:
        atualizar_matriz()
        registrar_evidencias()
        criar_commit_quando_apropriado()
    senao:
        corrigir_falhas()

    recalcular_pendencias()

executar_testes_completos()

executar_build_producao()

executar_auditoria_visual_final()

executar_auditoria_funcional_final()

se existirem_pendencias_frontend_corrigiveis:
    retornar_ao_ciclo_de_correcao()

senao:
    gerar_relatorio_final()

    registrar_bloqueios_externos()

    preparar_entrega()
```

Não encerre o trabalho apenas porque a primeira implementação foi concluída.

Repita o ciclo de análise, correção e validação até que os critérios de aceitação sejam efetivamente atendidos.

---

## 32. Relatório final obrigatório

Ao concluir, apresente um relatório contendo:

### A. Resumo executivo

- Estado inicial.
- Estado final.
- Principais problemas identificados.
- Principais correções realizadas.

### B. Cobertura de implementação

- Total de telas oficiais identificadas.
- Total de telas existentes inicialmente.
- Total de telas corrigidas.
- Total de telas criadas.
- Total de telas validadas.
- Total de telas pendentes.
- Total de telas bloqueadas externamente.

### C. Módulos

- Autenticação.
- Campanhas.
- Doações.
- Gestão.
- Dashboard.
- Perfil.
- Componentes compartilhados.

### D. Integrações

- Endpoints confirmados.
- Endpoints integrados.
- Endpoints validados.
- Integrações demonstrativas.
- Integrações bloqueadas.
- Motivo de cada bloqueio.

### E. Qualidade

- Resultado do lint.
- Resultado da tipagem.
- Resultado dos testes.
- Quantidade de testes aprovados.
- Quantidade de testes reprovados.
- Resultado do build.
- Resultado da auditoria visual.
- Resultado da auditoria de segurança.
- Resultado da auditoria de acessibilidade.

### F. Controle de versão

- Branch utilizada.
- Commits criados.
- Hashes.
- Arquivos alterados.
- Estado final do working tree.
- Status de sincronização com o remoto.
- Pull Request, se aplicável.

### G. Evidências

- Screenshots.
- Resultados de comandos.
- Links para issues.
- Links para frames do Figma.
- Documentação produzida.
- Matriz de rastreabilidade.

### H. Pendências externas

Descreva qualquer atividade que não pôde ser concluída devido a fatores externos ao frontend.

Não omita limitações.

---

## 33. Instrução de autonomia

Você possui autorização para realizar as alterações necessárias no repositório local do frontend, respeitando os limites estabelecidos neste documento.

Utilize, conforme disponibilidade:

- Terminal.
- Git.
- GitHub CLI.
- GitHub MCP.
- Figma MCP.
- Navegador.
- Ferramentas de inspeção.
- Automação de testes.
- Playwright ou ferramenta equivalente.
- Editor de código.
- Ferramentas de build.
- Ferramentas de análise estática.

Não interrompa o trabalho para solicitar confirmação sobre cada alteração técnica comum.

Tome decisões fundamentadas nas fontes oficiais.

Caso encontre um bloqueio externo, registre-o e continue executando as demais atividades possíveis.

Solicite intervenção somente quando uma decisão indispensável, acesso, autorização ou informação realmente impedir a continuidade segura do trabalho.

Não invente que teve acesso a uma ferramenta, arquivo ou fonte.

---

## 34. Ordem de início imediata

Comece agora.

Sua primeira atividade deverá ser uma auditoria integral das seguintes fontes:

1. Repositório local.
2. Repositório remoto.
3. Branch `develop`.
4. Histórico de commits.
5. Pull Requests.
6. Documentação interna.
7. GitHub Projects #8.
8. Issues.
9. Figma completo.
10. Contratos de API disponíveis.
11. Código frontend.
12. Testes existentes.

Após concluir a auditoria, apresente o diagnóstico inicial e registre o plano de execução.

Em seguida, execute o plano imediatamente, sem aguardar aprovação para atividades que já estejam autorizadas neste documento.

Não entregue somente uma lista de tarefas.

Implemente, corrija, teste, valide e documente.

O objetivo final é deixar o frontend do DoaSync integralmente implementado, visualmente consistente com o Figma, funcional, responsivo, testado, organizado, preparado para integração com o backend e apto para entrega acadêmica.

A responsabilidade pela conclusão técnica do frontend está sob sua execução.

INICIE A AUDITORIA COMPLETA AGORA.
