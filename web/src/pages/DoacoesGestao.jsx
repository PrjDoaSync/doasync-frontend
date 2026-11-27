import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import Paginacao from '../components/Paginacao'
import RequestState from '../components/RequestState'
import SeletorEntidade from '../components/SeletorEntidade'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Modal } from '../components/Ui'
import { useEntidadeGestao } from '../hooks/useEntidadeGestao'
import { useRequest } from '../hooks/useRequest'
import { doacoesService } from '../services/doacoesService'
import { formatarData, formatarMoeda } from '../utils/format'
import { fatiar } from '../utils/paginacao'

const POR_PAGINA = 10
const dataCurta = (instante) => (instante ? formatarData(String(instante).slice(0, 10)) : '—')

// [DEV-GES-05] Doações recebidas (#109): GET /entidades/{id}/doacoes (dona ou ADMIN).
// A API registra só PIX e não tem confirmação de recebimento pela entidade nem doação de
// itens: a tela lista, filtra e detalha o que o servidor devolve.
export default function DoacoesGestao() {
  const { admin, entidadeId, escolher } = useEntidadeGestao()
  return (
    <>
      <div className="breadcrumb">
        Doações <span>/</span> Recebidas
      </div>
      <PageHeader titulo="Gestão de doações recebidas" descricao="Acompanhe as contribuições registradas para a entidade." />
      {admin && <SeletorEntidade valor={entidadeId} onChange={escolher} />}
      {entidadeId ? (
        <Recebidas key={entidadeId} entidadeId={entidadeId} />
      ) : (
        <Aviso>Escolha uma entidade para ver as doações recebidas.</Aviso>
      )}
    </>
  )
}

function Recebidas({ entidadeId }) {
  const request = useRequest((config) => doacoesService.recebidas(entidadeId, {}, config), [entidadeId])
  return <RequestState {...request}>{(doacoes) => <Lista doacoes={doacoes} />}</RequestState>
}

function Lista({ doacoes }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [campanha, setCampanha] = useState('')
  const [pagina, setPagina] = useState(1)
  const [detalhe, setDetalhe] = useState(null)

  const campanhas = useMemo(() => [...new Set(doacoes.map((d) => d.campanha || 'Doação direta à entidade'))].sort(), [doacoes])
  const statusDisponiveis = useMemo(() => [...new Set(doacoes.map((d) => d.status))].sort(), [doacoes])
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return doacoes.filter(
      (d) =>
        (!status || d.status === status) &&
        (!campanha || (d.campanha || 'Doação direta à entidade') === campanha) &&
        (!termo || `${d.doador} ${d.campanha} ${d.comprovante}`.toLocaleLowerCase('pt-BR').includes(termo)),
    )
  }, [doacoes, busca, status, campanha])
  const confirmadas = doacoes.filter((d) => d.status === 'Confirmada')
  const filtrar = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  const colunas = [
    {
      chave: 'doador',
      titulo: 'Doador',
      render: (d) => (
        <>
          <strong>{d.doador}</strong>
          <small>{d.campanha || 'Doação direta à entidade'}</small>
        </>
      ),
    },
    { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
    { chave: 'forma', titulo: 'Pagamento', render: (d) => d.formaPagamento },
    { chave: 'status', titulo: 'Status', render: (d) => <StatusBadge valor={d.status} /> },
    { chave: 'data', titulo: 'Data', render: (d) => dataCurta(d.data) },
    {
      chave: 'acao',
      titulo: 'Ação',
      render: (d) => (
        <button type="button" className="link-botao" onClick={() => setDetalhe(d)} aria-label={`Ver doação ${d.comprovante} de ${d.doador}`}>
          Ver detalhes
        </button>
      ),
    },
  ]

  return (
    <>
      <section className="kpis">
        <KpiCard rotulo="Total confirmado" valor={formatarMoeda(confirmadas.reduce((s, d) => s + d.valor, 0))} />
        <KpiCard rotulo="Doações confirmadas" valor={confirmadas.length} />
        <KpiCard rotulo="Outros status" valor={doacoes.length - confirmadas.length} detalhe="Pendentes ou canceladas não entram na arrecadação" />
      </section>
      <section className="cartao">
        <Filtros
          busca={busca}
          onBusca={filtrar(setBusca)}
          placeholder="Buscar doador, campanha ou comprovante"
          selects={[
            { rotulo: 'Todos os status', valor: status, onChange: filtrar(setStatus), opcoes: statusDisponiveis },
            { rotulo: 'Todas as campanhas', valor: campanha, onChange: filtrar(setCampanha), opcoes: campanhas },
          ]}
        />
        <DataTable
          nome="Doações recebidas"
          colunas={colunas}
          linhas={fatiar(filtradas, pagina, POR_PAGINA)}
          vazio={doacoes.length ? 'Nenhuma doação encontrada com esses filtros.' : 'Nenhuma doação recebida ainda.'}
        />
        <Paginacao pagina={pagina} total={filtradas.length} porPagina={POR_PAGINA} onPagina={setPagina} rotulo="Páginas de doações" />
      </section>
      {detalhe && (
        <Modal titulo="Detalhes da doação" fechar={() => setDetalhe(null)}>
          <div className="pilha">
            <strong>{detalhe.doador}</strong>
            <p>{detalhe.campanha || 'Doação direta à entidade'}</p>
            <div className="lista-linha"><span>Valor</span><strong>{formatarMoeda(detalhe.valor)}</strong></div>
            <div className="lista-linha"><span>Pagamento</span>{detalhe.formaPagamento}</div>
            <div className="lista-linha"><span>Data</span>{dataCurta(detalhe.data)}</div>
            <div className="lista-linha"><span>Status</span><StatusBadge valor={detalhe.status} /></div>
            <div className="lista-linha"><span>Comprovante</span>{detalhe.comprovante}</div>
            {detalhe.observacao && <div className="lista-linha"><span>Mensagem</span>{detalhe.observacao}</div>}
            <Aviso>
              {detalhe.anonima
                ? 'Doação anônima: a identificação do doador não é exibida para a entidade.'
                : 'O pagamento PIX é registrado pelo DoaSync; a liquidação bancária depende de provedor ainda não integrado.'}
            </Aviso>
          </div>
        </Modal>
      )}
    </>
  )
}
