# Matriz Figma e frontend

O inventário anterior registra 30 telas desktop. A coluna Frame Figma usa os códigos do inventário e as issues correspondentes. O conector recusou a leitura e a captura por permissão. O canal nativo do navegador integrado não estava acessível nesta execução. Cada status abaixo descreve a implementação funcional. A comparação visual individual, a navegação do protótipo e a revisão de componentes e variantes ainda dependem de acesso ao arquivo.

Fontes para o inventário e o escopo. [Validação anterior](frontend-validacao.md) · [Figma oficial](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=65-3954)

| Tela | Frame Figma | Implementação atual | Divergência | Correção | Status |
|---|---|---|---|---|---|
| Home | CAM-01 · [#48](https://github.com/PrjDoaSync/doasync-frontend/issues/48) | `/` | Comparação visual pendente | Comparar visualmente | API |
| Explorar e filtros | CAM-02 · [#49](https://github.com/PrjDoaSync/doasync-frontend/issues/49) | `/explorar` | Comparação visual pendente | Confirmar filtros de localização com produto e API | API |
| Detalhe | CAM-03 · [#50](https://github.com/PrjDoaSync/doasync-frontend/issues/50) | `/campanhas/:id` | Comparação visual pendente | Comparar visualmente | API |
| Criar, dados básicos | CAM-04 · [#51](https://github.com/PrjDoaSync/doasync-frontend/issues/51) | `/campanhas/nova` | Comparação visual pendente | Comparar visualmente | API |
| Criar, metas e itens | CAM-05 · [#52](https://github.com/PrjDoaSync/doasync-frontend/issues/52) | `/campanhas/nova` | Comparação visual pendente | Meta financeira disponível. Itens dependem de contrato | Parcial |
| Criar, imagens/revisão/publicação | CAM-06 · [#53](https://github.com/PrjDoaSync/doasync-frontend/issues/53) | `/campanhas/nova` | Comparação visual pendente | Revisão e capa por URL disponíveis. Upload e galeria pendentes | Parcial |
| Minhas campanhas | CAM-07 · [#54](https://github.com/PrjDoaSync/doasync-frontend/issues/54) | `/campanhas` | Comparação visual pendente | Comparar visualmente | API |
| Editar | CAM-08 · [#55](https://github.com/PrjDoaSync/doasync-frontend/issues/55) | `/campanhas/:id/editar` | Comparação visual pendente | Carregar a versão oficial do backend com o campo de versão; o formulário já permite recarregar após conflito. | Condicional |
| Acompanhamento | CAM-09 · [#56](https://github.com/PrjDoaSync/doasync-frontend/issues/56) | `/campanhas/:id/acompanhamento` | Comparação visual pendente | Indicadores, registros recentes e status disponíveis. Atualizações públicas e indicadores de itens dependem de contrato | API |
| Encerramento e prestação | CAM-10 · [#57](https://github.com/PrjDoaSync/doasync-frontend/issues/57) | acompanhamento e `/prestacao-de-contas` | Comparação visual pendente | Encerramento disponível. Destinação, despesas, anexos e publicação sem API | Parcial |
| Escolha de modalidade | DOA-01 · [#58](https://github.com/PrjDoaSync/doasync-frontend/issues/58) | `/doar/:id` | Comparação visual pendente | MVP suporta registro PIX; outras modalidades do protótipo ficam pendentes | Parcial |
| Identificação | DOA-02 · [#59](https://github.com/PrjDoaSync/doasync-frontend/issues/59) | `/doar/:id` | Comparação visual pendente | Confirmar identidade, anonimato e retorno ao fluxo com produto | API |
| Financeira | DOA-03 · [#60](https://github.com/PrjDoaSync/doasync-frontend/issues/60) | doação por campanha ou entidade | Comparação visual pendente | Comparar visualmente | API |
| PIX | DOA-04 · [#61](https://github.com/PrjDoaSync/doasync-frontend/issues/61) | etapa de revisão | Comparação visual pendente | Registro real em base, com confirmação simulada pelo backend. Falta gateway | Parcial |
| Cartão e boleto | DOA-05 · [#62](https://github.com/PrjDoaSync/doasync-frontend/issues/62) | indisponível | Comparação visual pendente | Requer definição de produto e provedor | Fora do MVP financeiro |
| Doação de itens | DOA-06 · [#63](https://github.com/PrjDoaSync/doasync-frontend/issues/63) | indisponível | Comparação visual pendente | Definir cadastro, aceitação, itens e estoque | Sem API |
| Agendamento | DOA-07 · [#64](https://github.com/PrjDoaSync/doasync-frontend/issues/64) | indisponível | Comparação visual pendente | Definir entrega e retirada | Sem API |
| Confirmação | DOA-08 · [#65](https://github.com/PrjDoaSync/doasync-frontend/issues/65) | `/doar/.../confirmacao/:doacaoId` | Comparação visual pendente | PDF e envio dependem de contrato | API |
| Minhas doações | DOA-09 · [#66](https://github.com/PrjDoaSync/doasync-frontend/issues/66) | `/minhas-doacoes` | Comparação visual pendente | Comparar visualmente | API |
| Detalhe da doação | DOA-10 · [#67](https://github.com/PrjDoaSync/doasync-frontend/issues/67) | `/minhas-doacoes/:doacaoId` | Comparação visual pendente | Comparar visualmente | API |
| Login e recuperação | GES-01 · [#68](https://github.com/PrjDoaSync/doasync-frontend/issues/68) | `/login` | Comparação visual pendente | Adicionar serviço de recuperação por e-mail quando houver contrato. | Parcial |
| Cadastro da entidade | GES-02 · [#69](https://github.com/PrjDoaSync/doasync-frontend/issues/69) | `/cadastro-entidade` | Comparação visual pendente | Cadastro disponível. Falta envio documental | Parcial |
| Dashboard geral | GES-03 · [#70](https://github.com/PrjDoaSync/doasync-frontend/issues/70) | `/dashboard` | Comparação visual pendente | Comparar KPIs por papel com os frames | API |
| Dashboard por campanha | GES-04 · [#71](https://github.com/PrjDoaSync/doasync-frontend/issues/71) | `/dashboard/campanha` | Comparação visual pendente | Comparar detalhamento e hierarquia visual | API |
| Doações recebidas | GES-05 · [#72](https://github.com/PrjDoaSync/doasync-frontend/issues/72) | `/doacoes` | Comparação visual pendente | Filtro temporal, paginação e detalhe. Identificação segue anonimato do backend | API |
| Histórico de doadores | GES-06 · [#73](https://github.com/PrjDoaSync/doasync-frontend/issues/73) | `/doadores` | Comparação visual pendente | Busca nominal nos registros recebidos, sem anônimos. A API omite o identificador para entidades (RN73). Histórico por pessoa exige contrato compatível com essa regra | Parcial |
| Estoque | GES-07 · [#74](https://github.com/PrjDoaSync/doasync-frontend/issues/74) | `/itens` | Comparação visual pendente | Definir recebimento, movimentações e saldo | Sem API |
| Relatórios | GES-08 · [#75](https://github.com/PrjDoaSync/doasync-frontend/issues/75) | `/relatorios` | Comparação visual pendente | CSV da arrecadação disponível. Revisar exportações adicionais do protótipo | API e CSV local |
| Usuários e permissões | GES-09 · [#76](https://github.com/PrjDoaSync/doasync-frontend/issues/76) | `/configuracoes/usuarios` | Comparação visual pendente | ADMIN gerencia status de contas; convites e papéis internos da entidade sem API | Parcial |
| Perfil e configurações | GES-10 · [#77](https://github.com/PrjDoaSync/doasync-frontend/issues/77) | `/configuracoes`, `/perfil-usuario` | Comparação visual pendente | Edição de entidade e conta disponível. Documentos e preferências específicas pendentes | Parcial |

## Inspeção da aplicação

O Chrome renderizou a vitrine em 390 e 1366 px com dados do PostgreSQL isolado. A inspeção do aplicativo levou à remoção da oferta de doação de itens e das marcações vazias de categoria e localização. Essas evidências cobrem a saída da aplicação. A comparação de cada tela com o Figma continua pendente.

O axe-core foi executado na Home, em Explorar e no login. A primeira leitura apontou contraste de etiquetas e legendas e nomes acessíveis insuficientes nos links de imagens. Foram adotadas cores semânticas existentes e nomes que incluem a categoria quando ela está visível. A segunda verificação final passou nas três rotas e a navegação por teclado alcançou o link de salto ao conteúdo. Faltam os demais fluxos, leitores de tela e a comparação com o protótipo.
