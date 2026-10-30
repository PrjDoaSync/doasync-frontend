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

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Home pública e campanhas em destaque |
| `/explorar` | Campanhas com busca, filtros, ordenação e paginação |
| `/campanhas/:id` | Detalhe da campanha e abas de informações |
| `/doar/:id` | Tipo, contribuição financeira e identificação; limite nas próximas telas de pagamento |
| `/login` | Acesso/recuperação com indisponibilidade de integração e entrada na demonstração |
| `/cadastro-entidade` | Dados, seleção local de documentos e onboarding |
| `/dashboard` | Indicadores, período e evolução financeira |
| `/dashboard/campanha?campanha=1` | Análise financeira, evolução de itens e metas por item |
| `/campanhas` | Gestão das campanhas da entidade |
| `/campanhas/nova` | Dados básicos e rascunho de campanha |
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

O fluxo financeiro não gera PIX/boleto nem recebe dados de cartão. Recuperação
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

Referência visual informada:
[Figma Doasync](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync).
As imagens locais são ilustrativas, com origens em
[public/images/README.md](public/images/README.md). A comparação visual completa
e o aceite interno/QA ainda precisam ser registrados antes de concluir as issues.
