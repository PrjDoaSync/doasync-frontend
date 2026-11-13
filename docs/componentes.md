# Catálogo de Componentes — Frontend Web DoaSync

> **Repositório:** [PrjDoaSync/doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend)  
> **Diretório de origem:** `web/src/components/`  
> **Documentação de referência:** [DOC-WEB-01 / docs/frontend-web.md](frontend-web.md)

Este documento reúne a especificação técnica, finalidade, interfaces de propriedades (props), diretrizes de acessibilidade e exemplos de uso em JSX de todos os componentes reutilizáveis presentes na aplicação Web.

---

## Índice

- [1. Componentes Base e Utilitários de Interface](#1-componentes-base-e-utilitários-de-interface)
  - [Ui.jsx (Biblioteca de Primitivos)](#uijsx)
  - [CampanhaCard.jsx (e Progresso)](#campanhacardjsx)
  - [DataTable.jsx](#datatablejsx)
  - [ErrorMessage.jsx](#errormessagejsx)
  - [Filtros.jsx](#filtrosjsx)
  - [Grafico.jsx](#graficojsx)
  - [KpiCard.jsx](#kpicardjsx)
  - [Loading.jsx](#loadingjsx)
  - [PageHeader.jsx](#pageheaderjsx)
  - [RequestState.jsx](#requeststatejsx)
  - [StatusBadge.jsx](#statusbadgejsx)
- [2. Componentes de Layout (`components/layout/`)](#2-componentes-de-layout)
  - [PublicLayout.jsx](#publiclayoutjsx)
  - [PublicHeader.jsx](#publicheaderjsx)
  - [PublicFooter.jsx](#publicfooterjsx)
  - [AdminLayout.jsx / Layout.jsx](#adminlayoutjsx)
  - [AdminHeader.jsx](#adminheaderjsx)
  - [AdminSidebar.jsx](#adminsidebarjsx)
  - [ContentArea.jsx](#contentareajsx)
  - [AppLayouts.jsx (DemoBanner e Toast)](#applayoutsjsx)

---

## 1. Componentes Base e Utilitários de Interface

### `Ui.jsx`

* **Caminho:** `web/src/components/Ui.jsx`
* **Finalidade:** Biblioteca central de elementos primitivos compartilhados por toda a aplicação (ícones vetoriais, botões, campos de entrada, avisos, seções, modais e etapas).

#### Subcomponentes exportados:
1. `Icon`: renderiza ícones vetoriais SVG (`dashboard`, `campanhas`, `doacoes`, `doadores`, `seta`, `voltar`, `busca`, `mail`, `olho`, `olho-fechado`, `ajuda`, `info`, `check-circle`, etc.).
2. `Marca`: logotipo oficial DoaSync com ícone e texto vinculados à rota inicial (`/`).
3. `Botao`: botão padronizado com variantes primária/secundária ou elemento `Link` navegável do React Router.
4. `Campo`: wrapper para rótulo (`label`), controle de formulário e mensagem de ajuda (`aria-describedby`).
5. `Aviso`: alerta de feedback informativo ou de erro (`role="alert"` / `role="status"`).
6. `Vazio`: estado vazio com ilustração de busca, título e texto de apoio.
7. `Secao`: cartão de agrupamento de conteúdo com cabeçalho e ação opcional.
8. `Modal`: diálogo acessível nativo (`<dialog>`) com foco gerenciado e fechamento por tecla `Escape`.
9. `Etapas`: indicador visual e semântico de progresso (`<ol>` com `aria-current="step"`).

#### Exemplo de uso:
```jsx
import { Botao, Campo, Aviso, Icon, Secao } from '../components/Ui'

function ExemploFormulario() {
  return (
    <Secao titulo="Dados de Contato" descricao="Informe os dados da entidade">
      <Campo rotulo="E-mail" ajuda="Utilizado para notificações" required>
        <input type="email" placeholder="contato@entidade.org.br" />
      </Campo>

      <Aviso erro={false}>Seus dados estão protegidos.</Aviso>

      <Botao type="submit">
        <Icon nome="check" size={16} /> Salvar alterações
      </Botao>
    </Secao>
  )
}
```

---

### `CampanhaCard.jsx`

* **Caminho:** `web/src/components/CampanhaCard.jsx`
* **Finalidade:** Cartão de exibição resumida de campanhas na vitrine pública e listagens, incluindo foto, categoria, entidade promotora, meta financeira e barra de progresso.

#### Propriedades (Props):
| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `campanha` | `object` | Sim | Objeto contendo `id`, `nome`, `categoria`, `entidade`, `cidade`, `imagem`, `arrecadado` e `meta`. |

#### Subcomponente: `Progresso`
* `atual` (`number`): valor arrecadado até o momento.
* `meta` (`number`): valor total da meta.
* Acessibilidade: atributos `role="progressbar"`, `aria-valuenow`, `aria-valuemin` e `aria-valuemax`.

#### Exemplo de uso:
```jsx
import CampanhaCard from '../components/CampanhaCard'

function ListaCampanhas({ campanhas }) {
  return (
    <div className="cards-grid">
      {campanhas.map((item) => (
        <CampanhaCard key={item.id} campanha={item} />
      ))}
    </div>
  )
}
```

---

### `DataTable.jsx`

* **Caminho:** `web/src/components/DataTable.jsx`
* **Finalidade:** Tabela dinâmica genérica com suporte a cabeçalhos configuráveis, renderizadores customizados por célula e estado vazio.

#### Propriedades (Props):
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `colunas` | `Array<{ chave: string, titulo: string, render?: (linha) => ReactNode }>` | — | Definição das colunas da tabela. |
| `linhas` | `Array<object>` | — | Registros a serem exibidos (cada linha deve possuir um `id`). |
| `vazio` | `string` | `'Nenhum registro encontrado.'` | Mensagem textual caso `linhas` seja vazio. |

#### Exemplo de uso:
```jsx
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const colunas = [
  { chave: 'nome', titulo: 'Nome da Campanha' },
  { chave: 'categoria', titulo: 'Categoria' },
  { chave: 'status', titulo: 'Situação', render: (l) => <StatusBadge valor={l.status} /> },
]

function TabelaCampanhas({ dados }) {
  return <DataTable colunas={colunas} linhas={dados} />
}
```

---

### `ErrorMessage.jsx`

* **Caminho:** `web/src/components/ErrorMessage.jsx`
* **Finalidade:** Bloco de erro amigável com suporte a reexecução (`retry`), exibindo mensagem de falha em conformidade com acessibilidade (`role="alert"`).

#### Propriedades (Props):
| Prop | Tipo | Descrição |
|---|---|---|
| `error` | `object \| null` | Objeto de erro retornado pela requisição ou camada de serviço contendo `message`. |
| `onRetry` | `() => void` | Função opcional chamada ao acionar o botão "Tentar novamente". |

#### Exemplo de uso:
```jsx
import ErrorMessage from '../components/ErrorMessage'

function ExemploErro({ erro, recarregar }) {
  if (!erro) return null
  return <ErrorMessage error={erro} onRetry={recarregar} />
}
```

---

### `Filtros.jsx`

* **Caminho:** `web/src/components/Filtros.jsx`
* **Finalidade:** Barra de pesquisa textual acompanhada de múltiplos seletores suspensos (`<select>`) para filtragem de listas e tabelas.

#### Propriedades (Props):
| Prop | Tipo | Descrição |
|---|---|---|
| `busca` | `string` | Valor textual atual da busca. |
| `onBusca` | `(valor: string) => void` | Callback invocado a cada alteração no input de busca. |
| `placeholder` | `string` | Rótulo/placeholder do campo de busca. |
| `selects` | `Array<{ rotulo: string, valor: string, onChange: Function, opcoes: string[] }>` | Lista de filtros suspensos a renderizar. |

#### Exemplo de uso:
```jsx
import { useState } from 'react'
import Filtros from '../components/Filtros'

function BarraFiltragem() {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')

  return (
    <Filtros
      busca={busca}
      onBusca={setBusca}
      placeholder="Buscar por doador ou campanha..."
      selects={[
        {
          rotulo: 'Categoria',
          valor: categoria,
          onChange: setCategoria,
          opcoes: ['Alimentação', 'Saúde', 'Educação'],
        },
      ]}
    />
  )
}
```

---

### `Grafico.jsx`

* **Caminho:** `web/src/components/Grafico.jsx`
* **Finalidade:** Gráfico vetorial SVG responsivo para série temporal de arrecadação financeira ou itens recebidos. Possui tabela alternativa expansível (`<details><summary>`) para total acessibilidade de leitores de tela.

#### Propriedades (Props):
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `doacoes` | `Array<object>` | — | Lista de doações para cálculo das séries acumuladas. |
| `id` | `string` | `'arrecadacao'` | Identificador único para gradientes SVG. |
| `medida` | `'financeira' \| 'itens'` | `'financeira'` | Tipo de métrica acumulada a projetar. |

#### Exemplo de uso:
```jsx
import Grafico from '../components/Grafico'

function DashboardGraficos({ doacoes }) {
  return (
    <div className="cartao">
      <h2>Evolução Financeira</h2>
      <Grafico doacoes={doacoes} medida="financeira" />
    </div>
  )
}
```

---

### `KpiCard.jsx`

* **Caminho:** `web/src/components/KpiCard.jsx`
* **Finalidade:** Cartão compacto para indicadores-chave de desempenho (KPIs), métricas agregadas e comparativos percentuais.

#### Propriedades (Props):
| Prop | Tipo | Descrição |
|---|---|---|
| `rotulo` | `string` | Título ou descrição curta da métrica (ex.: "Total arrecadado"). |
| `valor` | `string \| number` | Valor de destaque formatado (ex.: "R$ 45.200,00"). |
| `detalhe` | `string` (opcional) | Informação contextual secundária (ex.: "+12% em relação ao mês anterior"). |

#### Exemplo de uso:
```jsx
import KpiCard from '../components/KpiCard'

function ResumoKpis() {
  return (
    <div className="kpis">
      <KpiCard rotulo="Total arrecadado" valor="R$ 18.450,00" detalhe="Meta de R$ 20.000,00" />
      <KpiCard rotulo="Doadores únicos" valor="142" detalhe="No período selecionado" />
    </div>
  )
}
```

---

### `Loading.jsx`

* **Caminho:** `web/src/components/Loading.jsx`
* **Finalidade:** Feedback visual de carregamento de dados com acessibilidade (`role="status"`, `aria-live="polite"`).

#### Propriedades (Props):
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `message` | `string` | `'Carregando...'` | Mensagem a ser anunciada e visualizada. |

#### Exemplo de uso:
```jsx
import Loading from '../components/Loading'

function EstadoCarregando() {
  return <Loading message="Buscando informações da campanha..." />
}
```

---

### `PageHeader.jsx`

* **Caminho:** `web/src/components/PageHeader.jsx`
* **Finalidade:** Cabeçalho padrão de páginas administrativas com título `<h1>`, subtítulo e área para botões de ação primária ou filtros.

#### Propriedades (Props):
| Prop | Tipo | Descrição |
|---|---|---|
| `titulo` | `string` | Título principal da página (`<h1>`). |
| `descricao` | `string` (opcional) | Descrição secundária informativa. |
| `children` | `ReactNode` (opcional) | Ações à direita (ex.: botão de criação, exportação). |

#### Exemplo de uso:
```jsx
import PageHeader from '../components/PageHeader'
import { Botao, Icon } from '../components/Ui'

function CabecalhoCampanhas() {
  return (
    <PageHeader
      titulo="Gestão de Campanhas"
      descricao="Acompanhe o andamento das suas campanhas ativas"
    >
      <Botao para="/campanhas/nova">
        <Icon nome="mais" size={16} /> Nova campanha
      </Botao>
    </PageHeader>
  )
}
```

---

### `RequestState.jsx`

* **Caminho:** `web/src/components/RequestState.jsx`
* **Finalidade:** Orquestrador de estados assíncronos (`loading`, `error`, `data`) integrado ao hook `useRequest`. Renderiza `Loading`, `ErrorMessage` ou o conteúdo via render-prop function.

#### Propriedades (Props):
| Prop | Tipo | Descrição |
|---|---|---|
| `data` | `any` | Dados retornados pela requisição. |
| `loading` | `boolean` | Indicador de requisição em andamento. |
| `error` | `object \| null` | Objeto de erro. |
| `reload` | `() => void` | Função de repetição da chamada. |
| `children` | `(data: any) => ReactNode` | Função que recebe os dados quando disponíveis. |

#### Exemplo de uso:
```jsx
import RequestState from '../components/RequestState'
import { useRequest } from '../hooks/useRequest'
import { obterDoacoes } from '../services/doacoesService'

function RelatorioDoacoes() {
  const request = useRequest(obterDoacoes)

  return (
    <RequestState {...request}>
      {(doacoes) => <TabelaRegistros dados={doacoes} />}
    </RequestState>
  )
}
```

---

### `StatusBadge.jsx`

* **Caminho:** `web/src/components/StatusBadge.jsx`
* **Finalidade:** Etiqueta (badge) visual para sinalização de situações cadastrais ou operacionais com mapeamento semântico de cores (`sucesso`, `alerta`, `perigo`, `neutro`).

#### Mapeamento de tons:
* **Sucesso (Verde):** `Ativa`, `Confirmada`, `Confirmado`, `Aceito`, `Ativo`.
* **Alerta (Âmbar):** `Pendente`, `Aguardando`, `Em análise`, `Convite simulado`.
* **Perigo (Vermelho):** `Cancelada`, `Cancelado`.
* **Neutro (Cinza):** `Inativo` ou valores desconhecidos.

#### Exemplo de uso:
```jsx
import StatusBadge from '../components/StatusBadge'

function LinhaStatus({ campanha }) {
  return (
    <div>
      <span>{campanha.nome}</span>
      <StatusBadge valor={campanha.status} />
    </div>
  )
}
```

---

## 2. Componentes de Layout (`components/layout/`)

### `PublicLayout.jsx`

* **Caminho:** `web/src/components/layout/PublicLayout.jsx`
* **Finalidade:** Estrutura mestre para todas as rotas públicas (Home, Explorar, Detalhe da Campanha, Fluxo de Doação e Login). Inclui link de salto de acessibilidade (`#conteudo`), cabeçalho público, banner de demonstração (ocultado em `/login`), área de saída (`<Outlet />`), rodapé e container de `Toast`.

#### Exemplo de uso:
```jsx
// Utilizado como Route element no App.jsx:
<Route element={<PublicLayout />}>
  <Route index element={<Home />} />
  <Route path="login" element={<Login />} />
</Route>
```

---

### `PublicHeader.jsx`

* **Caminho:** `web/src/components/layout/PublicHeader.jsx`
* **Finalidade:** Barra de navegação superior das telas públicas. Possui suporte à rota `/login` (GES-01), onde exibe a variante com a marca à esquerda e o link "Precisa de ajuda?" à direita. Nas demais rotas, renderiza a navegação completa da vitrine ("Início", "Campanhas", "Entidades", "Área da entidade" e botão "Entrar").

#### Comportamento:
* Detecta a rota ativa via `useLocation`.
* Em `/login`: renderiza o botão "Precisa de ajuda?" direcionando para `/ajuda`.
* Nas demais rotas: destaca ativamente o item correspondente à navegação pública.

---

### `PublicFooter.jsx`

* **Caminho:** `web/src/components/layout/PublicFooter.jsx`
* **Finalidade:** Rodapé institucional público padronizado conforme especificações do Figma. Exibe a assinatura de marca `DoaSync · Conectando pessoas a causas` à esquerda e os links institucionais `Ajuda`, `Privacidade` e `Termos de uso` à direita.

---

### `AdminLayout.jsx` / `Layout.jsx`

* **Caminhos:** `web/src/components/layout/AdminLayout.jsx` e `web/src/components/layout/Layout.jsx`
* **Finalidade:** Layout mestre da área de gestão da entidade. Agrupa a barra lateral administrativa (`AdminSidebar`), o topo administrativo (`AdminHeader`), o aviso de demonstração (`DemoBanner`), a área de conteúdo (`ContentArea`) e o rodapé de gestão.

---

### `AdminHeader.jsx`

* **Caminho:** `web/src/components/layout/AdminHeader.jsx`
* **Finalidade:** Barra superior da área administrativa. Calcula dinamicamente o título da página baseado no caminho atual (`useLocation`) e gerencia o menu suspenso do perfil do usuário autenticado com suporte completo a teclado (`Escape`, clique fora e atributos ARIA `aria-expanded`, `aria-haspopup`).

---

### `AdminSidebar.jsx`

* **Caminho:** `web/src/components/layout/AdminSidebar.jsx`
* **Finalidade:** Menu lateral fixo da área de gestão. Apresenta o identificador da entidade ativa e links de navegação para: `Dashboard`, `Campanhas`, `Doações`, `Doadores`, `Itens doados`, `Relatórios` e `Configurações`, além de links de transição para a vitrine pública e tela de login.

---

### `ContentArea.jsx`

* **Caminho:** `web/src/components/layout/ContentArea.jsx`
* **Finalidade:** Wrapper semântico `<main id="conteudo" tabIndex={-1} role="main">` que encapsula o conteúdo principal da área administrativa, garantindo limites de largura máxima (`1200px`) e foco acessível por atalhos.

---

### `AppLayouts.jsx`

* **Caminho:** `web/src/components/layout/AppLayouts.jsx`
* **Finalidade:** Módulo centralizador de exportações de layouts e componentes flutuantes globais:
  * `DemoBanner`: faixa informativa amarela/cinza indicando ambiente de demonstração com dados fictícios.
  * `Toast`: notificação flutuante de sucesso temporária conectada ao `DemoContext` (`role="status"`).

