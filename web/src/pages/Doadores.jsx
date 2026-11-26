import { useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import { Aviso, Campo } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { doacoesService } from '../services/doacoesService'
import { formatarData, formatarMoeda } from '../utils/format'

const colunas = [
  { chave: 'doador', titulo: 'Nome informado' },
  { chave: 'data', titulo: 'Data', render: (d) => formatarData(d.data.slice(0, 10)) },
  { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
  { chave: 'status', titulo: 'Status' },
  { chave: 'comprovante', titulo: 'Comprovante', render: (d) => <Link to={`/minhas-doacoes/${d.id}`}>{d.comprovante}</Link> },
]

export default function Doadores() {
  const { usuario } = useAuth()
  return (
    <>
      <PageHeader titulo="Doadores e histórico" descricao="Consulte os nomes informados nos registros de doação da sua entidade." />
      {usuario.entidadeId ? <Historico key={usuario.entidadeId} id={usuario.entidadeId} /> : <Aviso>Esta consulta exige uma conta vinculada a uma entidade.</Aviso>}
    </>
  )
}

function Historico({ id }) {
  const [busca, setBusca] = useState('')
  const request = useRequest((config) => doacoesService.historicoEntidade(id, config), [id])
  const termo = busca.trim().toLocaleLowerCase('pt-BR')

  return (
    <section className="cartao pilha">
      <Campo type="search" rotulo="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
      <RequestState {...request}>
        {(doacoes) => <DataTable linhas={doacoes.filter((d) => !d.anonima && d.doador.toLocaleLowerCase('pt-BR').includes(termo))} colunas={colunas} vazio="Nenhum doador identificado na consulta." />}
      </RequestState>
    </section>
  )
}
