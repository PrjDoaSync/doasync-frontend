import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Icon, Secao, Vazio } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useMinhasDoacoes } from '../hooks/useDoacao'
import { ehDoador } from '../utils/auth'
import { filtrarDoacoes, mesesDisponiveis, nomeDoMes, primeiroNome, resumoDoacoes } from '../utils/doacoes'
import { formatarData, formatarMoeda } from '../utils/format'

const SEM_FILTRO = { busca: '', status: '', mes: '' }
const qtd = (n) => `${n} ${n === 1 ? 'doação' : 'doações'}`

// Minhas doações (GET /usuarios/me/doacoes): só doador PF/PJ autenticado.
// Sem endpoint na API: exportação do histórico, destinação/aplicação e doação de itens.
export default function MinhasDoacoes() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  if (!usuario)
    return (
      <Vazio principal titulo="Entre para ver suas doações">
        O histórico fica na sua conta de doador. <Link to="/login" state={{ de: pathname }}>Entrar</Link>
      </Vazio>
    )
  if (!ehDoador(usuario.tipo))
    return (
      <Vazio principal titulo="Histórico disponível só para doadores">
        Você entrou como {usuario.nome}. As doações recebidas pela entidade ficam na área de gestão.
      </Vazio>
    )
  return <Historico nome={usuario.nome} />
}

function Historico({ nome }) {
  const request = useMinhasDoacoes()
  return (
    <section className="public-section">
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span>Minha conta<span>/</span>Minhas doações</div>
      <div className="public-page-title">
        <h1>Minhas doações</h1>
        <p>Olá, {primeiroNome(nome)}. Acompanhe as contribuições feitas com a sua conta.</p>
      </div>
      <RequestState {...request}>{(pagina) => <Conteudo doacoes={pagina.itens} total={pagina.total} />}</RequestState>
    </section>
  )
}

function Conteudo({ doacoes, total }) {
  const [filtro, setFiltro] = useState(SEM_FILTRO)
  if (doacoes.length === 0)
    return (
      <Vazio titulo="Você ainda não fez nenhuma doação">
        Explore as campanhas e apoie uma causa. <Link to="/explorar">Explorar campanhas</Link>
      </Vazio>
    )
  const resumo = resumoDoacoes(doacoes)
  const lista = filtrarDoacoes(doacoes, filtro)
  const mudar = (campo) => (e) => setFiltro({ ...filtro, [campo]: e.target.value })

  const colunas = [
    { chave: 'data', titulo: 'Data / comprovante', render: (d) => <><strong>{formatarData(d.data.slice(0, 10))}</strong><br /><small>{d.comprovante}</small></> },
    { chave: 'valor', titulo: 'Contribuição', render: (d) => <><strong>{formatarMoeda(d.valor)}</strong><br /><small>{d.formaPagamento} · única{d.anonima ? ' · anônima' : ''}</small></> },
    { chave: 'campanha', titulo: 'Campanha', render: (d) => <><strong>{d.campanha || 'Doação direta'}</strong><br /><small>{d.entidade}</small></> },
    { chave: 'status', titulo: 'Situação', render: (d) => <StatusBadge valor={d.status} /> },
    { chave: 'acao', titulo: '', render: (d) => <Link className="link-azul" to={`/minhas-doacoes/${d.id}`}>Ver detalhe <Icon nome="chevron" size={14} /></Link> },
  ]

  return (
    <>
      <section className="kpis kpis--3">
        <KpiCard icone="carteira" rotulo="Total doado" valor={formatarMoeda(resumo.totalConfirmado)} detalhe={`${qtd(resumo.confirmadas)} confirmada${resumo.confirmadas === 1 ? '' : 's'}`} />
        <KpiCard icone="campanhas" rotulo="Causas apoiadas" valor={String(resumo.campanhasApoiadas)} detalhe="Campanhas e entidades com doação confirmada" />
        <KpiCard icone="relogio" rotulo="Doações pendentes" valor={qtd(resumo.pendentes)} detalhe="Aguardando confirmação" />
      </section>

      <Secao className="historico" titulo={<>Seu histórico <span className="badge badge--neutro">{qtd(total)}</span></>}>
        <div className="historico__filtros">
          <label className="historico__busca">
            <Icon nome="busca" size={17} />
            <input aria-label="Buscar por campanha, entidade ou comprovante" placeholder="Buscar por campanha, entidade ou comprovante" value={filtro.busca} onChange={mudar('busca')} />
          </label>
          <select aria-label="Situação" value={filtro.status} onChange={mudar('status')}>
            <option value="">Todas as situações</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <select aria-label="Período" value={filtro.mes} onChange={mudar('mes')}>
            <option value="">Todos os meses</option>
            {mesesDisponiveis(doacoes).map((m) => <option key={m} value={m}>{nomeDoMes(m)}</option>)}
          </select>
        </div>
        <DataTable colunas={colunas} linhas={lista} vazio="Nenhuma doação encontrada com esses filtros." />
        <div className="historico__rodape">
          <span>Mostrando {lista.length} de {qtd(doacoes.length)}</span>
          {lista.length < doacoes.length && <Botao secundario onClick={() => setFiltro(SEM_FILTRO)}>Limpar filtros</Botao>}
        </div>
        {total > doacoes.length && <Aviso>Mostrando as {doacoes.length} doações mais recentes de {total}.</Aviso>}
      </Secao>

      <div className="acoes acoes--entre">
        <span />
        <Botao para="/explorar">Explorar campanhas <Icon nome="seta" /></Botao>
      </div>
    </>
  )
}
