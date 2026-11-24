import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Aviso, Botao, Campo, Etapas, Icon, Secao, Vazio } from '../components/Ui'
import { Progresso } from '../components/CampanhaCard'
import RequestState from '../components/RequestState'
import IdentificacaoDoador from '../components/doacao/IdentificacaoDoador'
import { useCampanhaPublica } from '../hooks/useCampanhasPublicas'
import { doacoesService, novaChaveIdempotencia } from '../services/doacoesService'
import { formatarMoeda } from '../utils/format'
import { valorDoacao } from '../utils/gestao'
import '../styles/doacao.css'

// Doação financeira via PIX (POST /doacoes). A API não tem provedor de pagamento:
// a doação é registrada como confirmada. Itens, cartão/boleto e agendamento não existem na API.
const ETAPAS = ['Sua contribuição', 'Identificação', 'Confirmação']
const TITULOS = ['Qual o valor da sua doação?', 'Quem está doando?', 'Confira e confirme sua doação']

export default function FluxoDoacao() {
  const { id } = useParams()
  const request = useCampanhaPublica(id)
  if (!request.loading && !request.error && !request.data?.recebendoDoacoes)
    return (
      <Vazio principal titulo="Campanha indisponível para doação">
        <Link to="/explorar">Explorar campanhas ativas</Link>
      </Vazio>
    )
  return (
    <RequestState {...request}>
      {(campanha) => <Fluxo key={campanha.id} campanha={campanha} />}
    </RequestState>
  )
}

function Fluxo({ campanha }) {
  const [etapa, setEtapa] = useState(0),
    [valor, setValor] = useState('100'),
    [anonima, setAnonima] = useState(false),
    [observacao, setObservacao] = useState(''),
    [erro, setErro] = useState(''),
    [enviando, setEnviando] = useState(false),
    [chave] = useState(novaChaveIdempotencia),
    [concluida, setConcluida] = useState(null)
  const quantia = valorDoacao(valor)

  function continuarValor(e) {
    e.preventDefault()
    if (!quantia) {
      setErro('Informe um valor maior que zero com até duas casas decimais.')
      return
    }
    setErro('')
    setEtapa(1)
  }

  async function confirmar() {
    setEnviando(true)
    setErro('')
    try {
      const doacao = await doacoesService.registrar(
        { campanhaId: campanha.id, valor: quantia, anonima, observacao: observacao.trim() },
        chave,
      )
      setConcluida(doacao)
    } catch (e) {
      setErro(
        e?.status === 401
          ? 'Sua sessão expirou. Entre novamente para concluir a doação.'
          : (e?.message ?? 'Não foi possível registrar a doação. Tente novamente.'),
      )
    } finally {
      setEnviando(false)
    }
  }

  if (concluida)
    return (
      <section className="public-section doacao-fluxo">
        <div className="breadcrumb">
          <Link to={`/campanhas/${campanha.id}`}>Campanha</Link>
          <span>/</span>Doar
        </div>
        <div className="public-page-title">
          <h1>Doação registrada</h1>
          <p>Obrigado! Sua contribuição já conta no progresso da campanha.</p>
        </div>
        <Secao titulo="Comprovante da doação">
          <ul className="resumo-final">
            <li><span>Comprovante</span><strong>{concluida.comprovante}</strong></li>
            <li><span>Campanha</span><strong>{campanha.nome}</strong></li>
            <li><span>Valor</span><strong>{formatarMoeda(concluida.valor)}</strong></li>
            <li><span>Forma de pagamento</span><strong>{concluida.formaPagamento}</strong></li>
            <li><span>Identificação</span><strong>{concluida.anonima ? 'Doação anônima' : concluida.doador}</strong></li>
            <li><span>Situação</span><strong>{concluida.status}</strong></li>
          </ul>
          <div className="acoes">
            <Botao para={`/campanhas/${campanha.id}`}>Voltar à campanha</Botao>
            <Botao secundario para="/explorar">Explorar outras campanhas</Botao>
          </div>
        </Secao>
      </section>
    )

  return (
    <section className="public-section doacao-fluxo">
      <div className="breadcrumb">
        <Link to={`/campanhas/${campanha.id}`}>Campanha</Link>
        <span>/</span>Doar
      </div>
      <span className="sobretitulo">SUA AJUDA TRANSFORMA HISTÓRIAS</span>
      <div className="public-page-title">
        <h1>{TITULOS[etapa]}</h1>
        <p>Cada contribuição faz a diferença para essa causa.</p>
      </div>
      <Etapas atual={etapa} itens={ETAPAS} />
      <div className="detalhe-grid">
        <div className="fluxo-conteudo">
          {etapa === 0 ? (
            <Secao titulo="Escolha o valor">
              <form onSubmit={continuarValor}>
                <div className="valores-rapidos" role="group" aria-label="Valores sugeridos">
                  {[25, 50, 100, 200].map((v) => (
                    <button
                      type="button"
                      key={v}
                      aria-pressed={valor === String(v)}
                      onClick={() => setValor(String(v))}
                    >
                      {formatarMoeda(v)}
                    </button>
                  ))}
                </div>
                <Campo
                  rotulo="Outro valor (R$)"
                  inputMode="decimal"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Digite um valor"
                />
                <p>Forma de pagamento: <strong>PIX</strong> · contribuição única</p>
                {erro && <Aviso erro>{erro}</Aviso>}
                <div className="acoes">
                  <Botao secundario para={`/campanhas/${campanha.id}`}>Voltar à campanha</Botao>
                  <Botao type="submit">
                    Continuar <Icon nome="seta" />
                  </Botao>
                </div>
              </form>
            </Secao>
          ) : etapa === 1 ? (
            <Secao titulo="Identificação">
              <IdentificacaoDoador
                anonima={anonima}
                onAnonima={setAnonima}
                observacao={observacao}
                onObservacao={setObservacao}
                onVoltar={() => setEtapa(0)}
                onContinuar={() => setEtapa(2)}
              />
            </Secao>
          ) : (
            <Secao titulo="Resumo">
              <ul className="resumo-final">
                <li><span>Campanha</span><strong>{campanha.nome}</strong></li>
                <li><span>Valor</span><strong>{formatarMoeda(quantia)}</strong></li>
                <li><span>Forma de pagamento</span><strong>PIX</strong></li>
                <li><span>Identificação</span><strong>{anonima ? 'Doação anônima' : 'Com seu nome'}</strong></li>
                {observacao.trim() && <li><span>Mensagem</span><strong>{observacao.trim()}</strong></li>}
              </ul>
              <Aviso>
                O pagamento ainda não passa por um provedor: ao confirmar, a doação é registrada e entra no total arrecadado.
              </Aviso>
              {erro && <Aviso erro>{erro}</Aviso>}
              <div className="acoes">
                <Botao secundario onClick={() => setEtapa(1)} disabled={enviando}>Voltar</Botao>
                <Botao onClick={confirmar} disabled={enviando} aria-busy={enviando}>
                  {enviando ? 'Registrando…' : 'Confirmar doação'}
                </Botao>
              </div>
            </Secao>
          )}
        </div>
        <aside className="cartao doar-resumo">
          <img className="resumo-imagem" src={campanha.imagem} alt="" />
          <span className="badge badge--sucesso">Campanha ativa</span>
          <h2>{campanha.nome}</h2>
          <p>{campanha.entidade}</p>
          <Progresso atual={campanha.arrecadado} meta={campanha.meta} />
          <hr />
          <h3>Sua contribuição</h3>
          <strong className="numero-destaque">{formatarMoeda(quantia ?? 0)}</strong>
          <p>PIX · contribuição única</p>
        </aside>
      </div>
    </section>
  )
}
