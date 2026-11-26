import { useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import PaginacaoApi from '../components/PaginacaoApi'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { doacoesService } from '../services/doacoesService'
import { formatarData, formatarMoeda } from '../utils/format'

const colunas = [
  { chave: 'comprovante', titulo: 'Comprovante', render: (d) => <Link to={`/minhas-doacoes/${d.id}`}>{d.comprovante}</Link> },
  { chave: 'doador', titulo: 'Doador' },
  { chave: 'campanha', titulo: 'Campanha', render: (d) => d.campanha || 'Doação direta' },
  { chave: 'data', titulo: 'Data', render: (d) => formatarData(d.data.slice(0, 10)) },
  { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
  { chave: 'status', titulo: 'Status', render: (d) => <StatusBadge valor={d.status} /> },
]

export default function DoacoesGestao() {
  const { usuario } = useAuth()
  const id = usuario.entidadeId
  return (
    <>
      <PageHeader titulo="Doações recebidas" descricao="Consulte os registros de doação da entidade." />
      {id ? <Lista key={id} id={id} /> : <Aviso>Esta consulta exige uma conta vinculada a uma entidade.</Aviso>}
    </>
  )
}

function Lista({ id }) {
  const [filtros, setFiltros] = useState({ page: 1 })
  const [erro, setErro] = useState('')
  const request = useRequest((config) => doacoesService.recebidas(id, filtros, config), [id, filtros])

  function filtrar(event) {
    event.preventDefault()
    const { dataInicio, dataFim } = Object.fromEntries(new FormData(event.currentTarget))
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data final deve ser igual ou posterior à inicial.')
      return
    }
    setErro('')
    setFiltros({ page: 1, dataInicio: dataInicio || undefined, dataFim: dataFim || undefined })
  }

  return (
    <>
      <form className="cartao form-grid" onSubmit={filtrar}>
        <Campo name="dataInicio" rotulo="Data inicial" type="date" />
        <Campo name="dataFim" rotulo="Data final" type="date" />
        <div><Botao type="submit">Filtrar</Botao></div>
        {erro && <Aviso erro>{erro}</Aviso>}
      </form>
      <section className="cartao">
        <RequestState {...request}>
          {(dados) => <>
            <DataTable linhas={dados.itens} colunas={colunas} vazio="Nenhuma doação no período." />
            <PaginacaoApi dados={dados} ocupado={request.loading} selecionar={(page) => setFiltros((atual) => ({ ...atual, page }))} />
          </>}
        </RequestState>
      </section>
    </>
  )
}
