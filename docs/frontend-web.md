# Documentação técnica do Frontend Web — DoaSync

> **Responsável pela documentação:** LucasIanovski  
> **Repositório:** [PrjDoaSync/equipe-4-gestao-dashboard](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard)  
> **Issue principal:** [#78 — DOC-WEB-01](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/78)  
> **Referência de design:** [Arquivo Doasync no Figma](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)

## 1. Objetivo e estado desta documentação

Este documento registra como documentar, implementar, validar e manter o frontend Web do DoaSync de forma rastreável aos protótipos, às issues e às dependências das outras áreas.

**Estado verificado no repositório durante a criação deste documento:** a branch padrão consultada contém o `README.md`, mas não foram encontrados `package.json`, diretório `web/`, diretório `frontend/` ou código de aplicação nos caminhos verificados. Portanto, a arquitetura executável, os comandos de instalação, as versões e o framework de testes **ainda não podem ser confirmados a partir do código deste repositório**. As referências a React, Axios e outras tecnologias nas issues são planejamento, não prova de configuração existente.

Atualize este documento quando o código real for incorporado. Não registre uma estrutura, comando, dependência ou comportamento como existente sem verificar no repositório e executar quando aplicável.

## 2. Escopo funcional Web

O escopo de prototipagem desktop registrado está organizado em três áreas:

- **Campanhas:** home/vitrine pública, listagem e filtros, detalhe, criação, edição, acompanhamento e encerramento/prestação de contas.
- **Doações:** escolha do tipo, doação financeira, doação de itens, identificação do doador, opções de pagamento representadas no protótipo, agendamento, confirmação, listagem e detalhe.
- **Gestão e Dashboard:** autenticação/onboarding, indicadores gerais e por campanha, doações recebidas, doadores, itens, relatórios/exportação, usuários/permissões e perfil/configurações.

A descrição acima resume os frames inventariados no README. Ela não define regras de negócio, integrações de pagamento ou permissões que não tenham sido aprovadas.

### Referências do GitHub

| Área | Protótipo/validação | Implementação Web |
|---|---|---|
| Escopo desktop | [#4](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/4), [#21](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/21) | [#6](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/6), [#12](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/12) |
| Campanhas | [#10](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/10), [#48–#57](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/48) | [#28](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/28) |
| Doações | [#46](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/46), [#58–#67](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/58) | Interfaces Web incluídas no escopo de [#28](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/28); confirmar divisão final das issues |
| Gestão/Dashboard | [#47](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/47), [#68–#77](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/68) | [#6](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/6), [#27](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/27), [#29](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/29) |

> **Atenção:** o README registra 11 frames de Gestão/Dashboard, enquanto a série #68–#77 representa 10 issues de tela. O frame “Editar acesso · Paulo Souza” precisa ser confirmado com a coordenação como tela independente ou estado de uma tela existente antes de fechar a matriz.

## 3. Arquitetura e estrutura de pastas

**Status: pendente de confirmação no código.** O esqueleto abaixo é um roteiro de auditoria, não uma declaração da estrutura existente.

Quando a aplicação estiver disponível, registrar:
- diretório raiz da aplicação Web;
- ponto de entrada e configuração de build;
- organização de páginas, rotas e layouts;
- organização de componentes compartilhados e específicos por área;
- camada de acesso a serviços/API;
- organização de estilos, imagens e outros recursos;
- arquivos de configuração e variáveis de ambiente necessárias;
- estratégia de tratamento de erros e estados de interface.

Não criar uma estrutura nova apenas para fazer o documento parecer completo. Descrever primeiro a estrutura efetivamente adotada pelo projeto.

## 4. Rotas e navegação

**Status: pendente de inventário.** Ao confirmar o roteador e as rotas no código, preencher a tabela:

| Rota | Página/fluxo | Acesso/condição | Estado |
|---|---|---|---|
| A preencher após inspeção do código | A preencher | Somente regras confirmadas | Pendente |

Documentar rotas protegidas, redirecionamentos, parâmetros e links entre telas apenas quando estiverem implementados e aprovados. Não inventar URLs nem presumir regras de autenticação.

## 5. Componentes e padrões de interface

As issues de frontend citam um layout compartilhado com Header, Sidebar e Content e telas de dashboard, campanhas, doações e relatórios. A existência e a API real desses componentes precisam ser verificadas no código.

Ao implementar/documentar, registrar para cada componente compartilhado:
- finalidade e telas consumidoras;
- propriedades/entradas e eventos públicos;
- comportamento responsivo;
- estados de carregamento, vazio, erro e sucesso, quando aplicáveis;
- validações e acessibilidade relevantes;
- exemplos reais de uso.

Verificar no Figma e no código os padrões de botões, campos, seletores, tabelas, filtros, paginação, cards, gráficos, modais, alertas, cores, tipografia e espaçamento. A lista é um roteiro de inspeção, não uma biblioteca já confirmada.

## 6. Integrações e dados

As issues mencionam uma camada de cliente HTTP/serviços e integração às APIs. A documentação deve identificar, depois de confirmar os contratos:
- serviço/endpoint utilizado e finalidade;
- método HTTP e formato dos dados;
- estados de carregamento, sucesso, vazio e falha;
- comportamento para erros e tentativas novamente, se implementado;
- origem de mocks de desenvolvimento/teste;
- dependências e bloqueios sob responsabilidade de outras equipes.

**Não inventar endpoints, payloads, autenticação ou regras de negócio.** Enquanto o contrato estiver indefinido, registrar a pendência e a equipe responsável. Dados simulados podem ser usados em desenvolvimento/testes conforme necessário, mas não devem ser apresentados como integração real nem usados como dados de produção.

Nunca versionar tokens, senhas, chaves privadas ou valores secretos. Documentar apenas nomes e finalidade de variáveis de configuração; usar valores fictícios de exemplo quando necessário.

## 7. Instalação, execução e testes locais

**Status: pendente de verificação.** Os comandos abaixo não são fornecidos porque não há manifesto de aplicação confirmado nos caminhos verificados. Após a incorporação do código:

1. identificar o gerenciador de pacotes e as versões realmente usadas;
2. registrar os comandos de instalação, desenvolvimento, build e testes presentes nos arquivos do projeto;
3. executar cada comando em ambiente limpo ou reproduzível;
4. registrar pré-requisitos e variáveis necessárias sem incluir segredos;
5. atualizar esta seção com o comando exato e o resultado observado.

Não copiar comandos genéricos de outra aplicação sem validá-los.

## 8. Qualidade, testes e fluxo de QA

Os testes unitários de frontend são uma etapa interna antes do encaminhamento para QA:

1. implementar a funcionalidade conforme issue e protótipo aprovado;
2. executar testes unitários e revisão interna;
3. corrigir falhas ou registrar justificativa e risco;
4. confirmar critérios de aceite;
5. encaminhar à equipe de QA pelo fluxo acordado.

Issues relacionadas:
- [#79 — componentes compartilhados e infraestrutura Web](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/79)
- [#80 — Campanhas](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/80)
- [#81 — Doações](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/81)
- [#82 — Gestão e Dashboard](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/82)

Não declarar testes executados, cobertura atingida ou QA aprovado sem evidência de execução e resultado.

## 9. Acessibilidade, responsividade e experiência

Registrar critérios acordados e implementados, tais como navegação por teclado, rótulos de campos, mensagens de validação compreensíveis, contraste, foco visível e adaptação a tamanhos de tela. Não afirmar conformidade com um padrão formal de acessibilidade sem avaliação correspondente.

## 10. Decisões, riscos e pendências

Manter nesta seção ou na issue correspondente as questões ainda não resolvidas:
- confirmar a classificação do frame “Editar acesso · Paulo Souza”;
- mapear individualmente as telas Mobile, se permanecerem no escopo da equipe;
- confirmar os contratos de API e os comportamentos dependentes do backend;
- confirmar regras de autenticação, permissões, pagamentos e exportação com as equipes responsáveis;
- identificar a estrutura real, as dependências e os comandos quando o código Web for incorporado;
- registrar divergências entre Figma, critérios de aceite e implementação.

Para cada pendência, indicar descrição, impacto, responsável/equipe a consultar e issue relacionada. Não transformar hipótese em decisão aprovada.

## 11. Manutenção deste documento

- Atualizar o documento quando arquitetura, rotas, componentes, integrações ou comandos mudarem.
- Manter os links para Figma e issues.
- Descrever o comportamento real, distinguindo fatos confirmados de itens pendentes.
- Revisar junto às mudanças relevantes de frontend e antes de concluir a issue #78.
- Evitar duplicar resultados de testes: manter evidências nas issues #79–#82 e nos PRs, com um resumo ou link aqui quando útil.

## 12. Critérios de conclusão

- [ ] Estrutura real e arquitetura do frontend descritas.
- [ ] Rotas e componentes compartilhados inventariados.
- [ ] Instalação, execução e testes documentados com comandos efetivamente verificados.
- [ ] Integrações e configurações documentadas sem segredos.
- [ ] Links e rastreabilidade para protótipos/issues revisados.
- [ ] Pendências e divergências explicitadas.
- [ ] Conteúdo revisado por LucasIanovski.
