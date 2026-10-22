# Checklist de conformidade visual — Figma × Frontend Web

> **Responsável pelo registro:** LucasIanovski  
> **Issue de validação do protótipo:** [#21](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/21)  
> **Documentação relacionada:** [DOC-WEB-01 / #78](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/78)  
> **Figma:** [Doasync — arquivo de design](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)

## 1. Objetivo

Usar esta checklist para registrar a conferência entre o protótipo aprovado no Figma e a interface Web realmente implementada. A lista de telas é uma base de rastreabilidade; ela **não significa que as telas já estejam implementadas, revisadas ou aprovadas**.

## 2. Status permitidos

Use apenas um estado que corresponda à evidência disponível:
- **Pendente:** ainda não revisada.
- **Em revisão:** comparação iniciada, faltam verificações.
- **Divergência identificada:** existe diferença que precisa ser avaliada.
- **Bloqueada:** depende de informação, decisão, API ou trabalho externo.
- **Conforme:** revisão realizada e critérios acordados atendidos.
- **Não aplicável:** justificado e aprovado pela coordenação.

Não marque uma tela como “Conforme” sem inspecionar a versão implementada e o frame correspondente. Registre a data, o revisor e evidências/link quando a revisão for concluída.

## 3. Critérios de comparação

Para cada tela, conferir somente os aspectos definidos no protótipo e nos critérios de aceite:
- hierarquia e organização visual;
- tipografia, cores, espaçamento, bordas e componentes;
- conteúdo, rótulos e ações visíveis;
- navegação e destino das ações;
- estados de carregamento, vazio, erro e sucesso quando especificados;
- comportamento responsivo nos tamanhos acordados;
- validações e mensagens que tenham requisito confirmado;
- consistência com componentes compartilhados.

Uma diferença visual não deve ser corrigida com base em preferência pessoal sem avaliar o protótipo aprovado. Comportamentos de negócio não definidos devem ser registrados como pendência, não inventados.

## 4. Campanhas — Desktop

Referência geral: [#10](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/10). Issues individuais de protótipo: [#48–#57](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/48). Implementação Web relacionada: [#28](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/28).

| Código | Tela descrita no inventário | Issue do protótipo | Status da revisão | Evidência / divergência |
|---|---|---:|---|---|
| CAM-01 | Home pública / vitrine de campanhas | #48 | Pendente | A preencher durante a revisão |
| CAM-02 | Listagem de campanhas com filtros | #49 | Pendente | A preencher durante a revisão |
| CAM-03 | Detalhe da campanha | #50 | Pendente | A preencher durante a revisão |
| CAM-04 | Criar campanha — dados básicos | #51 | Pendente | A preencher durante a revisão |
| CAM-05 | Criar campanha — meta financeira e/ou itens | #52 | Pendente | A preencher durante a revisão |
| CAM-06 | Criar campanha — imagens, revisão e publicação | #53 | Pendente | A preencher durante a revisão |
| CAM-07 | Minhas campanhas | #54 | Pendente | A preencher durante a revisão |
| CAM-08 | Editar campanha | #55 | Pendente | A preencher durante a revisão |
| CAM-09 | Acompanhamento da campanha | #56 | Pendente | A preencher durante a revisão |
| CAM-10 | Encerramento e prestação de contas | #57 | Pendente | A preencher durante a revisão |

## 5. Doações — Desktop

Referência geral: [#46](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/46). Issues individuais de protótipo: [#58–#67](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/58). A divisão final das issues de implementação Web deve ser confirmada com a coordenação; a issue #28 menciona Campanhas e Doações.

| Código | Tela descrita no inventário | Issue do protótipo | Status da revisão | Evidência / divergência |
|---|---|---:|---|---|
| DOA-01 | Escolha do tipo de doação — financeira ou itens | #58 | Pendente | A preencher durante a revisão |
| DOA-02 | Doação financeira — valor e frequência | #59 | Pendente | A preencher durante a revisão |
| DOA-03 | Doação de itens — seleção e quantidades | #60 | Pendente | A preencher durante a revisão |
| DOA-04 | Identificação do doador | #61 | Pendente | A preencher durante a revisão |
| DOA-05 | Pagamento via PIX | #62 | Pendente | A preencher durante a revisão |
| DOA-06 | Pagamento via cartão ou boleto | #63 | Pendente | A preencher durante a revisão |
| DOA-07 | Agendamento de entrega/retirada | #64 | Pendente | A preencher durante a revisão |
| DOA-08 | Confirmação da doação | #65 | Pendente | A preencher durante a revisão |
| DOA-09 | Minhas doações | #66 | Pendente | A preencher durante a revisão |
| DOA-10 | Detalhe da doação | #67 | Pendente | A preencher durante a revisão |

> A descrição das telas de pagamento reflete o inventário de protótipos; não confirma que integrações financeiras estejam implementadas ou aprovadas.

## 6. Gestão e Dashboard — Desktop

Referência geral: [#47](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/47). Issues individuais de protótipo: [#68–#77](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/68). Implementação relacionada: [#6](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/6), [#27](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/27), [#29](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/29).

| Código | Tela descrita no inventário | Issue do protótipo | Status da revisão | Evidência / divergência |
|---|---|---:|---|---|
| GES-01 | Login e recuperação de senha | #68 | Pendente | A preencher durante a revisão |
| GES-02 | Cadastro da entidade e onboarding | #69 | Pendente | A preencher durante a revisão |
| GES-03 | Dashboard geral | #70 | Pendente | A preencher durante a revisão |
| GES-04 | Dashboard analítico por campanha | #71 | Pendente | A preencher durante a revisão |
| GES-05 | Doações recebidas | #72 | Pendente | A preencher durante a revisão |
| GES-06 | Doadores e histórico | #73 | Pendente | A preencher durante a revisão |
| GES-07 | Controle de itens doados | #74 | Pendente | A preencher durante a revisão |
| GES-08 | Relatórios e exportação | #75 | Pendente | A preencher durante a revisão |
| GES-09 | Usuários e permissões | #76 | Pendente | A preencher durante a revisão |
| GES-10 | Perfil da entidade e configurações | #77 | Pendente | A preencher durante a revisão |
| A confirmar | “Editar acesso · Paulo Souza” — confirmar se é tela independente ou estado de GES-09 | Confirmar com a coordenação | Pendente | Não contar como tela aprovada até decisão |

O inventário anterior registra 11 frames de Gestão/Dashboard, mas as issues #68–#77 cobrem dez itens. A divergência precisa ser resolvida com a coordenação; não criar um código GES adicional sem confirmar a correspondência no Figma.

## 7. Mobile

O escopo do repositório menciona prototipagem e desenvolvimento Mobile em issues como #8, #15 e #38–#45. Esta checklist é voltada principalmente à validação **Web desktop**; os frames e estados Mobile devem ser inventariados separadamente antes de declarar cobertura.

- [ ] Identificar os frames Mobile diretamente no Figma.
- [ ] Mapear cada frame para sua issue.
- [ ] Confirmar quais entregas Mobile pertencem à Equipe 4 e quais dependem de outras equipes.
- [ ] Criar uma matriz própria somente após confirmar o inventário.

## 8. Registro de uma revisão

Para cada revisão realizada, preencher:

- **Código/tela:**
- **Data da revisão:**
- **Revisor:**
- **Link do frame Figma:**
- **Link da implementação/PR:**
- **Resultado:** Pendente / Em revisão / Divergência identificada / Bloqueada / Conforme / Não aplicável.
- **Diferenças observadas:**
- **Ação necessária e responsável:**
- **Issue relacionada:**

## 9. Conclusão da validação

A validação do conjunto desktop só deve ser concluída depois de:
- [ ] Revisar cada tela e os estados relevantes.
- [ ] Registrar divergências e encaminhá-las às issues responsáveis.
- [ ] Confirmar com a coordenação o frame “Editar acesso · Paulo Souza”.
- [ ] Separar pendências de interface das dependências de API e regras de negócio.
- [ ] Vincular evidências ou PRs quando disponíveis.
- [ ] Registrar a aprovação final conforme o processo definido pela equipe.

**Estado inicial deste documento:** as linhas estão como **Pendente** porque não foi apresentada evidência de revisão visual da implementação. Isso não significa que todas as telas estejam incorretas; significa apenas que a validação ainda não foi registrada aqui.
