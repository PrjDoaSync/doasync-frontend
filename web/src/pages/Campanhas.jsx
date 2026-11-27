import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useCampanhasDaEntidade } from '../hooks/useCampanhasPublicas'
import { Link } from 'react-router-dom'
import { Botao, Icon } from '../components/Ui'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import '../styles/cam-publico.css'

const STATUS = ['Ativa', 'Agendada', 'Rascunho', 'Encerrada', 'Desativada']

// Minhas campanhas (#91): GET /campanhas?entidadeId=...&status=... com o token da entidade.
export default function Campanhas() {
  const { usuario } = useAuth()
  const requisicao = useCampanhasDaEntidade(usuario?.entidadeId)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (requisicao.data ?? []).filter(
      (c) =>
        (!status || c.status === status) &&
        (!termo ||
          `${c.nome} ${c.entidade} ${c.categoria}`
            .toLowerCase()
            .includes(termo)),
    )
  }, [requisicao.data, busca, status])

  const colunas = [
    {
      chave: 'nome',
      titulo: 'Campanha',
      render: (c) => (
        <>
          {/* Detalhe vindo da API; a entidade dona também vê rascunhos e desativadas. */}
          <Link to={`/campanhas/${c.id}`}>
            <img className="cam-miniatura" src={c.imagem} alt="" loading="lazy" />
            <strong>{c.nome}</strong>
          </Link>
          <small>
            {c.entidade} · {c.categoria}
          </small>
        </>
      ),
    },
    {
      chave: 'progresso',
      titulo: 'Progresso da meta',
      render: (c) => {
        const pct = percentual(c.arrecadado, c.meta)
        return (
          <>
            <div
              className="progresso"
              role="img"
              aria-label={`${pct}% da meta`}
            >
              <div className="progresso__barra" style={{ width: `${pct}%` }} />
            </div>
            <small>
              {formatarMoeda(c.arrecadado)} de {formatarMoeda(c.meta)} ({pct}%)
            </small>
          </>
        )
      },
    },
    {
      chave: 'encerraEm',
      titulo: 'Encerra em',
      render: (c) => formatarData(c.encerraEm),
    },
    {
      chave: 'status',
      titulo: 'Status',
      render: (c) => <StatusBadge valor={c.status} />,
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (c) => (
        <>
          <Link to={`/campanhas/${c.id}/acompanhamento`}>Acompanhar</Link>
          {c.status === 'Encerrada' && (
            <>
              {' · '}
              <Link to={`/campanhas/${c.id}/prestacao-de-contas`}>Prestar contas</Link>
            </>
          )}
          {c.status === 'Ativa' && (
            <>
              {' · '}
              <Link to={`/campanhas/${c.id}/editar`}>Editar</Link>
            </>
          )}
        </>
      ),
    },
  ]

  return (
    <div className="cam-gestao">
      <PageHeader
        titulo="Gestão de campanhas"
        descricao="Acompanhe as campanhas e o quanto falta para atingir cada meta."
      >
        <Botao para="/campanhas/nova">
          <Icon nome="mais" />
          Criar campanha
        </Botao>
      </PageHeader>

      <RequestState {...requisicao}>
        {(campanhas) => (
          <>
            <section className="kpis">
              <KpiCard
                rotulo="Campanhas ativas"
                valor={campanhas.filter((c) => c.status === 'Ativa').length}
              />
              <KpiCard
                rotulo="Arrecadado"
                valor={formatarMoeda(
                  campanhas.reduce((soma, c) => soma + c.arrecadado, 0),
                )}
              />
              <KpiCard
                rotulo="Meta total"
                valor={formatarMoeda(
                  campanhas.reduce((soma, c) => soma + c.meta, 0),
                )}
              />
            </section>

            <section className="cartao">
              <Filtros
                busca={busca}
                onBusca={setBusca}
                placeholder="Busque por campanha, entidade ou categoria"
                selects={[
                  {
                    rotulo: 'Todos os status',
                    valor: status,
                    onChange: setStatus,
                    opcoes: STATUS,
                  },
                ]}
              />
              <DataTable
                colunas={colunas}
                linhas={filtradas}
                vazio="Nenhuma campanha encontrada."
              />
            </section>
          </>
        )}
      </RequestState>
    </div>
  )
}
