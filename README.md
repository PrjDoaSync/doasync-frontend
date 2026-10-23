# DoaSync — Equipe 4 | Front-end

## Sobre o DoaSync

O DoaSync é uma plataforma que conecta doadores, pessoas físicas ou jurídicas, a entidades assistenciais e organizações não governamentais. O projeto contempla campanhas, doações financeiras e de itens, acompanhamento das doações e ferramentas de gestão, indicadores e relatórios.

## Escopo da Equipe 4

A Equipe 4 atua no planejamento e desenvolvimento das interfaces do DoaSync, com foco no front-end Web. As entregas devem seguir os fluxos e padrões definidos no protótipo, os critérios de aceite das issues e as dependências acordadas com as demais áreas.

### Funcionalidades Web

O inventário desktop do Figma reúne as seguintes áreas:

- **Campanhas:** vitrine pública, listagem e filtros, detalhe, criação, edição, acompanhamento, encerramento e prestação de contas.
- **Doações:** escolha do tipo, doação financeira ou de itens, identificação do doador, opções de pagamento representadas no protótipo, agendamento, confirmação, listagem e detalhe.
- **Gestão e Dashboard:** login e recuperação de senha, cadastro e perfil da entidade, dashboards, doações recebidas, doadores, controle de itens, relatórios, usuários e permissões.

O inventário considera 10 frames de Campanhas, 10 de Doações e 10 de Gestão/Dashboard. O frame “Editar acesso · Paulo Souza” aparece separadamente no Figma e deve ser tratado conforme sua relação com a tela de usuários e permissões. O escopo Mobile é mencionado nas issues do projeto e deve ser acompanhado pelas referências específicas dessa frente.

## Referências do projeto

- **Protótipo no Figma:** [DoaSync — arquivo de design](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)
- **GitHub Project #8:** [Planejamento e acompanhamento das entregas](https://github.com/orgs/PrjDoaSync/projects/8)
- **Repositório:** [PrjDoaSync/equipe-4-gestao-dashboard](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard)

## Tecnologias

As issues do projeto mencionam **React** para Web, **Expo** para Mobile, **Axios** para comunicação HTTP e **Spring Boot** para as APIs. Essas referências descrevem a stack prevista nas tarefas; a configuração efetiva de cada tecnologia deve ser confirmada nos arquivos e nas entregas correspondentes antes de documentar comandos de instalação ou execução.

## Organização e qualidade

- Vincular cada entrega à issue correspondente e à referência relevante do Figma.
- Respeitar o escopo, as dependências e os critérios de aceite definidos para a tarefa.
- Manter a interface consistente com os fluxos aprovados, incluindo estados de carregamento, vazio, erro e sucesso quando especificados.
- Basear integrações nos contratos de API acordados; não presumir endpoints, regras de negócio ou permissões.
- Executar as verificações aplicáveis à entrega e registrar resultados e limitações no pull request.
- Abrir pull requests vinculados às issues e solicitar revisão conforme o fluxo de contribuição da equipe.
- Não incluir credenciais, tokens ou outros dados sensíveis no código ou na documentação.

## Documentação técnica

- [Documentação técnica do Front-end Web](docs/frontend-web.md)
- [Checklist de conformidade visual — Figma × Front-end Web](docs/frontend-validacao.md)

## Integrantes do grupo

| Integrante       | Turma         | Atuação              |
| ---------------- | ------------- | -------------------- |
| Lucas I.         | CSTADS125N4-T | Front-end / Back-end |
| Julio C. R.      | CSTADS125N4-T | Front-end            |
| Nícolas O. C. S. | CSTADS126N2   | Front-end            |
| Pietro F. R. S. | CSTADS126N2-S | Banco de Dados       |
| Matheus D. P.    | CSTADS125N4-T | Front-end / Back-end |
| Juan A. C.       | CSTADS125N4-T | Banco de Dados       |
| João V. L.       | CSTADS126N2   | Back-end             |
