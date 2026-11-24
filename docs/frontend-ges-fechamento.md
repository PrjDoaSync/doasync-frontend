# Gestão e fechamento do frontend demonstrativo

Atualizado em 23/11/2026. Branch `develop`, base limpa nos commits `3a666e4` e `1798a6a`. Escopo exclusivo do frontend; backend, services e CI/CD não foram alterados neste marco.

## Referências visuais

Arquivo oficial: https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync . Inspeção em modo View no Chrome, sem conector Figma.

| Frame GES | Node | Inspeção nesta rodada |
| --- | --- | --- |
| Login e recuperação | 65:3954 | Identificado na árvore; conferência individual interrompida |
| Cadastro/onboarding | 65:4035 | Identificado na árvore; conferência individual interrompida |
| Dashboard geral | 65:4199 | Layout visual conferido |
| Dashboard analítico | 65:4357 | Layout visual conferido |
| Doações recebidas | 65:4559 | Layout visual conferido |
| Doadores e histórico | 69:4727 | Layout visual conferido |
| Controle de itens | 69:4901 | Layout visual conferido |
| Relatórios/exportação | 69:5096 | Layout visual conferido |
| Usuários/permissões | 69:5282 | Layout visual conferido |
| Perfil/configurações | 69:5500 | Layout visual conferido |

Composição observada: frames desktop de 1440 px, sidebar e topo, cards brancos sobre fundo claro, indicadores com ícones, tabelas com filtros e estados textuais, painel de perfil do doador, configurações de recebimento e notificações. Mantida a base Inter/títulos/espaçamentos do marco anterior. Ajustes incrementais preservam controles e rotas já funcionais.

## Implementação

- GES: ícones dos indicadores, resumo da campanha analítica com miniatura, progresso na atenção do dashboard, resumo de relacionamento, avatares decorativos e indicadores de estoque em três colunas no desktop.
- Perfil: recebimento financeiro e de itens com campos fictícios, preferências de notificações locais, salvar/descartar. Nenhuma transferência, envio ou verificação real.
- Navegação: menu administrativo recolhível no móvel; menu do perfil com foco, setas, Home/End e Escape; notificações com diálogo demonstrativo funcional.
- Acessibilidade: diálogos nomeados, região de tabela focável com nome, vazio anunciado, painel de aba focável e contraste secundário reforçado. O token secundário foi ajustado para `#5b6b80`; não se afirma correspondência desse ajuste ao Figma.
- Rodapé: páginas de ajuda, privacidade e termos descrevem honestamente a demonstração, com rotas funcionais. O histórico ficou acessível pelo menu público.
- DOA: novas contribuições entram no histórico da sessão; confirmação de itens na gestão atualiza histórico e detalhe. Pendência não é apresentada como dinheiro recebido. Nenhuma promessa de e-mail, documento ou link é feita.
- CAM: filtros locais por entidade/status/prazo, sem exibir rascunhos; capa e galeria próprias na criação/edição, com prévia no detalhe. JPG/PNG/WebP, até 2 MB por arquivo e três fotos de galeria. Falhas de leitura/decodificação mostram erro e preservam dados anteriores. Arquivos ficam somente na sessão.
- Lint: contexto, provider e hook separados, sem silenciar a regra de Fast Refresh. Importações e testes foram migrados.
- Responsividade: regras finais para evitar que CSS posterior desfaça colunas móveis; correções de histórico, confirmação, tabelas, cabeçalhos, formulários, etapas, resumo, galeria e linha do tempo.

Os estados de carregamento/erro/tentativa novamente continuam em `RequestState`; listas e filtros têm estados vazios. Formulários preservam validações existentes e avisos de sucesso. Documentos oficiais, cobranças e operações externas indisponíveis continuam explicitamente demonstrativos ou desabilitados; a equipe conectará os serviços depois.

Para experimentar a aplicação sem backend, entre em `web/` e execute `npm ci` (na primeira instalação) e `npm run dev -- --configLoader native` neste Windows. Abra o endereço mostrado pelo Vite. Os dados são reiniciados ao recarregar a página. A página Ajuda descreve os percursos públicos e administrativos disponíveis.

## Validação e limites reais

Reviewer aprovou o código por inspeção estática após correções de sincronização, linguagem de confirmação e imagens corrompidas. Testes de regressão abrangem navegação institucional, teclado, diálogo, preferências, histórico completo e confirmação de itens, filtros públicos e validação de imagens.

Comandos executados em `web/`:

```powershell
npm run lint
npm test -- --configLoader native --pool=threads --maxWorkers=1
npm run build -- --configLoader native
```

Resultado final: lint aprovado sem erros e sem avisos; 271 testes aprovados em 13 arquivos; build de produção aprovado (95 módulos, JavaScript 433,72 kB / gzip 126,48 kB, CSS 55,99 kB / gzip 11,39 kB). `git diff --check` aprovado. Reviewer aprovou a versão final do código, incluindo a validação de imagens corrompidas.

**O fechamento visual total não está aprovado.** Após a inspeção dos oito frames GES, Chrome perdeu conexão; o fallback para navegador interno e uma tentativa posterior falharam com `Computer Use native pipe is unavailable: connection timed out`. Isso impediu inspecionar o resultado implementado em desktop e em 320/768/1024/1440 px, completar a conferência individual de login/onboarding e extrair as fotos oficiais. Não foram simulados screenshots, medições ou aprovação de mobile.

As fotos ilustrativas locais continuam com origens em `web/public/images/README.md`. Capa/galeria locais permitem testar o fluxo de imagens, mas não substituem a conferência dos assets oficiais. Para concluir este marco, restaurar o navegador e executar a matriz visual de todas as rotas e estados antes de avançar para services/CI/CD.

## Matriz de fechamento pendente no navegador

1. GES: `/dashboard`, `/dashboard/campanha`, `/doacoes`, `/doadores`, `/itens`, `/relatorios`, `/configuracoes`, `/configuracoes/usuarios`, `/entidades`, `/cadastro-entidade`, `/login`.
2. CAM: `/`, `/explorar`, `/campanhas`, `/campanhas/nova`, detalhe/edição/acompanhamento/prestação de contas de uma campanha.
3. DOA: financeira (PIX/cartão/boleto), itens, identificação, agendamento, confirmação, `/minhas-doacoes` e detalhe. Validar pendentes/recebidas e anônimo sem e-mail.
4. Extras: `/ajuda`, `/privacidade`, `/termos`, rota inexistente e registros inexistentes.
5. Em 320/768/1024/1440 px: sem overflow da página; tabelas rolam dentro da região com teclado; menu abre/fecha; foco e diálogo funcionam; loading/erro/vazio/sucesso são perceptíveis. Conferir assets reais com os frames oficiais.

Não foram criados commits: o usuário solicitou os comandos para registrar o marco em `develop`. Não avançar para serviços/API ou CI/CD como se a validação visual pendente estivesse concluída.
