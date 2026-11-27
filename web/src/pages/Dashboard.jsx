import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import Grafico from '../components/Grafico'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import SeletorEntidade from '../components/SeletorEntidade'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Secao, Vazio } from '../components/Ui'
import { useEntidadeGestao } from '../hooks/useEntidadeGestao'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { dashboardService } from '../services/dashboardService'
import { doacoesService } from '../services/doacoesService'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import { validarPeriodo } from '../utils/gestao'

// Série do gráfico a partir das doações da API (só confirmadas entram, como na arrecadação).
const paraSerie = (doacoes, inicio, fim) =>
  doacoes
    .map((d) => ({ tipo: 'Financeira', status: d.status, valor: d.valor, data: String(d.data).slice(0, 10) }))
    .filter((d) => (!inicio || d.data >= inicio) && (!fim || d.data <= fim))

// [DEV-GES-03] Dashboard geral (#107) e [DEV-GES-04] análise por campanha (#108).
// ENTIDADE: GET /entidades/{id}/arrecadacao (período), GET /campanhas por status e
// GET /entidades/{id}/doacoes. ADMIN, visão geral: GET /dashboard/kpis; para ver uma
// entidade, escolhe-a no seletor. SEM CONTRATO: itens recebidos e famílias atendidas.
export default function Dashboard({ analitico = false }) {
  const { admin, entidadeId, escolher } = useEntidadeGestao()
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const erroPeriodo = validarPeriodo(inicio, fim)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        {analitico ? 'Análise por campanha' : 'Visão geral'}
      </div>
      <PageHeader
        titulo={analitico ? 'Análise por campanha' : admin ? 'Visão geral da plataforma' : 'Visão geral da entidade'}
        descricao={
          analitico
            ? 'Acompanhe a arrecadação de uma campanha no período selecionado.'
            : 'Um panorama das campanhas e das doações confirmadas.'
        }
      >
        {analitico ? (
          <Botao para="/dashboard" secundario>Voltar à visão geral</Botao>
        ) : (
          <Botao para="/dashboard/campanha" secundario>
            <Icon nome="relatorios" />
            Análise por campanha
          </Botao>
        )}
      </PageHeader>
      {admin && !analitico && <KpisPlataforma />}
      {admin && (
        <Secao titulo="Dados de uma entidade" descricao="Escolha uma entidade aprovada para ver a arrecadação dela.">
          <SeletorEntidade valor={entidadeId} onChange={escolher} />
        </Secao>
      )}
      {entidadeId && (
        <>
          <div className="filtros-dashboard">
            <Campo rotulo="Data inicial" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            <Campo rotulo="Data final" type="date" value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} />
            <Botao secundario onClick={() => { setInicio(''); setFim('') }}>Todo o período</Botao>
          </div>
          {erroPeriodo ? (
            <Aviso erro>{erroPeriodo}</Aviso>
          ) : analitico ? (
            <AnaliseCampanha key={entidadeId} entidadeId={entidadeId} inicio={inicio} fim={fim} />
          ) : (
            <VisaoEntidade key={entidadeId} entidadeId={entidadeId} inicio={inicio} fim={fim} />
          )}
        </>
      )}
    </>
  )
}

function KpisPlataforma() {
  const request = useRequest((config) => dashboardService.kpis(config), [])
  return (
    <RequestState {...request}>
      {(k) => (
        <section className="kpis" aria-label="Indicadores da plataforma">
          <KpiCard rotulo="Total arrecadado" valor={formatarMoeda(k.totalArrecadado)} detalhe={`${k.totalDoacoes} doações confirmadas`} />
          <KpiCard rotulo="Arrecadado no mês" valor={formatarMoeda(k.valorArrecadadoMes)} detalhe={`${k.doacoesMes} doações desde o dia 1º`} />
          <KpiCard rotulo="Campanhas recebendo doações" valor={k.campanhasAtivas} detalhe={`${k.totalEntidades} entidades aprovadas`} />
          <KpiCard rotulo="Doadores" valor={k.totalDoadores} detalhe={`${k.usuariosAtivos} contas ativas`} />
        </section>
      )}
    </RequestState>
  )
}

function VisaoEntidade({ entidadeId, inicio, fim }) {
  const request = useRequest(
    (config) =>
      Promise.all([
        doacoesService.arrecadacao(entidadeId, { inicio, fim }, config),
        campanhasService.daGestao({ entidadeId }, config),
        doacoesService.recebidas(entidadeId, {}, config),
      ]),
    [entidadeId, inicio, fim],
  )
  return (
    <RequestState {...request}>
      {([arrecadacao, campanhas, doacoes]) => {
        const ativas = campanhas.filter((c) => c.status === 'Ativa')
        const porCampanha = arrecadacao.porCampanha ?? []
        return (
          <>
            <p className="atualizacao">
              <span />
              {inicio || fim ? `Período: ${inicio ? formatarData(inicio) : 'início'} a ${fim ? formatarData(fim) : 'hoje'}` : 'Todo o período'} · somente doações confirmadas
            </p>
            <section className="kpis">
              <KpiCard rotulo="Arrecadação no período" valor={formatarMoeda(arrecadacao.totalArrecadado)} />
              <KpiCard rotulo="Doações confirmadas" valor={arrecadacao.quantidadeDoacoes} />
              <KpiCard
                rotulo="Ticket médio"
                valor={formatarMoeda(arrecadacao.quantidadeDoacoes ? arrecadacao.totalArrecadado / arrecadacao.quantidadeDoacoes : 0)}
              />
              <KpiCard rotulo="Campanhas ativas" valor={ativas.length} detalhe={`${campanhas.length} campanhas no total`} />
            </section>
            <div className="dashboard-grid">
              <Secao titulo="Evolução da arrecadação" descricao="Valor acumulado das doações confirmadas.">
                <Grafico doacoes={paraSerie(doacoes, inicio, fim)} />
              </Secao>
              <Secao titulo="Arrecadação por campanha" descricao="Doações confirmadas no período.">
                <DataTable
                  nome="Arrecadação por campanha"
                  linhas={porCampanha.map((p) => ({ ...p, id: p.campanhaId ?? 'direta' }))}
                  vazio="Nenhuma doação confirmada no período."
                  colunas={[
                    {
                      chave: 'titulo',
                      titulo: 'Campanha',
                      render: (p) => (p.campanhaId ? <Link to={`/dashboard/campanha?campanha=${p.campanhaId}`}>{p.titulo}</Link> : 'Doação direta à entidade'),
                    },
                    { chave: 'quantidade', titulo: 'Doações' },
                    { chave: 'total', titulo: 'Total', render: (p) => formatarMoeda(p.total) },
                  ]}
                />
              </Secao>
            </div>
          </>
        )
      }}
    </RequestState>
  )
}

function AnaliseCampanha({ entidadeId, inicio, fim }) {
  const [params, setParams] = useSearchParams()
  const campanhas = useRequest((config) => campanhasService.daGestao({ entidadeId }, config), [entidadeId])
  return (
    <RequestState {...campanhas} vazio={<Vazio titulo="Nenhuma campanha cadastrada">Crie uma campanha para acompanhar a arrecadação.</Vazio>}>
      {(lista) => {
        const selecionada = lista.find((c) => c.id === params.get('campanha'))
        const campanha = selecionada ?? (params.get('campanha') ? null : lista[0])
        return (
          <>
            <Campo rotulo="Campanha">
              <select value={campanha?.id ?? ''} onChange={(e) => setParams({ campanha: e.target.value })}>
                {!campanha && <option value="">Selecione uma campanha</option>}
                {lista.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </Campo>
            {campanha ? (
              <Analise key={campanha.id} campanha={campanha} entidadeId={entidadeId} inicio={inicio} fim={fim} />
            ) : (
              <Vazio titulo="Campanha não encontrada">A campanha indicada não pertence a esta entidade. Escolha outra na lista.</Vazio>
            )}
          </>
        )
      }}
    </RequestState>
  )
}

function Analise({ campanha: c, entidadeId, inicio, fim }) {
  const request = useRequest(
    (config) =>
      Promise.all([
        doacoesService.arrecadacao(entidadeId, { inicio, fim }, config),
        doacoesService.recebidas(entidadeId, { campanhaId: c.id }, config),
      ]),
    [entidadeId, c.id, inicio, fim],
  )
  const pct = percentual(c.arrecadado, c.meta)
  return (
    <>
      <div className="cartao ges-campanha">
        <img src={c.imagem} alt="" />
        <div>
          <small>Campanha selecionada</small>
          <strong>{c.nome}</strong>
          <br />
          <StatusBadge valor={c.status} /> <Link to={`/campanhas/${c.id}/acompanhamento`}>Acompanhar campanha</Link>
        </div>
      </div>
      <RequestState {...request}>
        {([arrecadacao, doacoes]) => {
          const periodo = (arrecadacao.porCampanha ?? []).find((p) => p.campanhaId === c.id) ?? { total: 0, quantidade: 0 }
          return (
            <>
              <section className="kpis">
                <KpiCard rotulo="Arrecadado na campanha" valor={formatarMoeda(c.arrecadado)} detalhe={`${pct}% da meta de ${formatarMoeda(c.meta)}`} />
                <KpiCard rotulo="Arrecadado no período" valor={formatarMoeda(periodo.total)} detalhe={`${periodo.quantidade} doações confirmadas`} />
                <KpiCard rotulo="Falta para a meta" valor={formatarMoeda(Math.max(0, c.meta - c.arrecadado))} />
                <KpiCard rotulo="Período da campanha" valor={`${formatarData(c.iniciaEm)} a ${formatarData(c.encerraEm)}`} />
              </section>
              <Secao titulo="Evolução da arrecadação" descricao="Valor acumulado das doações confirmadas desta campanha.">
                <Grafico doacoes={paraSerie(doacoes, inicio, fim)} id={`arrecadacao-${c.id}`} />
              </Secao>
            </>
          )
        }}
      </RequestState>
    </>
  )
}
