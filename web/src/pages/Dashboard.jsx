import { useState } from 'react'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import { Aviso, Botao, Campo } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { dashboardService } from '../services/dashboardService'
import { doacoesService } from '../services/doacoesService'
import { baixarArrecadacao } from '../utils/exportarArrecadacao'
import { formatarData, formatarMoeda } from '../utils/format'

const indicadores = [
  ['totalArrecadado', 'Total arrecadado', formatarMoeda],
  ['valorArrecadadoMes', 'Arrecadado no mês', formatarMoeda],
  ['doacoesMes', 'Doações no mês'],
  ['totalDoacoes', 'Total de doações'],
  ['totalDoadores', 'Doadores'],
  ['totalEntidades', 'Entidades'],
  ['campanhasAtivas', 'Campanhas ativas'],
  ['usuariosAtivos', 'Usuários ativos'],
]

export default function Dashboard({ analitico = false, relatorio = false }) {
  const { usuario } = useAuth()
  if (relatorio && usuario.tipo !== 'ENTIDADE') return <><PageHeader titulo="Relatórios e exportação" /><Aviso>O relatório de arrecadação está disponível no acesso da entidade.</Aviso></>
  return usuario.tipo === 'ADMIN'
    ? <PainelAdmin />
    : <PainelEntidade key={usuario.entidadeId} id={usuario.entidadeId} analitico={analitico} relatorio={relatorio} />
}

function PainelAdmin() {
  const request = useRequest(dashboardService.kpis, [])
  return (
    <>
      <PageHeader titulo="Dashboard geral" descricao="Indicadores da plataforma DoaSync." />
      <RequestState {...request}>
        {(kpis) => <section className="kpis">{indicadores.map(([campo, rotulo, formatar]) => (
          <KpiCard key={campo} rotulo={rotulo} valor={formatar ? formatar(kpis[campo]) : kpis[campo]} />
        ))}</section>}
      </RequestState>
    </>
  )
}

function PainelEntidade({ id, analitico, relatorio }) {
  if (!id) return <><PageHeader titulo="Dashboard geral" /><Aviso erro>Sua conta não está vinculada a uma entidade.</Aviso></>
  return <Arrecadacao id={id} analitico={analitico} relatorio={relatorio} />
}

function Arrecadacao({ id, analitico, relatorio }) {
  const [periodo, setPeriodo] = useState({})
  const [erro, setErro] = useState('')
  const [campanha, setCampanha] = useState('')
  const request = useRequest((config) => doacoesService.arrecadacao(id, periodo, config), [id, periodo])

  function submit(event) {
    event.preventDefault()
    const { dataInicio, dataFim } = Object.fromEntries(new FormData(event.currentTarget))
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data final deve ser igual ou posterior à inicial.')
      return
    }
    setErro('')
    setPeriodo({ dataInicio: dataInicio || undefined, dataFim: dataFim || undefined })
  }

  return (
    <>
      <PageHeader titulo={relatorio ? 'Relatórios e exportação' : analitico ? 'Dashboard por campanha' : 'Dashboard geral'} descricao="Doações confirmadas no período da consulta.">
        {!relatorio && <Botao para={analitico ? "/dashboard" : "/dashboard/campanha"} secundario>{analitico ? "Visão geral" : "Analisar por campanha"}</Botao>}
      </PageHeader>
      <form className="cartao form-grid" onSubmit={submit}>
        <Campo name="dataInicio" rotulo="Data inicial" type="date" />
        <Campo name="dataFim" rotulo="Data final" type="date" />
        <div><Botao type="submit">Aplicar período</Botao></div>
        {erro && <Aviso erro>{erro}</Aviso>}
      </form>
      <RequestState {...request}>
        {(resultado) => {
          const selecionada = analitico && resultado.porCampanha.find((linha) => linha.campanhaId === campanha)
          const linhas = selecionada ? [selecionada] : resultado.porCampanha
          return (
            <>
              <p>Período consultado: {formatarData(resultado.inicio)} a {formatarData(resultado.fim)}</p>
              {analitico && <Campo rotulo="Campanha">
                <select value={selecionada ? campanha : ''} onChange={(e) => setCampanha(e.target.value)}>
                  <option value="">Todas as campanhas</option>
                  {resultado.porCampanha.filter((linha) => linha.campanhaId).map((linha) => <option key={linha.campanhaId} value={linha.campanhaId}>{linha.titulo}</option>)}
                </select>
              </Campo>}
              <section className="kpis">
                <KpiCard rotulo="Total arrecadado" valor={formatarMoeda(selecionada ? selecionada.total : resultado.totalArrecadado)} />
                <KpiCard rotulo="Doações confirmadas" valor={selecionada ? selecionada.quantidade : resultado.quantidadeDoacoes} />
              </section>
              <section className="cartao">
                <h2>Arrecadação por campanha</h2>
                {relatorio && resultado.porCampanha.length > 0 && <Botao secundario disabled={request.loading} onClick={() => baixarArrecadacao(resultado)}>Baixar CSV</Botao>}
                <DataTable linhas={linhas.map((c) => ({ ...c, id: c.campanhaId ?? 'direta' }))} colunas={[
                  { chave: 'titulo', titulo: 'Campanha', render: (c) => c.titulo ?? 'Doação direta' },
                  { chave: 'quantidade', titulo: 'Doações' },
                  { chave: 'total', titulo: 'Total', render: (c) => formatarMoeda(c.total) },
                ]} vazio="Nenhuma doação confirmada no período." />
              </section>
            </>
          )
        }}
      </RequestState>
    </>
  )
}
