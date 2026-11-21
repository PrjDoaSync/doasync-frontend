import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { Botao, Icon, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { DOADOR, historicoDoadorDemo } from '../mocks/doador'
import { eventosDoacao } from '../utils/doacoes'
import { formatarData, formatarMoeda } from '../utils/format'
import '../styles/detalhe-doacao.css'

const ICONE = { pendente: 'relogio', recebida: 'check', aplicada: 'itens' }
const IconeCartao = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M3 6h18v12H3z M3 10h18" />
  </svg>
)

// [DEV-DOA-10] Detalhe da doação (#104). Mostra o caminho real da doação
// (pendente → recebida → aplicada). SEM CONTRATO na API: aplicação/destinação,
// mensagem da entidade e PDFs de recibo e comprovante (botões desabilitados).
export default function DetalheDoacao() {
  const { doacaoId } = useParams()
  const { dados } = useDemo()
  const d = (dados.historicoDoador ?? historicoDoadorDemo).find((item) => item.id === doacaoId)

  if (!d)
    return (
      <>
        <Vazio titulo="Doação não encontrada" principal>Verifique o endereço ou volte para suas doações.</Vazio>
        <Botao para="/minhas-doacoes">Minhas doações</Botao>
      </>
    )

  const eventos = eventosDoacao(d)
  const aplicada = d.status === 'Aplicada'
  const financeira = d.tipo === 'Financeira'
  const campanha = dados.campanhas.find((c) => c.id === d.campanhaId)
  const selo = aplicada ? <span className="badge badge--sucesso">Aplicada na campanha</span>
    : d.status === 'Recebida' ? <span className="badge badge--info">Recebida</span> : <StatusBadge valor={d.status} />

  return (
    <section className="public-section det-doacao">
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><Link to="/minhas-doacoes">Minhas doações</Link><span>/</span>{d.id}</div>
      <div className="public-page-title">
        <h1>O caminho da sua contribuição</h1>
        <p>Doação {d.id} · {financeira ? formatarMoeda(d.valor) : d.titulo} · {formatarData(d.data)}. Veja o recebimento, a destinação e a mensagem da {d.entidade}.</p>
      </div>

      <div className="det-resumo">
        <div className="det-resumo__bloco">
          <span className="det-rotulo">Pagamento</span>
          <span className="det-resumo__pagto">{financeira && <IconeCartao />}{d.pagamentoResumo}</span>
        </div>
        <div className="det-resumo__bloco"><span className="det-rotulo">Destinação da doação</span><span>{selo}</span></div>
        <Botao secundario disabled><Icon nome="download" size={16} /> Baixar recibo</Botao>
      </div>

      <div className="detalhe-grid">
        <div className="det-col">
          <div className="det-card">
            <div className="det-cab"><h2>Status da doação</h2>{selo}</div>
            <ol className="det-tl">
              {eventos.map((e) => (
                <li key={e.chave} className={e.estado === 'final' ? 'final' : ''}>
                  <span className={`det-tl__no${e.estado === 'final' ? ' det-tl__no--final' : e.estado === 'futuro' ? ' det-tl__no--futuro' : ''}`}><Icon nome={ICONE[e.chave]} size={16} /></span>
                  <div><strong>{e.titulo}</strong><p>{e.texto}</p></div>
                  <span className="det-tl__quando">{e.quando}</span>
                </li>
              ))}
            </ol>
            {aplicada && (
              <p className="det-nota-ok"><Icon nome="check" size={15} /> O pagamento foi confirmado em {eventos[1].quando.slice(0, 5)}. A aplicação foi registrada em {eventos[2].quando.slice(0, 5)}. Esses registros indicam momentos diferentes da sua doação.</p>
            )}
          </div>

          {d.mensagem && (
            <div className="det-msg">
              <div className="det-msg__cab">
                <span className="det-msg__icone"><Icon nome="doacoes" size={20} /></span>
                <div><strong>Uma mensagem da {d.entidade}</strong><small>{d.mensagem.autor} · {d.mensagem.data}</small></div>
              </div>
              <blockquote>{d.mensagem.texto}</blockquote>
              <small>Mensagem demonstrativa da entidade, vinculada à doação {d.id}.</small>
            </div>
          )}
        </div>

        <aside className="det-lateral">
          <div className="det-card">
            {campanha?.imagem ? <img src={campanha.imagem} alt="" /> : <div style={{ aspectRatio: '5 / 2', background: '#e2e8f0' }} />}
            <div className="det-lateral__corpo">
              <h2>{d.campanha}</h2>
              <span className="det-rotulo" style={{ textTransform: 'none', letterSpacing: 0 }}>{d.entidade} · {campanha?.categoria}</span>
              <hr />
              <strong className="det-valor">{financeira ? formatarMoeda(d.valor) : d.titulo}</strong>
              <dl className="det-linhas">
                <div><dt>Modalidade</dt><dd>{d.subtitulo}</dd></div>
                <div><dt>Doadora</dt><dd>{DOADOR.nome}</dd></div>
                <div><dt>Referência</dt><dd>{d.id}</dd></div>
              </dl>
              <hr />
              <strong>Destinação registrada</strong>
              {d.destinacao ? (
                <>
                  <span className="det-rotulo" style={{ textTransform: 'none', letterSpacing: 0 }}>{d.destinacao.texto}</span>
                  <dl className="det-linhas">
                    <div><dt>Valor aplicado</dt><dd>{formatarMoeda(d.destinacao.valor)}</dd></div>
                    <div><dt>Registro da entidade</dt><dd>{d.destinacao.registro}</dd></div>
                  </dl>
                </>
              ) : (
                <span className="det-rotulo" style={{ textTransform: 'none', letterSpacing: 0 }}>Aguardando destinação. A entidade registrará aqui como o recurso foi usado.</span>
              )}
              <small className="det-rotulo" style={{ textTransform: 'none', letterSpacing: 0 }}>Cenário e documentos demonstrativos, sem validade fiscal ou bancária.</small>
            </div>
          </div>
          <div className="det-baixar"><Botao secundario disabled><Icon nome="arquivo" size={16} /> Baixar comprovante</Botao></div>
        </aside>
      </div>

      <div className="det-rodape">
        <Botao para="/minhas-doacoes" secundario><Icon nome="voltar" /> Voltar a Minhas doações</Botao>
        <Botao para={`/doar/${d.campanhaId}`}><Icon nome="doacoes" /> Apoiar esta campanha novamente</Botao>
      </div>
    </section>
  )
}
