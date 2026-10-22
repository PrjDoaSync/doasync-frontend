# DoaSync — Equipe 4 | Front-end

> **Nome recomendado para a equipe:** Equipe 4 — Front-end DoaSync  
> **Repositório atual:** `PrjDoaSync/equipe-4-gestao-dashboard`  
> **Slug recomendado (pendente de renomeação):** `equipe-4-frontend-doasync`  
> **Organização:** [PrjDoaSync](https://github.com/PrjDoaSync)

## 1. Sobre o DoaSync

O DoaSync é uma plataforma voltada à conexão entre doadores (pessoas físicas e jurídicas), entidades assistenciais/ONGs e gestores da plataforma. O escopo descrito nos registros do projeto inclui campanhas, doações financeiras e de itens, acompanhamento de doações, gestão de entidades, indicadores e relatórios.

## 2. Objetivo deste repositório

Organizar o planejamento e, quando o código for incorporado, o desenvolvimento das interfaces front-end do DoaSync. A cobertura pretendida deve ser rastreável entre protótipo no Figma, issues do GitHub e board do projeto.

**Estado verificado nesta auditoria:** a branch padrão é `main` e o único arquivo presente na raiz é este `README.md`. Não foi encontrado código de aplicação neste repositório durante a inspeção. Portanto, não se presume que dependências, comandos de execução, arquitetura ou componentes já estejam implementados.

## 3. Escopo de front-end a organizar

O escopo de trabalho solicitado para a Equipe 4 abrange as interfaces Web e as telas Mobile que forem confirmadas como parte do projeto. A lista abaixo foi conferida diretamente nos metadados dos frames do Figma. Os nomes refletem o arquivo acessível nesta auditoria; estados internos e componentes filhos não são contados como telas independentes, exceto quando o arquivo os organiza como frame de tela separado.

### Campanhas — Desktop (10 frames identificados no Figma)

1. Home pública / vitrine de campanhas em destaque.
2. Listagem de campanhas com filtros.
3. Detalhe da campanha.
4. Criar campanha — dados básicos.
5. Criar campanha — meta financeira e/ou itens.
6. Criar campanha — imagens, revisão e publicação.
7. Minhas campanhas.
8. Editar campanha.
9. Acompanhamento da campanha.
10. Encerramento e prestação de contas.

### Doações — Desktop (10 frames identificados no Figma)

1. Escolha do tipo de doação — financeira ou itens.
2. Doação financeira — valor sugerido/livre e frequência.
3. Doação de itens — seleção de itens e quantidades.
4. Identificação do doador.
5. Pagamento via PIX.
6. Pagamento via cartão ou boleto.
7. Agendamento de entrega/retirada.
8. Confirmação da doação.
9. Minhas doações.
10. Detalhe da doação.

### Gestão e Dashboard — Desktop (11 frames identificados no Figma)

1. Login e recuperação de senha.
2. Cadastro da entidade e onboarding.
3. Dashboard geral.
4. Dashboard analítico por campanha.
5. Doações recebidas.
6. Doadores e histórico.
7. Controle de itens doados.
8. Relatórios e exportação.
9. Usuários e permissões.
10. Editar acesso de usuário (frame específico: Paulo Souza).
11. Perfil da entidade e configurações.

### Mobile

As issues #8, #15 e #38–#45 mencionam protótipo, wireframes, adaptação visual, telas Mobile de Gestão/Dashboard, navegação e integração. **Os nomes e a cobertura tela a tela do fluxo Mobile ainda precisam ser conferidos no Figma** antes de declarar a matriz completa.

## 4. Referência de design

- **Arquivo Doasync no Figma:** [Abrir o arquivo](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)
- **Estado da inspeção:** acesso aos metadados confirmado. Foram identificadas 10 telas de Campanhas, 10 telas de Doações e 11 frames de Gestão/Dashboard (incluindo um frame separado de edição de acesso). A inspeção de metadados confirma nomes e hierarquia, mas não substitui a revisão visual de cada estado e fluxo.
- **Próxima etapa:** mapear cada frame para a issue correspondente, revisar os componentes compartilhados e validar os fluxos e estados visuais.

## 5. Componentes compartilhados

A existência e o desenho final de componentes reutilizáveis precisam ser confirmados no Figma. As issues atuais mencionam padrões visuais e componentes reutilizáveis, mas não comprovam uma biblioteca já implementada.

Itens a verificar no protótipo antes de abrir issues específicas:
- Cabeçalho e navegação principal.
- Menu lateral e estrutura de conteúdo administrativo.
- Botões, campos de formulário e seletores.
- Cards de campanha e indicadores.
- Tabelas, busca, filtros e paginação.
- Gráficos e visualizações de dados.
- Modais, alertas e feedback visual.
- Estados de carregamento, vazio, erro e sucesso.
- Tokens de cor, tipografia, espaçamento, bordas e sombras.

Esses itens são uma lista de auditoria, não requisitos confirmados. Criar issues próprias somente quando o Figma e as dependências justificarem uma entrega reutilizável.

## 6. Tecnologias e dependências

As issues existentes citam React para Web, Expo para Mobile, Axios para comunicação HTTP e Spring Boot para APIs. Isso descreve o planejamento registrado nas issues; **não comprova que essas tecnologias estejam configuradas no repositório**, pois não foram encontrados arquivos de aplicação.

Antes de documentar comandos de instalação ou execução, confirmar a stack efetiva, a estrutura de diretórios, versões, variáveis de ambiente e contratos de API com as equipes responsáveis.

### Responsabilidades relacionadas

- **Front-end:** apresentação de telas, componentes, navegação, estados de interface, responsividade, acessibilidade e integração do cliente com APIs documentadas.
- **Back-end:** endpoints, autenticação/autorização no servidor, regras de negócio, agregações, processamento e geração de relatórios.
- **Banco de dados:** modelo, consultas, integridade e persistência.
- **Dependências externas:** contratos de API, dados e regras ainda não aprovados devem ser registrados como bloqueios, sem inventar comportamento.

A separação acima é uma orientação de organização. A atribuição de cada issue deve respeitar a divisão de responsabilidades confirmada pela coordenação.

## 7. Organização das issues

- Cada tela ou conjunto coerente de telas deve possuir uma issue rastreável ao frame do Figma.
- Componentes compartilhados podem ter issues próprias quando forem dependências relevantes para várias telas.
- Descrições devem conter objetivo, referência, escopo, navegação, estados confirmados, dependências e critérios de aceite verificáveis.
- Tarefas de back-end, banco de dados e Mobile devem permanecer registradas quando fizerem parte do projeto; estar fora do escopo direto de uma issue de front-end não é motivo para apagar ou encerrar tarefas.
- Preservar responsáveis atuais. Issues sem responsável devem permanecer sem atribuição até decisão do coordenador.
- Evitar duplicidades, mantendo relações claras entre tarefas-pai, telas e dependências.

## 8. Fluxo de contribuição

1. Confirmar o escopo e a referência do Figma na issue.
2. Verificar dependências e critérios de aceite antes de iniciar.
3. Implementar somente a entrega atribuída à issue.
4. Validar a interface e os estados documentados.
5. Abrir pull request vinculado à issue e solicitar revisão conforme o fluxo aprovado pela equipe.
6. Atualizar o status da issue/board somente quando o estado real da tarefa mudar.

O fluxo acima é uma proposta de organização e precisa ser alinhado ao procedimento oficial da equipe antes de ser tratado como obrigatório.

## 9. Critérios gerais de qualidade

- Correspondência com o frame aprovado no Figma.
- Navegação consistente com os fluxos documentados.
- Componentes reutilizáveis conforme padrões confirmados.
- Estados de interface implementados quando especificados.
- Responsividade e acessibilidade conforme critérios acordados.
- Integrações baseadas em contratos de API documentados.
- Ausência de informações sensíveis ou credenciais no código e no repositório.
- Critérios de aceite verificáveis e revisão antes da conclusão.

## 10. Pendências conhecidas

- [x] Obter acesso de inspeção aos metadados do arquivo Figma e inventariar os frames de tela principais.
- [ ] Revisar visualmente os fluxos e estados de cada frame e confirmar com a coordenação se o frame separado “Editar acesso · Paulo Souza” deve ser tratado como tela ou estado.
- [ ] Inventariar e mapear as telas Mobile individualmente.
- [ ] Criar matriz de rastreabilidade Figma → issue → dependências → status.
- [ ] Revisar todas as issues e distinguir prototipação, front-end Web, Mobile, back-end e banco de dados.
- [ ] Auditar o GitHub Project #8; a estrutura e os campos do board ainda não foram verificados por esta integração.
- [ ] Avaliar e executar a renomeação do repositório e a atualização da descrição. A conexão disponível não expôs uma operação de escrita para metadados/renomeação do repositório nesta execução.
- [ ] Confirmar tecnologias e instruções de execução quando o código de aplicação for incorporado.

## 11. Integrantes registrados no README anterior

A tabela abaixo preserva os dados que já constavam no README anterior; ela não representa uma nova validação de disponibilidade ou distribuição de tarefas.

| Integrante | Turma | Atuação registrada |
| :--- | :--- | :--- |
| Lucas I. | CSTADS125N4-T | Front-end / Back-end |
| Julio C. R. | CSTADS125N4-T | Front-end |
| Nícolas O. C. S. | CSTADS126N2 | Front-end |
| Pietro F. R. S. | CSTADS126N2-S | Banco de Dados |
| Matheus D. P. | CSTADS125N4-T | Front-end / Back-end |
| Juan A. C. | CSTADS125N4-T | Banco de Dados |
| João V. L. | CSTADS126N2 | Back-end |
