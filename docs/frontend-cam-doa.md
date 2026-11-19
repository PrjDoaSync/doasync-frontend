# Marco CAM/DOA — ajustes incrementais

Inspeção em 19/11/2026 no Figma oficial, modo View via Chrome. Implementação validada no navegador interno após expiração do controle do Chrome. Este registro complementa a base visual anterior; não representa aprovação de fidelidade pixel a pixel.

## Matriz de frames inspecionados

| Tela | Node | Composição observada / decisão incremental |
| --- | --- | --- |
| CAM01 Home | 49:3215 | Introdução compacta com busca, destaque foto/texto, três cards; composição e busca ajustadas |
| CAM02 Listagem | 49:3324 | Busca, filtros e grade; título ajustado, filtros funcionais existentes preservados |
| CAM03 Detalhe | 49:3494 | Capa panorâmica, conteúdo e resumo lateral; proporção 3:1 e acesso direto a itens |
| CAM04 Dados básicos | 49:3603 | Assistente com prévia lateral; prévia agora acompanha o preenchimento |
| CAM05 Metas | 49:3729 | Meta financeira e itens; controles existentes preservados |
| CAM06 Revisão/imagens | 51:2870 | Capa, galeria e revisão; prévia incremental com imagem existente |
| CAM07 Minhas campanhas | 51:3029 | Miniaturas, status, progresso e ações; miniatura adicionada à tabela existente |
| CAM08 Edição | 51:3186 | Dados, metas e imagem; fluxo e validações preservados |
| CAM09 Acompanhamento | 51:3364 | Indicadores e recebimentos; fluxo existente preservado |
| CAM10 Encerramento | 51:3588 | Resumo e fechamento; fluxo existente preservado |
| DOA01 Tipo | 53:2143 | Escolhas financeira/itens e resumo com imagem; miniatura restaurada |
| DOA02 Identificação | 53:2505 | Resumo superior e três cards; composição implementada com seleção acessível |
| DOA03 Financeira | 53:2246 | Valores, PIX principal e frequência; frequência única explícita, recorrência futura desabilitada |
| DOA04 PIX | 53:2639 | Código/instruções e resumo; demonstração existente preservada |
| DOA05 Cartão/boleto | 55:2609 | Alternativas de pagamento; preservadas sem cobrança real |
| DOA06 Itens | 53:2361 | Seleção, quantidade e progresso; checkboxes e progresso adicionados |
| DOA07 Agendamento | 55:2749 | Entrega/retirada e resumo; controles e validações preservados |
| DOA08 Confirmação | 55:2891 | Resultado e próximos passos; fluxo existente preservado |
| DOA09 Histórico | 55:3024 | Filtros, status e ações; tela extra existente preservada |
| DOA10 Detalhe | 55:3207 | Dados da contribuição e comprovante; tela existente preservada |

Frames desktop de 1440 px. Inter, títulos de 28 px/700/125%, botões 14 px/600, fundo #F8FAFC, texto principal #0F172A e gap de 24 px seguem os valores já comprovados na base. As imagens reais do Figma não foram exportadas: permanecem as fotos locais de demonstração. Não foram identificados frames separados de todos os estados vazio/erro/loading; os estados implementados foram preservados.

## Inter

Inter 4.1 variável normal e itálica em `web/public/fonts`, com licença SIL OFL 1.1 completa. Origem oficial: https://rsms.me/inter/ (arquivos `font-files/InterVariable.woff2?v=4.1` e `InterVariable-Italic.woff2?v=4.1`). Nenhuma dependência npm ou serviço externo é necessário para a fonte. `fonts.css` declara pesos 100–900 com `font-display: swap`; HTML antecipa apenas o arquivo normal. O inventário de recursos da home confirmou `http://127.0.0.1:5173/fonts/InterVariable.woff2`.

## Limites e integrações futuras

- Rotas e arquivos extras preservados. Nenhum endpoint, autenticação real ou arquivo de backend foi alterado neste marco.
- PIX, cartão, boleto, itens, agendamento e criação/edição continuam no modo de demonstração da aplicação. Autenticação, recorrência e operações futuras são explicitadas na interface; não há cobrança real.
- A composição completa de filtros do Figma (entidade/status/urgência), galeria/upload com persistência e fotografias oficiais continuam como diferenças conhecidas. Não inventar contratos para esses controles.
- A prévia usa dados locais; os contratos reais `/api/v1` serão ligados no marco API autorizado.
- A inspeção visual da implementação cobriu home, seleção de itens e identificação em desktop de 1280 px. A tentativa de viewport móvel no navegador interno manteve `innerWidth=1280`; portanto, a validação visual móvel não está aprovada. As regras responsivas CAM/DOA estão implementadas, mas ainda precisam de conferência efetiva em dispositivos menores.
- Gestão/GES e API não foram iniciados.

## Qualidade e versionamento

Comandos Windows: `npm run lint`, `npm test -- --configLoader native --pool=threads --maxWorkers=1`, `npm run build -- --configLoader native`. CI Linux permanece com os scripts padrão.

Revisão independente identificou altura fixa anulando a proporção da capa; corrigida com `height: auto`. Textos de identificação foram preservados e a prévia passou a identificar os itens explicitamente. Testes de regressão cobrem a busca da home e o acesso direto à doação de itens, aguardando a rota carregada.

Lint aprovado com um aviso preexistente em `DemoContext.jsx:32`; 263 testes aprovados em 12 arquivos; build aprovado (89 módulos). Revisão final independente aprovada, sem achados obrigatórios pendentes. `git diff --check` aprovado.

Branch `develop`, identidade `LucasIanovski <ianovskilucas@gmail.com>`. A tentativa normal de `git add` falhou: `Unable to create .git/index.lock: Permission denied`. Nenhum commit deste marco foi criado pelo agente.
