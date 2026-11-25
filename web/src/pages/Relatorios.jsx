import { useState } from 'react'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import { Aviso, Botao, Campo, Icon } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { calcularIndicadores, filtrarRegistros, serieFinanceira, serieItens, validarPeriodo } from '../utils/gestao'
import { formatarData, formatarMoeda } from '../utils/format'
import '../styles/relatorios.css'

const inicial = { inicio: '', fim: '', campanhaId: '' }
const soma = (lista, campo) => lista.reduce((s, d) => s + Number(d[campo] || 0), 0)

// [DEV-GES-08] Relatórios e exportação (#112). A exportação segue indisponível: o
// endpoint e a geração de arquivos dependem do backend (PV06, #37). Só pagamentos
// e recebimentos confirmados entram nos totais; pendências aparecem à parte.
export default function Relatorios() {
  const { dados } = useDemo()
  const [form, setForm] = useState(inicial)
  const [filtros, setFiltros] = useState(inicial)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const entidade = dados.entidade
  const registros = filtrarRegistros(dados.doacoes, { ...filtros, entidadeId: entidade.id })
  const confirmadas = registros.filter((d) => d.status === 'Confirmada')
  const pendentes = registros.filter((d) => d.status === 'Pendente')
  const ind = calcularIndicadores(dados.campanhas, registros)
  const acumulado = calcularIndicadores(dados.campanhas, filtrarRegistros(dados.doacoes, { entidadeId: entidade.id }))
  const minhasCampanhas = dados.campanhas.filter((c) => c.entidadeId === entidade.id)
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const linhasCampanha = minhasCampanhas
    .filter((c) => !filtros.campanhaId || String(c.id) === String(filtros.campanhaId))
    .map((c) => {
      const dela = confirmadas.filter((d) => d.campanhaId === c.id)
      return {
        id: c.id, nome: c.nome,
        fin: soma(dela.filter((d) => d.tipo === 'Financeira'), 'valor'),
        itens: soma(dela.filter((d) => d.tipo === 'Itens'), 'quantidade'),
        qtd: dela.length,
      }
    })
  linhasCampanha.push({ id: 'total', nome: 'Total confirmado', fin: soma(linhasCampanha, 'fin'), itens: soma(linhasCampanha, 'itens'), qtd: soma(linhasCampanha, 'qtd') })
  const dias = new Map()
  serieFinanceira(confirmadas).forEach(({ data, valor }) => dias.set(data, { id: data, data, fin: valor, itens: 0 }))
  serieItens(confirmadas).forEach(({ data, valor }) => dias.set(data, { ...(dias.get(data) ?? { id: data, data, fin: 0 }), itens: valor }))
  const linhasDia = [...dias.values()].sort((a, b) => a.data.localeCompare(b.data))
  const periodo = `${filtros.inicio ? formatarData(filtros.inicio) : 'Início do histórico'} a ${filtros.fim ? formatarData(filtros.fim) : 'hoje'}`

  function aplicar(e) {
    e.preventDefault()
    const mensagem = validarPeriodo(form.inicio, form.fim)
    setErro(mensagem)
    if (!mensagem) {
      setFiltros({ ...form })
      setAviso('Prévia atualizada para os filtros selecionados.')
    }
  }

  const negrito = (d, valor) => (d.id === 'total' ? <strong>{valor}</strong> : valor)
  return (
    <div className="rel">
      <div>
        <nav className="breadcrumb" aria-label="Você está em">Relatórios <span>/</span> Período e entidade</nav>
        <PageHeader titulo="Relatórios e exportação" descricao="Consolide os resultados da entidade e compartilhe uma prestação de contas clara." />
      </div>

      <section className="rel-card" aria-labelledby="rel-escopo">
        <h2 id="rel-escopo">Selecione o escopo do relatório</h2>
        <form onSubmit={aplicar} className="rel-escopo">
          <Campo rotulo="Entidade"><select disabled><option>{entidade.nome}</option></select></Campo>
          <Campo rotulo="Data inicial" name="inicio" type="date" value={form.inicio} onChange={alterar} />
          <Campo rotulo="Data final" name="fim" type="date" value={form.fim} min={form.inicio || undefined} onChange={alterar} />
          <Campo rotulo="Campanha">
            <select name="campanhaId" value={form.campanhaId} onChange={alterar}>
              <option value="">Todas as campanhas</option>
              {minhasCampanhas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Campo>
          <Botao type="submit"><Icon nome="relatorios" size={16} /> Gerar prévia</Botao>
        </form>
        <p className="rel-sub">Fechamento: 06/10/2026, às 10:45 · Somente pagamentos e recebimentos confirmados.</p>
        {erro && <Aviso erro>{erro}</Aviso>}
        {aviso && <Aviso>{aviso}</Aviso>}
      </section>

      <section className="rel-kpis">
        <KpiCard rotulo="Financeiro confirmado" valor={formatarMoeda(ind.arrecadado)}
          detalhe={`${confirmadas.filter((d) => d.tipo === 'Financeira').length} doações financeiras · exclui ${formatarMoeda(soma(pendentes.filter((d) => d.tipo === 'Financeira'), 'valor'))} pendentes`} />
        <KpiCard rotulo="Itens recebidos" valor={`${ind.itens} unidades`}
          detalhe={`${confirmadas.filter((d) => d.tipo === 'Itens').length} doações de itens · exclui ${soma(pendentes.filter((d) => d.tipo === 'Itens'), 'quantidade')} un. a conferir`} />
        <KpiCard rotulo="Doadores identificados" valor={ind.doadores} detalhe="Pessoas e organizações únicas no período" />
      </section>

      <div className="rel-grid">
        <section className="rel-card" aria-labelledby="rel-previa">
          <div><h2 id="rel-previa">Prévia do relatório</h2><p className="rel-sub">{entidade.nome} · {periodo} · Dados demonstrativos</p></div>
          <div className="rel-cab"><h3>Resumo de arrecadação e recebimentos</h3><span className="badge badge--info">Prévia PDF</span></div>
          <p className="rel-sub">Gerado em 06/10/2026 · 10:45 · Ana Silva</p>
          <hr className="rel-sep" />
          <h3>Resultados por campanha no período</h3>
          <DataTable
            linhas={linhasCampanha} vazio="Nenhuma campanha no período."
            colunas={[
              { chave: 'nome', titulo: 'Campanha', render: (d) => negrito(d, d.nome) },
              { chave: 'fin', titulo: 'Financeiro', render: (d) => negrito(d, formatarMoeda(d.fin)) },
              { chave: 'itens', titulo: 'Itens', render: (d) => negrito(d, `${d.itens} un.`) },
              { chave: 'qtd', titulo: 'Doações', render: (d) => negrito(d, d.qtd) },
            ]}
          />
          <p className="rel-sub">Campanhas sem recebimentos confirmados no período aparecem com zero. Rascunhos ficam fora dos totais.</p>
          <h3>Evolução diária · não acumulada</h3>
          <DataTable
            linhas={linhasDia} vazio="Nenhum recebimento confirmado no período."
            colunas={[
              { chave: 'data', titulo: 'Data', render: (d) => <strong>{formatarData(d.data)}</strong> },
              { chave: 'fin', titulo: 'Financeiro', render: (d) => formatarMoeda(d.fin) },
              { chave: 'itens', titulo: 'Itens recebidos', render: (d) => `${d.itens} un.` },
            ]}
          />
          <p className="rel-sub">Recebimentos não comprovam destinação. Pendências e entregas não confirmadas não compõem este resultado.</p>
        </section>

        <div className="rel-col">
          <section className="rel-card" aria-labelledby="rel-exportar">
            <div><h2 id="rel-exportar">Exportar relatório</h2><p className="rel-sub">Os dois formatos usam o mesmo período e a mesma entidade.</p></div>
            <span className="rel-selo">Exportação pendente de integração</span>
            <h3>PDF · prestação de contas</h3>
            <p className="rel-sub">Resumo por campanha, indicadores e evolução diária. Documento com identificação da entidade.</p>
            <div><Botao secundario disabled aria-describedby="exportacao-pendente"><Icon nome="download" /> Baixar PDF</Botao></div>
            <hr className="rel-sep" />
            <h3>CSV · dados para análise</h3>
            <p className="rel-sub">{confirmadas.length} registros confirmados: {confirmadas.filter((d) => d.tipo === 'Financeira').length} financeiros e {confirmadas.filter((d) => d.tipo === 'Itens').length} de itens. Colunas: data, código, campanha, modalidade, valor e quantidade.</p>
            <div><Botao secundario disabled aria-describedby="exportacao-pendente"><Icon nome="download" /> Baixar CSV</Botao></div>
            <p className="rel-sub">UTF-8 · separador ponto e vírgula · valores em reais. Dados de contato não são incluídos.</p>
            <Aviso><span id="exportacao-pendente">Exportações oficiais indisponíveis: o serviço de geração de arquivos ainda não foi integrado.</span></Aviso>
          </section>
          <section className="rel-card" aria-labelledby="rel-ultima">
            <h2 id="rel-ultima">Última exportação</h2>
            <p className="rel-sub">Nenhuma exportação registrada nesta sessão.</p>
          </section>
        </div>
      </div>

      <Aviso>O acumulado da entidade é {formatarMoeda(acumulado.arrecadado)} e {acumulado.itens} itens; este relatório mostra apenas o período selecionado: {formatarMoeda(ind.arrecadado)} e {ind.itens} itens. Pagamentos pendentes, entregas não confirmadas e rascunhos ficam fora dos totais.</Aviso>
    </div>
  )
}
