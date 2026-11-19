# Base visual — marcos 1 e 2

Atualização CAM/DOA: ver [frontend-cam-doa.md](frontend-cam-doa.md). A limitação de carregamento da Inter descrita abaixo foi resolvida com fontes locais e licença; a matriz CAM/DOA foi inspecionada. Os demais registros abaixo representam o estado histórico da base.

Referência: [Figma oficial](https://www.figma.com/design/3eBaQzgxDIRMbhxY0K2DWa/Doasync), inspecionado em modo View em 19/11/2026.

## Tokens confirmados

| Elemento consultado | Valor | Origem |
| --- | --- | --- |
| Fundo do frame | `#F8FAFC` | Home `49:3215` e perfil `69:5500` |
| Cor do título | `#0F172A` | Título do perfil da entidade |
| Título do perfil | Inter, 28 px, peso 700, entrelinha 125% | Texto do frame `69:5500` |
| Rótulo Salvar alterações | Inter, 14 px, peso 600, entrelinha 100% | Texto da ação no perfil |
| Conteúdo administrativo | Padding 40 px, gap 24 px | Auto layout Conteúdo do perfil |
| Largura dos frames consultados | 1440 px | Home e perfil |

`web/src/styles/tokens.css` é a fonte das variáveis compartilhadas. O fundo, a cor dos títulos, o tamanho/entrelinha dos títulos, os rótulos de botão e o espaçamento administrativo usam os valores confirmados. As regras existentes para telas menores continuam prevalecendo. A largura de 1440 px é uma referência de inspeção, não uma largura fixa imposta à aplicação.

As demais cores semânticas foram mantidas com os valores efetivos anteriores. Elas ainda precisam ser conferidas em seus componentes no Figma. Não se deve interpretar esta tabela como um inventário completo de tokens, componentes ou estados.

## Limites deste marco

- A família Inter está declarada, mas o repositório não contém o arquivo da fonte. A aparência ainda pode depender de fontes instaladas e da substituição pelo navegador. A tentativa de consultar Fontsource foi bloqueada pelo proxy local; nenhuma dependência foi adicionada.
- O Chrome deixou de responder ao controle da aba neste marco. A base usa os valores comprovados na inspeção visual anterior; a validação da implementação foi feita no navegador interno.
- A matriz individual dos 30 frames continua pendente. Antes de alterar cada grupo CAM/DOA/GES, concluir sua inspeção e registrar layout, componentes, estados e diferenças.
- A conferência do dashboard em 320 px revelou excesso horizontal na tabela de campanhas e navegação lateral pouco compacta. Registrar e corrigir no marco GES; não considerar responsividade completa aprovada.
- A medição no navegador confirmou título de 28 px / 35 px, padding de 40 px, gap de 24 px e fundo `rgb(248, 250, 252)` em desktop. Em 768/1024 px o padding cai para 24 px; em 320 px, para 20 px / 16 px e o título para 22 px.

## Verificação

Usar os scripts padrão no Linux/CI. Neste ambiente Windows, a restrição de subprocessos exige:

```powershell
npm run lint
npm test -- --configLoader native --pool=threads --maxWorkers=1
npm run build -- --configLoader native
```

O workflow permanece com `npm test` e `npm run build`; os ajustes de execução são locais. Typecheck e formatação serão tratados no marco CI/CD aprovado.

Resultado em 19/11/2026: lint aprovado com dois avisos preexistentes (`DemoContext.jsx:32` e `Publico.jsx:107`), 261 testes aprovados em 12 arquivos, build aprovado com 86 módulos e revisão independente sem itens obrigatórios pendentes no diff.
