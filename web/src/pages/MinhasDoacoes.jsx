import { useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import StatusBadge from '../components/StatusBadge'
import { Botao, Icon, Secao, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { DOADOR, historicoDoadorDemo } from '../mocks/doador'
import { filtrarDoacoes, mesesDisponiveis, nomeDoMes, primeiroNome, resumoDoador } from '../utils/doacoes'
import { formatarData, formatarMoeda } from '../utils/format'

const SEM_FILTRO = { busca: '', tipo: '', status: '', mes: '' }
const qtd = (n) => `${n} ${n === 1 ? 'doação' : 'doações'}`
const selo = (status) =>
  status === 'Recebida' ? <span className="badge badge--info">Recebida</span>
  : status === 'Aplicada' ? <span className="badge badge--sucesso">Aplicada</span>
  : <StatusBadge valor={status} />

// [DEV-DOA-09] Minhas doações (#103). Conta de demonstração (sem login ainda).
// SEM CONTRATO na API: exportar histórico, cartão/boleto, "Aplicada" e a tela DOA-10
// (o "Ver detalhe" leva à confirmação enquanto o detalhe não existe).
export default function MinhasDoacoes() {
  const { dados } = useDemo()
  const [filtro, setFiltro] = useState(SEM_FILTRO)
  const minhas = dados.historicoDoador ?? historicoDoadorDemo
  const resumo = resumoDoador(minhas)
  const lista = filtrarDoacoes(minhas, filtro)
  const mudar = (campo) => (e) => setFiltro({ ...filtro, [campo]: e.target.value })

  const colunas = [
    { chave: 'data', titulo: 'Data / código', render: (d) => <><strong>{formatarData(d.data)}</strong><br /><small>{d.id}</small></> },
    { chave: 'titulo', titulo: 'Contribuição', render: (d) => <><strong>{d.titulo}</strong><br /><small>{d.subtitulo}</small></> },
    { chave: 'campanha', titulo: 'Campanha', render: (d) => <><strong>{d.campanha}</strong><br /><small>{d.entidade}</small></> },
    { chave: 'pagamento', titulo: 'Pagamento', render: (d) => <><strong>{d.pagamento}</strong><br /><small>{d.pagamentoSub}</small></> },
    { chave: 'status', titulo: 'Destinação', render: (d) => <>{selo(d.status)}<br /><small>{d.statusSub}</small></> },
    { chave: 'acao', titulo: '', render: (d) => <Link className="link-azul" to={`/doar/${d.campanhaId}/confirmacao/${d.id}`}>Ver detalhe <Icon nome="chevron" size={14} /></Link> },
  ]

  return (
    <section className="public-section">
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span>Minha conta<span>/</span>Minhas doações</div>
      <div className="public-page-title">
        <h1>Minhas doações</h1>
        <p>Olá, {primeiroNome(DOADOR.nome)}. Acompanhe suas contribuições, consulte documentos e veja como cada doação está ajudando.</p>
      </div>

      {minhas.length === 0 ? (
        <Vazio titulo="Você ainda não fez nenhuma doação">Explore as campanhas e apoie uma causa.</Vazio>
      ) : (
        <>
          <section className="kpis kpis--3">
            <KpiCard icone="carteira" rotulo="Doações financeiras confirmadas" valor={formatarMoeda(resumo.financeiroConfirmado)} detalhe={`${resumo.contribuicoes} contribuições${resumo.pagamentosPendentes ? ' · pagamento pendente não incluído' : ''}`} />
            <KpiCard icone="itens" rotulo="Itens recebidos pela entidade" valor={`${resumo.itensRecebidos} unidades`} detalhe={[resumo.itensDescricao, resumo.itensAgendados ? `mais ${resumo.itensAgendados} unidades agendadas` : ''].filter(Boolean).join(' · ') || 'Nenhuma entrega conferida ainda'} />
            <KpiCard icone="relogio" rotulo="Doações pendentes" valor={qtd(resumo.pagamentosPendentes + resumo.entregasPendentes)} detalhe={`${resumo.pagamentosPendentes} aguardando pagamento · ${resumo.entregasPendentes} aguardando entrega`} />
          </section>

          <Secao className="historico" titulo={<>Seu histórico <span className="badge badge--neutro">{qtd(minhas.length)}</span></>} acao={<Botao secundario disabled><Icon nome="download" /> Exportar histórico</Botao>}>
            <div className="historico__filtros">
              <label className="historico__busca">
                <Icon nome="busca" size={17} />
                <input aria-label="Buscar por campanha ou código da doação" placeholder="Buscar por campanha ou código da doação" value={filtro.busca} onChange={mudar('busca')} />
              </label>
              <select aria-label="Tipo" value={filtro.tipo} onChange={mudar('tipo')}>
                <option value="">Todos os tipos</option>
                <option value="Financeira">Financeira</option>
                <option value="Itens">Itens</option>
              </select>
              <select aria-label="Status" value={filtro.status} onChange={mudar('status')}>
                <option value="">Todos os status</option>
                <option value="Recebida">Recebida</option>
                <option value="Pendente">Pendente</option>
                <option value="Aplicada">Aplicada</option>
              </select>
              <select aria-label="Período" value={filtro.mes} onChange={mudar('mes')}>
                <option value="">Todos os meses</option>
                {mesesDisponiveis(minhas).map((m) => <option key={m} value={m}>{nomeDoMes(m)}</option>)}
              </select>
            </div>
            <DataTable colunas={colunas} linhas={lista} vazio="Nenhuma doação encontrada com esses filtros." />
            <div className="historico__rodape">
              <span>Mostrando {lista.length} de {qtd(minhas.length)}</span>
              {lista.length < minhas.length ? <Botao secundario onClick={() => setFiltro(SEM_FILTRO)}>Limpar filtros</Botao> : <span className="pagina-atual">1</span>}
            </div>
          </Secao>

          <div className="acoes acoes--entre">
            <small className="nota-info"><Icon nome="info" size={16} /> Pagamento e destinação são diferentes: recebida indica confirmação pela entidade; aplicada indica uso na campanha. Dados e documentos demonstrativos.</small>
            <Botao para="/explorar">Explorar campanhas <Icon nome="seta" /></Botao>
          </div>
        </>
      )}
    </section>
  )
}
