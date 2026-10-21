import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { useRequest } from '../hooks/useRequest'
import { doacoesService } from '../mocks'
import { formatarData } from '../utils/format'

const STATUS = ['Confirmada', 'Pendente', 'Cancelada']
const TIPOS = ['Financeira', 'Itens']

export default function Doacoes() {
  const requisicao = useRequest((config) => doacoesService.listar({}, config))
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (requisicao.data ?? []).filter(
      (d) =>
        (!status || d.status === status) &&
        (!tipo || d.tipo === tipo) &&
        (!termo || `${d.doador} ${d.detalhe}`.toLowerCase().includes(termo)),
    )
  }, [requisicao.data, busca, status, tipo])

  const colunas = [
    { chave: 'doador', titulo: 'Doador' },
    { chave: 'detalhe', titulo: 'Contribuição', render: (d) => (
      <>
        <strong>{d.detalhe}</strong>
        <small>{d.tipo}</small>
      </>
    ) },
    { chave: 'pagamento', titulo: 'Pagamento', render: (d) => <StatusBadge valor={d.pagamento} /> },
    { chave: 'recebimento', titulo: 'Recebimento', render: (d) => <StatusBadge valor={d.recebimento} /> },
    { chave: 'destinacao', titulo: 'Destinação' },
    { chave: 'data', titulo: 'Data', render: (d) => formatarData(d.data) },
    { chave: 'status', titulo: 'Status', render: (d) => <StatusBadge valor={d.status} /> },
  ]

  return (
    <>
      <PageHeader titulo="Gestão de doações recebidas" descricao="Confira pagamentos, confirme entregas de itens e acompanhe a destinação." />

      <RequestState {...requisicao}>
        {(doacoes) => (
          <>
            <section className="kpis">
              <KpiCard rotulo="Doações confirmadas" valor={doacoes.filter((d) => d.status === 'Confirmada').length} />
              <KpiCard rotulo="Aguardando confirmação" valor={doacoes.filter((d) => d.status === 'Pendente').length} detalhe="Pagamento ou entrega pendente" />
              <KpiCard rotulo="Canceladas" valor={doacoes.filter((d) => d.status === 'Cancelada').length} />
            </section>

            <section className="cartao">
              <Filtros
                busca={busca}
                onBusca={setBusca}
                placeholder="Busque por doador ou contribuição"
                selects={[
                  { rotulo: 'Todos os status', valor: status, onChange: setStatus, opcoes: STATUS },
                  { rotulo: 'Todos os tipos', valor: tipo, onChange: setTipo, opcoes: TIPOS },
                ]}
              />
              <DataTable colunas={colunas} linhas={filtradas} vazio="Nenhuma doação encontrada." />
            </section>
          </>
        )}
      </RequestState>
    </>
  )
}
