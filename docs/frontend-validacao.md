# Matriz de validação — Figma × Frontend Web

> Responsável: LucasIanovski — [Issue #21](https://github.com/PrjDoaSync/doasync-frontend/issues/21) e documentação [#78](https://github.com/PrjDoaSync/doasync-frontend/issues/78)<br>
> Figma de referência: [Doasync](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync?node-id=0-1&m=dev)<br>
> Repositório: [PrjDoaSync/doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend), branch `develop` na revisão de 10/11/2026

## Como interpretar esta matriz

O inventário estrutural do Figma contém 30 frames desktop, dez em cada página. O acesso público confirmou os nomes/grupos dos frames; isso **não equivale a aceite visual**. Não foram registrados aqui resultados de comparação pixel a pixel, interação do protótipo ou aprovação do cliente/equipe sem evidência suficiente.

O campo “situação técnica” indica a correspondência observável entre rota/arquivo em `develop` e o fluxo nomeado no Figma. **“Parcial” não é aprovação visual** e a presença de um arquivo não satisfaz os critérios de implementação. Telas ainda não localizadas no roteador estão descritas como ausentes, não como comprovadamente inexistentes em branches não integradas.

### Evidência disponível e limitações

- `web/src/App.jsx` foi inspecionado para inventariar rotas.
- Os componentes das páginas, os mocks e os serviços foram inspecionados para identificar limites de comportamento.
- Os testes unitários passaram em execução local; eles cobrem apenas os cenários declarados nos arquivos de teste e não substituem comparação com Figma ou aprovação de produto.
- O protótipo contém os 30 frames principais em páginas Campanhas, Doações e Gestão/Dashboard. Os frames examinados não apresentaram evidência de interações configuradas suficiente para afirmar que todos os fluxos clicáveis foram validados.
- A conta Figma conectada ao navegador interno não estava autenticada; a sessão MCP não foi criada. A inspeção restrita ao visual público não permitiu examinar Dev Mode, propriedades de componentes ou especificações restritas. A revisão formal da Issue #21 e o aceite do cliente/equipe continuam pendentes.

## Campanhas — 10 telas

| Código | Frame / Issue | Rota e arquivo em `develop` | Situação técnica observada | Pendente de validação visual |
|---|---|---|---|---|
| CAM-01 | Home pública — #48 | `/` — `pages/Publico.jsx` | Parcial; conteúdo de demonstração | Sim |
| CAM-02 | Listagem e filtros — #49 | `/explorar` — `pages/Publico.jsx` | Parcial; filtros locais | Sim |
| CAM-03 | Detalhe da campanha — #50 | `/campanhas/:id` — `pages/Publico.jsx` | Parcial; dados locais | Sim |
| CAM-04 | Criar: dados básicos — #51 | `/campanhas/nova` — `pages/CriarCampanha.jsx` | Parcial; rascunho local | Sim |
| CAM-05 | Criar: metas e itens — #52 | `/campanhas/nova` — `pages/CriarCampanha.jsx` | Fluxo não separado como no Figma | Sim |
| CAM-06 | Criar: imagens, revisão e publicação — #53 | `/campanhas/nova` — `pages/CriarCampanha.jsx` | Etapa completa não identificada | Sim |
| CAM-07 | Minhas campanhas — #54 | `/campanhas` — `pages/Campanhas.jsx` | Parcial; dados de demonstração | Sim |
| CAM-08 | Editar campanha — #55 | `/campanhas/:id/editar` — `pages/EditarCampanha.jsx` | Parcial; alteração local | Sim |
| CAM-09 | Acompanhamento — #56 | `/campanhas/:id/acompanhamento` — `pages/AcompanhamentoCampanha.jsx` | Parcial; dados de demonstração | Sim |
| CAM-10 | Encerramento/prestação — #57 | `/campanhas/:id/prestacao-de-contas` — `pages/PrestacaoContas.jsx` | Parcial; publicação local | Sim |

Responsáveis das Issues de implementação: #85–88 `Nicolas75460`; #89–91 `pulcinelli123`; #92–94 `nick0lasrm`. A atribuição não determina autoria de código.

## Doações — 10 telas

| Código | Frame / Issue | Rota e arquivo em `develop` | Situação técnica observada | Pendente de validação visual |
|---|---|---|---|---|
| DOA-01 | Escolha do tipo — #58 | `/doar/:id` — `pages/FluxoDoacao.jsx` | Parcial; fluxo agregado | Sim |
| DOA-02 | Identificação — #59 | `/doar/:id` — `pages/FluxoDoacao.jsx` | Parcial; fluxo agregado | Sim |
| DOA-03 | Doação financeira — #60 | `/doar/:id` — `pages/FluxoDoacao.jsx` | Parcial; sem processamento de pagamento | Sim |
| DOA-04 | Pagamento PIX — #61 | `/doar/:id` | Pagamento real não disponível | Sim |
| DOA-05 | Cartão/boleto — #62 | `/doar/:id` | Pagamento real não disponível | Sim |
| DOA-06 | Doação de itens — #63 | `/doar/:id` — `pages/FluxoDoacao.jsx` | Parcial; demonstração | Sim |
| DOA-07 | Agendamento — #64 | `/doar/:id` | Fluxo de agendamento não concluído | Sim |
| DOA-08 | Confirmação — #65 | Rota não encontrada em `App.jsx` | Ausente em `develop`; PR #138 foi fechado sem merge | Sim |
| DOA-09 | Minhas doações — #66 | Rota não encontrada em `App.jsx` | Ausente em `develop`; PR #138 foi fechado sem merge | Sim |
| DOA-10 | Detalhe da doação — #67 | Rota não encontrada em `App.jsx` | Ausente em `develop` | Sim |

Responsáveis das Issues de implementação: #95–97 `Nicolas75460`; #98–101 `pulcinelli123`; #102–104 `nick0lasrm`.

## Gestão e Dashboard — 10 telas

| Código | Frame / Issue | Rota e arquivo em `develop` | Situação técnica observada | Pendente de validação visual |
|---|---|---|---|---|
| GES-01 | Login/recuperação — #68 | `/login` — `pages/Login.jsx` | Login demonstrativo; recuperação não envia e-mail | Sim |
| GES-02 | Cadastro/onboarding — #69 | `/cadastro-entidade` — `pages/CadastroEntidade.jsx` | Parcial; sem persistência/upload real | Sim |
| GES-03 | Dashboard geral — #70 | `/dashboard` — `pages/Dashboard.jsx` | Parcial; dados de demonstração | Sim |
| GES-04 | Dashboard por campanha — #71 | `/dashboard/campanha` — `pages/Dashboard.jsx` | Parcial; dados de demonstração | Sim |
| GES-05 | Doações recebidas — #72 | `/doacoes` — `pages/DoacoesGestao.jsx` | Parcial; dados simulados | Sim |
| GES-06 | Doadores/histórico — #73 | `/doadores` — `pages/Doadores.jsx` | Parcial; dados simulados | Sim |
| GES-07 | Controle de itens — #74 | `/itens` — `pages/Itens.jsx` | Parcial; alterações locais | Sim |
| GES-08 | Relatórios/exportação — #75 | `/relatorios` — `pages/Relatorios.jsx` | Prévia disponível; geração/download não implementados | Sim |
| GES-09 | Usuários/permissões — #76 | `/configuracoes/usuarios` — `pages/Usuarios.jsx` | Edição local; acesso real não controlado | Sim |
| GES-10 | Perfil/configurações — #77 | `/configuracoes` — `pages/CadastroEntidade.jsx` | Parcial; estado local | Sim |

Responsáveis das Issues de implementação: #105 e #108 `JV2008`; #106–107 `Nicolas75460`; #109–110 `pulcinelli123`; #111–114 `nick0lasrm`.

O frame extra “Editar acesso · Paulo Souza” está identificado como estado relacionado à tela de usuários/permissões nas descrições de protótipo. Não o contei como uma 31ª tela nem inventei novo requisito.

## Próximos passos para concluir a validação (#21)

1. Autenticar o responsável no Figma e confirmar os frames/specs aprovados.
2. Comparar visualmente cada tela Web (incluindo larguras e estados exigidos) com o frame correto.
3. Percorrer os fluxos de protótipo quando interações estiverem configuradas; registrar lacunas e pedir decisões quando a regra não estiver especificada.
4. Registrar diferenças por tela, apontando a Issue de implementação e seu responsável.
5. Obter e registrar o aceite formal da equipe/cliente. Não marcar #21 como concluída antes disso.

## Histórico desta revisão

- 10/11/2026: inventário de rotas e páginas em `develop`; estado de demonstração e rotas ausentes registrados. 30 frames reconhecidos nas três páginas do Figma. Acesso não autenticado limitou a validação de design detalhada. Nenhuma tela foi declarada visualmente conforme e nenhum aceite de cliente foi presumido.
