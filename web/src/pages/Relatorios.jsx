import { useState } from 'react'
import AvisoIndisponivel from '../components/AvisoIndisponivel'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import Paginacao from '../components/Paginacao'
import RequestState from '../components/RequestState'
import SeletorEntidade from '../components/SeletorEntidade'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Secao } from '../components/Ui'
import { useEntidadeGestao } from '../hooks/useEntidadeGestao'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { doacoesService } from '../services/doacoesService'
import { baixarCsv, csvArrecadacao, csvDoacoes } from '../utils/exportarCsv'
import { formatarData, formatarMoeda } from '../utils/format'
import { validarPeriodo } from '../utils/gestao'
import { fatiar } from '../utils/paginacao'
import { resumoRelatorio } from '../utils/relatorios'

const VAZIO = { inicio: '', fim: '', campanhaId: '' }
const POR_PAGINA = 10

// Relatórios e exportação (GES-08, #112). Integrado: GET /entidades/{id}/arrecadacao
// (dataInicio/dataFim) e GET /entidades/{id}/doacoes (campanhaId). A exportação CSV é gerada no
// navegador; PDF e exportação no servidor não existem na API (POST /relatorios/exportar fora do MVP).
export default function Relatorios() {
  const { admin, entidadeId, escolher } = useEntidadeGestao()
  const [form, setForm] = useState(VAZIO)
  const [filtros, setFiltros] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function aplicar(e) {
    e.preventDefault()
    const mensagem = validarPeriodo(form.inicio, form.fim)
    setErro(mensagem)
    if (!mensagem) setFiltros({ ...form })
  }

  return (
    <>
      <div className="breadcrumb">
        Relatórios <span>/</span> Prévia e exportação
      </div>
      <PageHeader titulo="Relatórios e exportação" descricao="Consulte a arrecadação por período e exporte os dados para análise." />
      {admin && (
        <Secao titulo="Entidade" descricao="Escolha uma entidade aprovada para gerar o relatório.">
          <SeletorEntidade valor={entidadeId} onChange={escolher} />
        </Secao>
      )}
      {entidadeId && (
        <>
          <Secao titulo="Selecione o escopo do relatório" descricao="Somente doações confirmadas entram no total arrecadado.">
            <form onSubmit={aplicar} className="form-filtros">
              <Campo rotulo="Data inicial" name="inicio" type="date" value={form.inicio} onChange={alterar} />
              <Campo rotulo="Data final" name="fim" type="date" value={form.fim} min={form.inicio || undefined} onChange={alterar} />
              <CampoCampanha entidadeId={entidadeId} valor={form.campanhaId} onChange={alterar} />
              <div className="acoes">
                <Botao type="submit">
                  <Icon nome="relatorios" />
                  Gerar prévia
                </Botao>
                <Botao
                  secundario
                  onClick={() => {
                    setForm(VAZIO)
                    setFiltros(VAZIO)
                    setErro('')
                  }}
                >
                  Limpar
                </Botao>
              </div>
            </form>
            {erro && <Aviso erro>{erro}</Aviso>}
          </Secao>
          <Previa key={`${entidadeId}|${filtros.inicio}|${filtros.fim}|${filtros.campanhaId}`} entidadeId={entidadeId} filtros={filtros} />
        </>
      )}
    </>
  )
}

function CampoCampanha({ entidadeId, valor, onChange }) {
  const request = useRequest((config) => campanhasService.daGestao({ entidadeId }, config), [entidadeId])
  const campanhas = request.data ?? []
  return (
    <Campo rotulo="Campanha" ajuda={request.error ? 'Não foi possível carregar as campanhas.' : undefined}>
      <select name="campanhaId" value={valor} onChange={onChange} disabled={request.loading}>
        <option value="">Todas as campanhas</option>
        {campanhas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>
    </Campo>
  )
}

function Previa({ entidadeId, filtros }) {
  const { inicio, fim, campanhaId } = filtros
  const request = useRequest(
    (config) =>
      Promise.all([
        doacoesService.arrecadacao(entidadeId, { inicio, fim }, config),
        doacoesService.recebidas(entidadeId, { campanhaId: campanhaId || undefined }, config),
      ]).then(([arrecadacao, doacoes]) => resumoRelatorio({ arrecadacao, doacoes, inicio, fim, campanhaId })),
    [entidadeId, inicio, fim, campanhaId],
  )
  return <RequestState {...request}>{(resumo) => <Conteudo resumo={resumo} filtros={filtros} />}</RequestState>
}

function Conteudo({ resumo, filtros }) {
  const [pagina, setPagina] = useState(1)
  const periodo = `${filtros.inicio ? formatarData(filtros.inicio) : 'Início do histórico'} até ${filtros.fim ? formatarData(filtros.fim) : 'hoje'}`
  const sufixo = [filtros.inicio || 'inicio', filtros.fim || 'hoje'].join('-a-')

  return (
    <>
      <section className="kpis" aria-label="Indicadores do relatório">
        <KpiCard rotulo="Total arrecadado" valor={formatarMoeda(resumo.total)} detalhe={`${resumo.quantidade} doações confirmadas`} />
        <KpiCard rotulo="Ticket médio" valor={formatarMoeda(resumo.ticketMedio)} detalhe="Valor médio por doação confirmada" />
        <KpiCard rotulo="Doadores identificados" valor={resumo.doadores} detalhe="Doações anônimas não são contadas" />
        <KpiCard rotulo="Campanhas com doações" valor={resumo.porCampanha.length} detalhe={periodo} />
      </section>
      <div className="dashboard-grid">
        <div className="pilha">
          <Secao titulo="Arrecadação por campanha" descricao={periodo}>
            <DataTable
              nome="Arrecadação por campanha"
              linhas={resumo.porCampanha.map((c) => ({ ...c, id: c.campanhaId ?? 'direta' }))}
              vazio="Nenhuma doação confirmada no período."
              colunas={[
                { chave: 'titulo', titulo: 'Campanha', render: (c) => c.titulo ?? 'Doação direta à entidade' },
                { chave: 'quantidade', titulo: 'Doações' },
                { chave: 'total', titulo: 'Total', render: (c) => <strong>{formatarMoeda(c.total)}</strong> },
              ]}
            />
          </Secao>
          <Secao titulo="Doações do período" descricao={`${resumo.doacoes.length} registros`}>
            <DataTable
              nome="Doações do período"
              linhas={fatiar(resumo.doacoes, pagina, POR_PAGINA)}
              vazio="Nenhuma doação para os filtros selecionados."
              colunas={[
                { chave: 'data', titulo: 'Data', render: (d) => formatarData(d.data.slice(0, 10)) },
                { chave: 'doador', titulo: 'Doador', render: (d) => (d.anonima ? 'Doador anônimo' : d.doador) },
                { chave: 'campanha', titulo: 'Campanha', render: (d) => d.campanha || 'Doação direta' },
                { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
                { chave: 'status', titulo: 'Status', render: (d) => <StatusBadge valor={d.status} /> },
              ]}
            />
            <Paginacao pagina={pagina} total={resumo.doacoes.length} porPagina={POR_PAGINA} onPagina={setPagina} rotulo="Paginação das doações" />
          </Secao>
        </div>
        <Secao titulo="Exportar relatório">
          <h3>CSV · arrecadação por campanha</h3>
          <p>Totais e quantidade de doações confirmadas no período.</p>
          <Botao
            secundario
            disabled={resumo.porCampanha.length === 0}
            onClick={() => baixarCsv(`arrecadacao-${sufixo}.csv`, csvArrecadacao(resumo.arrecadacao))}
          >
            <Icon nome="download" />
            Baixar CSV da arrecadação
          </Botao>
          <hr />
          <h3>CSV · doações do período</h3>
          <p>Uma linha por doação, sem identificar doadores anônimos.</p>
          <Botao secundario disabled={resumo.doacoes.length === 0} onClick={() => baixarCsv(`doacoes-${sufixo}.csv`, csvDoacoes(resumo.doacoes))}>
            <Icon nome="download" />
            Baixar CSV das doações
          </Botao>
          <hr />
          <h3>PDF · prestação de contas</h3>
          <AvisoIndisponivel recurso="relatorioPdf" />
          <Botao secundario disabled>
            <Icon nome="download" />
            Baixar PDF
          </Botao>
        </Secao>
      </div>
    </>
  )
}
