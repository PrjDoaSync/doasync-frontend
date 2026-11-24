import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../mocks'

const STATUS = ['Ativa', 'Em análise', 'Inativa']

export default function Entidades() {
  const requisicao = useRequest((config) => entidadesService.listar({}, config))
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (requisicao.data ?? []).filter(
      (e) =>
        (!status || e.status === status) &&
        (!termo || `${e.nome} ${e.cidade} ${e.categoria}`.toLowerCase().includes(termo)),
    )
  }, [requisicao.data, busca, status])

  const colunas = [
    { chave: 'nome', titulo: 'Entidade', render: (e) => (
      <>
        <strong>{e.nome}</strong>
        <small>{e.cidade}</small>
      </>
    ) },
    { chave: 'categoria', titulo: 'Categoria' },
    { chave: 'campanhasAtivas', titulo: 'Campanhas ativas' },
    { chave: 'doacoesRecebidas', titulo: 'Doações recebidas' },
    { chave: 'status', titulo: 'Status', render: (e) => <StatusBadge valor={e.status} /> },
  ]

  return (
    <>
      <PageHeader titulo="Gestão de entidades" descricao="Acompanhe as entidades cadastradas e a situação de cada uma na plataforma." />

      <RequestState {...requisicao}>
        {(entidades) => (
          <>
            <section className="kpis">
              <KpiCard rotulo="Entidades ativas" valor={entidades.filter((e) => e.status === 'Ativa').length} />
              <KpiCard rotulo="Em análise" valor={entidades.filter((e) => e.status === 'Em análise').length} />
              <KpiCard rotulo="Total de entidades" valor={entidades.length} />
            </section>

            <section className="cartao">
              <Filtros
                busca={busca}
                onBusca={setBusca}
                placeholder="Busque por entidade, cidade ou categoria"
                selects={[{ rotulo: 'Todos os status', valor: status, onChange: setStatus, opcoes: STATUS }]}
              />
              <DataTable colunas={colunas} linhas={filtradas} vazio="Nenhuma entidade encontrada." />
            </section>
          </>
        )}
      </RequestState>
    </>
  )
}
