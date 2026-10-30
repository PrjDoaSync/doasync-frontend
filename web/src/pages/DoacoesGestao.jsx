import { useState } from 'react'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import Filtros from '../components/Filtros'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Modal } from '../components/Ui'
import { filtrarRegistros } from '../utils/gestao'
import { formatarData } from '../utils/format'

export default function DoacoesGestao() {
  const { dados, atualizar, notificar } = useDemo(),
    [busca, setBusca] = useState(''),
    [status, setStatus] = useState(''),
    [tipo, setTipo] = useState(''),
    [detalhe, setDetalhe] = useState(null)
  const doacoesEntidade = dados.doacoes.filter(
    (d) => d.entidadeId === dados.entidade.id,
  )
  const filtradas = filtrarRegistros(doacoesEntidade, { busca, status, tipo })
  function confirmar() {
    atualizar(
      'doacoes',
      dados.doacoes.map((d) =>
        d.id === detalhe.id
          ? { ...d, recebimento: 'Confirmado', status: 'Confirmada' }
          : d,
      ),
    )
    setDetalhe(null)
    notificar(
      'Recebimento confirmado na demonstração. Nenhuma doação real foi alterada.',
    )
  }
  return (
    <>
      <div className="breadcrumb">
        Doações <span>/</span> Recebidas
      </div>
      <PageHeader
        titulo="Gestão de doações recebidas"
        descricao="Confira os pagamentos e acompanhe o recebimento das contribuições."
      />
      <section className="kpis">
        <KpiCard
          rotulo="Doações confirmadas"
          valor={
            doacoesEntidade.filter((d) => d.status === 'Confirmada').length
          }
        />
        <KpiCard
          rotulo="Aguardando confirmação"
          valor={doacoesEntidade.filter((d) => d.status === 'Pendente').length}
        />
        <KpiCard
          rotulo="Canceladas"
          valor={doacoesEntidade.filter((d) => d.status === 'Cancelada').length}
        />
      </section>
      <section className="cartao">
        <Filtros
          busca={busca}
          onBusca={setBusca}
          placeholder="Buscar doador, campanha ou contribuição"
          selects={[
            {
              rotulo: 'Todos os status',
              valor: status,
              onChange: setStatus,
              opcoes: ['Confirmada', 'Pendente', 'Cancelada'],
            },
            {
              rotulo: 'Todos os tipos',
              valor: tipo,
              onChange: setTipo,
              opcoes: ['Financeira', 'Itens'],
            },
          ]}
        />
        <DataTable
          linhas={filtradas}
          colunas={[
            {
              chave: 'doador',
              titulo: 'Doador',
              render: (d) => (
                <>
                  <strong>{d.doador}</strong>
                  <small>{d.campanha}</small>
                </>
              ),
            },
            {
              chave: 'detalhe',
              titulo: 'Contribuição',
              render: (d) => (
                <>
                  {d.detalhe}
                  <small>{d.tipo}</small>
                </>
              ),
            },
            {
              chave: 'pagamento',
              titulo: 'Pagamento',
              render: (d) => <StatusBadge valor={d.pagamento} />,
            },
            {
              chave: 'recebimento',
              titulo: 'Recebimento',
              render: (d) => <StatusBadge valor={d.recebimento} />,
            },
            {
              chave: 'data',
              titulo: 'Data',
              render: (d) => formatarData(d.data),
            },
            {
              chave: 'acao',
              titulo: 'Ação',
              render: (d) => (
                <button
                  className="link-botao"
                  onClick={() => setDetalhe(d)}
                  aria-label={`Ver doação ${d.id} de ${d.doador}`}
                >
                  Ver detalhes
                </button>
              ),
            },
          ]}
        />
      </section>
      {detalhe && (
        <Modal titulo="Detalhes da doação" fechar={() => setDetalhe(null)}>
          <div className="pilha">
            <strong>{detalhe.doador}</strong>
            <p>{detalhe.campanha}</p>
            <div className="lista-linha">
              <span>Contribuição</span>
              <strong>{detalhe.detalhe}</strong>
            </div>
            <div className="lista-linha">
              <span>Data</span>
              {formatarData(detalhe.data)}
            </div>
            <div className="lista-linha">
              <span>Status</span>
              <StatusBadge valor={detalhe.status} />
            </div>
            <div className="lista-linha">
              <span>Destinação</span>
              {detalhe.destinacao}
            </div>
            {detalhe.tipo === 'Itens' && detalhe.status === 'Pendente' ? (
              <Botao onClick={confirmar}>
                Confirmar recebimento na demonstração
              </Botao>
            ) : (
              <Aviso>
                {detalhe.tipo === 'Financeira'
                  ? 'O status financeiro será recebido do provedor de pagamento após integração.'
                  : 'Recebimento já processado nesta amostra.'}
              </Aviso>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
