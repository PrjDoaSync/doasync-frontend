import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Icon } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { podeEditar } from '../utils/campanhas'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import '../styles/cam-publico.css'

const STATUS = ['Rascunho', 'Agendada', 'Ativa', 'Encerrada', 'Desativada']

// Gestão de campanhas (/campanhas): a entidade vê as próprias campanhas em todos os status;
// o ADMIN vê as de todas as entidades. Os dados vêm de GET /campanhas (um status por vez).
export default function Campanhas() {
  const { usuario } = useAuth()
  const admin = usuario.tipo === 'ADMIN'
  const entidadeId = admin ? undefined : usuario.entidadeId
  const request = useRequest((config) => campanhasService.daGestao({ entidadeId }, config), [entidadeId])
  const aprovada = admin || usuario.statusEntidade === 'APROVADA'

  return (
    <div className="cam-gestao">
      <PageHeader
        titulo="Gestão de campanhas"
        descricao={admin ? 'Campanhas de todas as entidades, em qualquer status.' : 'Acompanhe as campanhas e o quanto falta para atingir cada meta.'}
      >
        {!admin && aprovada && (
          <Botao para="/campanhas/nova">
            <Icon nome="mais" />
            Criar campanha
          </Botao>
        )}
      </PageHeader>
      {!aprovada && <Aviso>Sua entidade ainda não foi aprovada: a criação de campanhas fica disponível após a aprovação.</Aviso>}
      <RequestState {...request}>{(campanhas) => <Lista campanhas={campanhas} admin={admin} />}</RequestState>
    </div>
  )
}

function Lista({ campanhas, admin }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return campanhas.filter(
      (c) =>
        (!status || c.status === status) &&
        (!termo || `${c.nome} ${c.entidade} ${c.categoria}`.toLowerCase().includes(termo)),
    )
  }, [campanhas, busca, status])

  const colunas = [
    {
      chave: 'nome',
      titulo: 'Campanha',
      render: (c) => (
        <>
          <Link to={`/campanhas/${c.id}/acompanhamento`}>
            <img className="cam-miniatura" src={c.imagem} alt="" loading="lazy" />
            <strong>{c.nome}</strong>
          </Link>
          <small>
            {c.entidade}
            {c.categoria && ` · ${c.categoria}`}
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
            <div className="progresso" role="img" aria-label={`${pct}% da meta`}>
              <div className="progresso__barra" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <small>
              {formatarMoeda(c.arrecadado)} de {formatarMoeda(c.meta)} ({pct}%)
            </small>
          </>
        )
      },
    },
    { chave: 'periodo', titulo: 'Período', render: (c) => `${formatarData(c.iniciaEm)} a ${formatarData(c.encerraEm)}` },
    { chave: 'status', titulo: 'Status', render: (c) => <StatusBadge valor={c.status} /> },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (c) => (
        <>
          <Link to={`/campanhas/${c.id}/acompanhamento`}>Acompanhar</Link>
          {!admin && podeEditar(c.status) && (
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
        <DataTable colunas={colunas} linhas={filtradas} vazio={campanhas.length ? 'Nenhuma campanha encontrada.' : 'Nenhuma campanha cadastrada ainda.'} />
      </section>
    </>
  )
}
