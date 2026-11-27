# Estado da execução — checkpoint de 2026-11-27 (America/Sao_Paulo)

> **Estado do código: VALIDADO localmente.** `oxlint --deny-warnings` sem avisos, Vitest com 25 arquivos e 312 testes passando, e `vite build` ok (há só o aviso de tamanho de chunk). A verificação visual no navegador ficou pendente: a extensão do Chrome desconectou durante a sessão.

## 1. Onde está o trabalho

| Item | Valor |
|---|---|
| Branch | `feature/finalizacao-frontend`, partindo de `origin/feature/finalizacao-frontend` (`ba4d57b`) |
| Por que esta base | É a base mais completa: contém a `main` atual (os 3 commits a mais da `main` são merges sem mudança de árvore) e as integrações dos passos 20–25. |
| PR #147 (Gustavo) | Mesma funcionalidade da base. O merge direto geraria 21 conflitos e duplicaria `campanhasService.criar`, o que faria rascunhos serem publicados. Foram portados `hojeISO` com data local e os testes que faltavam, com `Co-authored-by`. |
| PR #146 (fechado) | Portados Minha conta, entidades públicas, doação direta, CSV seguro e quatro correções de acessibilidade. Ficaram de fora: Docker, os documentos `MATRIZ_*` e `AdministracaoContas` (já coberta). |
| Trabalho local não commitado do `develop` | Preservado na branch local `backup/develop-wip-local` (`48a2c40`), que não foi publicada. Não foi portado: a conta simulada e o formato de serviços ficaram superados pela API real. |
| Worktree `..\doasync-finalizacao` | Não foi alterado. Ele mantém 2 arquivos modificados do autor. |

## 2. O que mudou nesta execução

Os commits estão sobre `ba4d57b`, na ordem:

1. Correções da base:
   - "campanha não encontrada" ficava em branco;
   - teste de login desatualizado;
   - parâmetros `dataInicio`/`dataFim` da arrecadação: o filtro por período era ignorado.
2. Porte do #147: `hojeISO` com data local.
3. Porte do #146:
   - acessibilidade;
   - ações de status travadas enquanto a lista recarrega;
   - `GET /usuarios` só para ADMIN.
4. Fluxo de doação completo do protótipo:
   - tipo;
   - valor e forma de pagamento;
   - PIX integrado, sem QR fictício;
   - cartão e boleto, itens e agendamento com a pendência indicada.
5. Entidades públicas, doação direta à entidade (`entidadeId`) e Minha conta (`/usuarios/me`).
6. Criar campanha em 3 etapas, mais os testes do #147 (Authorization, lista vazia, erro de rede, 409, corpo exato do POST).
7. Prestação de contas com a campanha real (antes não abria com UUID).
8. Relatórios integrados, com CSV no navegador.
9. Páginas 404, 403 e indisponível, `ErrorBoundary`, recuperação de senha com pendência e 403 no `ErrorMessage`.
10. Telas demo de itens e equipe com a pendência; textos de ajuda e privacidade atualizados; link Minha conta na gestão; remoção de `pages/Doacoes.jsx` e `mocks/index.js`, que não eram usados.

## 3. Padrão de integração pendente

`web/src/services/indisponivel.js` (`RECURSOS_PENDENTES`) lista os recursos que ainda não têm rota no backend. Funciona assim:

- os serviços expõem funções nomeadas que rejeitam com `RecursoIndisponivelError`: `doacoesService.pagarComCartao`, `gerarBoleto` e `registrarItens`; `campanhasService.publicarPrestacaoContas`; `authService.solicitarRecuperacaoSenha`;
- as telas mostram `<AvisoIndisponivel recurso="…" />`;
- para integrar um recurso, basta trocar a implementação no serviço e marcar o recurso como disponível. Nenhuma tela registra ou cobra algo que a API não registrou.

## 4. Pendências reais do backend

| Pendência | Efeito no frontend |
|---|---|
| `versao` em `GET /campanhas/{id}` (PR #71 do backend, aberto) | A edição fica bloqueada com aviso enquanto o campo não vier. |
| Provedor de pagamento (PIX com QR, cartão, boleto) | O PIX registra a doação sem cobrança; cartão e boleto não enviam nada. |
| Itens, estoque e agendamento | Doação de itens, agendamento e controle de itens dependem dessas rotas. |
| Upload de imagens | A capa é informada por URL. |
| Prestação de contas | O relatório fica salvo só na sessão. |
| Recuperação de senha (e-mail) | Só a troca de senha em Minha conta funciona. |
| Equipe e permissões por entidade | A tela de equipe é demonstração. |
| Exportação no servidor (PDF) | O CSV é gerado no navegador. |
| Divergências entre o contrato do `doa-sync` e o código | A arrecadação usa `dataInicio`/`dataFim`, e o PATCH de campanha exige todos os campos mais `versao`. O frontend segue o código. |

## 5. Validação

| Verificação | Resultado |
|---|---|
| `npx oxlint --deny-warnings` | Sem avisos |
| `npx vitest run` | 25 arquivos, 312 testes passando |
| `npm run build` | Ok (aviso de chunk > 500 kB) |
| Verificação visual (Chrome) | Pendente: a extensão desconectou |
| Contra o backend real | Fica para a próxima etapa (Docker) |

**Observação de ambiente no Windows:** o Vitest falha com "failed to find the runner" quando o diretório atual tem a letra da unidade em minúscula (`c:\`). Rode a partir de `C:\…\web`.

## 6. Próxima atividade

1. Revisar e mesclar o PR para a `develop`.
2. Na etapa Docker: subir o backend com o PR #71, rodar os fluxos contra a API real e fazer a verificação visual nas larguras de 1440 e 390 px.
3. Integrar as pendências da seção 4 conforme o backend publicar as rotas.
