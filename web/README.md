# DoaSync — Frontend Web

React + Vite para a vitrine de campanhas, fluxo de doação e área de gestão da
entidade. A aplicação utiliza dados fictícios, indicados na interface, sem
autenticação ou processamento financeiro real.

## Executar

Pré-requisito: Node.js 24 (ou versão compatível com Vite 8 e Vitest 5).

```bash
cd web
npm ci
npm run dev
```

O Vite informa a URL local. A vitrine está em `/` e a área de gestão em
`/dashboard`. Não é necessário configurar backend para experimentar a amostra.
As alterações permanecem apenas na sessão do React; recarregar restaura os dados.

```bash
npm test            # testes de cálculos e interações
npm run test:watch  # modo de desenvolvimento dos testes
npm run build      # bundle de produção em dist/
npm run preview    # servir o bundle gerado
```

O comando `npm run lint` existente continua disponível para revisão manual.

### Pipeline de Testes (GitHub Actions)

O repositório conta com o workflow [`.github/workflows/frontend-qa.yml`](../.github/workflows/frontend-qa.yml), que executa automaticamente `npm ci`, `npm run lint`, `npm test` (Vitest + React Testing Library) e `npm run build` em eventos de `push` e `pull_request` relacionados ao diretório `web/`. Detalhes sobre o estado atual e próximos passos (incluindo alinhamento com DevOps e expansão para E2E Selenium) estão documentados em [`docs/frontend-pipeline-qa.md`](../docs/frontend-pipeline-qa.md).

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Home pública e campanhas em destaque |
| `/explorar` | Campanhas com busca, filtros, ordenação e paginação |
| `/campanhas/:id` | Detalhe da campanha e abas de informações |
| `/doar/:id` | Fluxo de doação em 4 etapas: tipo, contribuição (valor ou itens), identificação e pagamento (PIX, cartão ou boleto) ou agendamento de entrega/retirada |
| `/login` | Acesso/recuperação com indisponibilidade de integração e entrada na demonstração |
| `/cadastro-entidade` | Dados, seleção local de documentos e onboarding |
| `/dashboard` | Indicadores, período e evolução financeira |
| `/dashboard/campanha?campanha=1` | Análise financeira, evolução de itens e metas por item |
| `/campanhas` | Gestão das campanhas da entidade |
| `/campanhas/nova` | Assistente em 3 etapas: dados básicos, metas e itens necessários, revisão (imagem de capa) e publicação; permite salvar rascunho em qualquer etapa |
| `/doacoes` | Doações recebidas, filtros e detalhes |
| `/doadores` | Doadores e histórico de contribuições |
| `/itens` | Saldo e registro local de entradas/saídas |
| `/relatorios` | Prévia filtrada e interface de exportação, sem gerar arquivos |
| `/configuracoes` | Perfil e configurações da entidade |
| `/configuracoes/usuarios` | Equipe e edição local de acesso |
| `/entidades` | Diretório de entidades, preservando a tela original |

## Organização

```text
src/components/        campos, botões, etapas, tabelas, gráficos e estados
src/components/layout/ layout público, administrativo e aviso de demonstração
src/context/           dados e alterações da sessão de demonstração
src/hooks/             useRequest com loading, erros, retry e cancelamento
src/mocks/             amostra e fonte assíncrona isolada
src/pages/             telas e fluxos
src/services/          cliente HTTP Axios e services preexistentes
src/utils/             filtros, indicadores, validações e estoque
src/test/              testes Vitest + React Testing Library
```

## Integração pendente

`DemoProvider` carrega a amostra por `carregarDemo` e concentra as alterações em
memória. Para integrar, confirmar os contratos do backend, criar/adaptar services
de consulta e mutação e substituir essa fronteira. Trocar apenas um import de
listagem não implementa persistência, autorização, upload ou pagamento.

Os endpoints dos services Axios e `VITE_API_URL` de `.env.example` são hipóteses
preexistentes. Eles não são utilizados pelo mock central. Nenhum endpoint novo
foi presumido como disponível.

O fluxo financeiro só demonstra PIX, boleto e cartão: o código PIX e a linha
digitável são fictícios e inválidos, os dados do cartão são apenas validados no
formulário (nunca enviados nem guardados) e nenhum valor é cobrado. A doação
concluída é registrada como Pendente na sessão e aparece em Doações recebidas
para a entidade confirmar. O agendamento de itens também é só de demonstração:
a entidade não é avisada. O envio de imagens da campanha não é integrado; o
assistente oferece imagens de exemplo. Recuperação
de senha não envia e-mail. Documentos selecionados não são enviados. Alteração
de papéis não concede acessos reais. Geração e download de PDF/CSV ficam como
dependências externas, sem gerador local de arquivos.

## Issues e validação

O escopo da alteração se limita às issues atribuídas a Nicolas75460: #6, #12,
#27, #29, #85–#88, #95–#97, #106 e #107. As dez telas de gestão pertencem à #6.
A tela preexistente de Entidades foi preservada sem alterações de implementação.
Não se assume a implementação de outras issues apenas porque são citadas como
dependências ou aparecem em uma issue de agrupamento.

Validação local: 48 testes aprovados e build de produção gerado. As integrações
externas e a comparação visual completa continuam pendentes; isso não representa
o encerramento automático das issues no GitHub.

### Telas de doação e criação de campanha (pulcinelli123)

Escopo: #98 (PIX), #99 (cartão e boleto), #100 (doação de itens), #101
(agendamento), #89 (metas e itens) e #90 (imagens, revisão e publicação). Regras
em `src/utils/doacao.js` e `src/utils/criarCampanha.js`; telas em
`src/components/doacao/` e `src/pages/CriarCampanha.jsx`; testes em
`src/test/doacao.test.jsx` e `src/test/criarCampanha.test.jsx`. As telas de
Doações recebidas (#109), Doadores e histórico (#110) e Minhas campanhas (#91)
já existiam e não foram alteradas. Validação local: 87 testes aprovados e build
gerado; a comparação visual com o Figma continua pendente.

Referência visual informada:
[Figma Doasync](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync).
As imagens locais são ilustrativas, com origens em
[public/images/README.md](public/images/README.md). A comparação visual completa
e o aceite interno/QA ainda precisam ser registrados antes de concluir as issues.
