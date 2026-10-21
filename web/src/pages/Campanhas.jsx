import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../mocks'
import { formatarData, formatarMoeda, percentual } from '../utils/format'

const STATUS = ['Ativa', 'Encerrada', 'Rascunho']

export default function Campanhas() {
  const requisicao = useRequest((config) => campanhasService.listar({}, config))
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (requisicao.data ?? []).filter(
      (c) =>
        (!status || c.status === status) &&
        (!termo || `${c.nome} ${c.entidade} ${c.categoria}`.toLowerCase().includes(termo)),
    )
  }, [requisicao.data, busca, status])

  const colunas = [
    { chave: 'nome', titulo: 'Campanha', render: (c) => (
      <>
        <strong>{c.nome}</strong>
        <small>{c.entidade} · {c.categoria}</small>
      </>
    ) },
    { chave: 'progresso', titulo: 'Progresso da meta', render: (c) => {
      const pct = percentual(c.arrecadado, c.meta)
      return (
        <>
          <div className="progresso" role="img" aria-label={`${pct}% da meta`}>
            <div className="progresso__barra" style={{ width: `${pct}%` }} />
          </div>
          <small>{formatarMoeda(c.arrecadado)} de {formatarMoeda(c.meta)} ({pct}%)</small>
        </>
      )
    } },
    { chave: 'encerraEm', titulo: 'Encerra em', render: (c) => formatarData(c.encerraEm) },
    { chave: 'status', titulo: 'Status', render: (c) => <StatusBadge valor={c.status} /> },
  ]

  return (
    <>
      <PageHeader titulo="Gestão de campanhas" descricao="Acompanhe as campanhas e o quanto falta para atingir cada meta." />

      <RequestState {...requisicao}>
        {(campanhas) => (
          <>
            <section className="kpis">
              <KpiCard rotulo="Campanhas ativas" valor={campanhas.filter((c) => c.status === 'Ativa').length} />
              <KpiCard rotulo="Arrecadado" valor={formatarMoeda(campanhas.reduce((soma, c) => soma + c.arrecadado, 0))} />
              <KpiCard rotulo="Meta total" valor={formatarMoeda(campanhas.reduce((soma, c) => soma + c.meta, 0))} />
            </section>

            <section className="cartao">
              <Filtros
                busca={busca}
                onBusca={setBusca}
                placeholder="Busque por campanha, entidade ou categoria"
                selects={[{ rotulo: 'Todos os status', valor: status, onChange: setStatus, opcoes: STATUS }]}
              />
              <DataTable colunas={colunas} linhas={filtradas} vazio="Nenhuma campanha encontrada." />
            </section>
          </>
        )}
      </RequestState>
    </>
  )
}
