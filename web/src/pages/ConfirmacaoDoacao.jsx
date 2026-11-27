import { Link, useLocation, useParams } from 'react-router-dom'
import { Aviso, Botao, Icon, Secao, Vazio } from '../components/Ui'
import RequestState from '../components/RequestState'
import { useAuth } from '../hooks/useAuth'
import { useDoacao } from '../hooks/useDoacao'
import { formatarData, formatarMoeda } from '../utils/format'

const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Comprovante da doação (GET /doacoes/{id}). Exige login: o backend só mostra a doação ao
// próprio doador, à entidade destino ou a um ADMIN (para os demais responde 404, RN71).
// Sem endpoint na API: PDF de comprovante/recibo, reenvio por e-mail e destinação do recurso.
// `historico`: aberto a partir de Minhas doações (/minhas-doacoes/:doacaoId), com título de detalhe.
export default function ConfirmacaoDoacao({ historico = false }) {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  if (!usuario)
    return (
      <Vazio principal titulo="Entre para ver o comprovante">
        O comprovante só aparece para quem fez a doação.{' '}
        <Link to="/login" state={{ de: pathname }}>Entrar</Link>
      </Vazio>
    )
  return <Comprovante historico={historico} />
}

function Comprovante({ historico }) {
  const { doacaoId } = useParams()
  const request = useDoacao(doacaoId)
  if (!request.loading && !request.error && !request.data)
    return (
      <Vazio principal titulo="Doação não encontrada">
        Verifique o endereço ou consulte suas doações. <Link to="/minhas-doacoes">Minhas doações</Link>
      </Vazio>
    )
  return <RequestState {...request}>{(d) => <ComprovanteConteudo d={d} historico={historico} />}</RequestState>
}

function ComprovanteConteudo({ d, historico }) {
  const confirmada = d.status === 'Confirmada'
  return (
    <section className="public-section doacao-fluxo confirmacao">
      {historico ? (
        <div className="breadcrumb">
          <Link to="/">Início</Link><span>/</span><Link to="/minhas-doacoes">Minhas doações</Link><span>/</span>{d.comprovante}
        </div>
      ) : (
        <div className="breadcrumb">
          <Link to="/explorar">Campanhas</Link>
          <span>/</span>
          {d.campanhaId ? <Link to={`/campanhas/${d.campanhaId}`}>{d.campanha}</Link> : d.entidade}
          <span>/</span>Comprovante
        </div>
      )}
      <div className="public-page-title">
        <h1>
          {historico
            ? `Doação ${d.comprovante}`
            : confirmada ? 'Sua doação foi registrada. Obrigado!' : `Doação ${d.status.toLowerCase()}`}
        </h1>
        <p>
          {confirmada
            ? `Sua contribuição de ${formatarMoeda(d.valor)} já conta para ${d.campanha || d.entidade}.`
            : 'Acompanhe a situação desta doação em Minhas doações.'}
        </p>
      </div>

      <div className={`banner-status${confirmada ? '' : ' banner-status--pendente'}`} role="status">
        <span className="banner-status__icone"><Icon nome={confirmada ? 'check' : 'relogio'} size={20} /></span>
        <div>
          <strong>{confirmada ? `Pagamento confirmado · ${d.formaPagamento}` : `Situação: ${d.status}`}</strong>
          <small>{formatarData(d.data.slice(0, 10))} às {hora(d.data)} · Comprovante {d.comprovante}</small>
        </div>
        <span className="banner-status__selo">{d.status}</span>
      </div>

      <Secao className="comprovante" titulo="Comprovante">
        <dl className="linhas-resumo">
          <div><dt>Comprovante</dt><dd><strong>{d.comprovante}</strong></dd></div>
          {d.campanhaId && <div><dt>Campanha</dt><dd><strong>{d.campanha}</strong></dd></div>}
          <div><dt>Entidade beneficiária</dt><dd><strong>{d.entidade}</strong></dd></div>
          <div><dt>Doador</dt><dd><strong>{d.anonima ? `${d.doador} · doação anônima` : d.doador}</strong></dd></div>
          <div><dt>Pagamento</dt><dd><strong>{d.formaPagamento} · contribuição única</strong></dd></div>
          <div><dt>Data</dt><dd><strong>{formatarData(d.data.slice(0, 10))} · {hora(d.data)}</strong></dd></div>
          {d.observacao && <div><dt>Mensagem</dt><dd><strong>{d.observacao}</strong></dd></div>}
        </dl>
        <div className="total-linha">
          <span>Valor</span>
          <strong className="numero-destaque">{formatarMoeda(d.valor)}</strong>
        </div>
        <Aviso>O comprovante em PDF e o envio por e-mail ainda não existem na API.</Aviso>
      </Secao>

      <div className="acoes acoes--entre">
        {historico ? (
          <Botao para="/minhas-doacoes" secundario><Icon nome="voltar" /> Voltar a Minhas doações</Botao>
        ) : (
          d.campanhaId && <Botao para={`/campanhas/${d.campanhaId}`} secundario><Icon nome="voltar" /> Voltar à campanha</Botao>
        )}
        {historico && d.campanhaId ? (
          <Botao para={`/doar/${d.campanhaId}`}><Icon nome="doacoes" /> Apoiar esta campanha novamente</Botao>
        ) : (
          <Botao para="/minhas-doacoes"><Icon nome="doacoes" /> Minhas doações</Botao>
        )}
      </div>
    </section>
  )
}
