import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Aviso, Botao, Campo, Etapas, Icon, Secao, Vazio } from '../components/Ui'
import { Progresso } from '../components/CampanhaCard'
import RequestState from '../components/RequestState'
import IdentificacaoDoador from '../components/doacao/IdentificacaoDoador'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { entidadesService } from '../services/entidadesService'
import { doacoesService, novaChaveIdempotencia } from '../services/doacoesService'
import { formatarMoeda } from '../utils/format'
import { valorDoacao } from '../utils/gestao'
import '../styles/doacao.css'

// Doação financeira via PIX (POST /doacoes). A API não tem provedor de pagamento:
// a doação é registrada como confirmada. Itens, cartão/boleto e agendamento não existem na API.
const ETAPAS = ['Sua contribuição', 'Identificação', 'Confirmação']
const TITULOS = ['Qual o valor da sua doação?', 'Quem está doando?', 'Confira e confirme sua doação']

export default function FluxoDoacao({ direta = false }) {
  const { id } = useParams()
  return <ConsultaDestino key={`${id}-${direta}`} id={id} direta={direta} />
}

function ConsultaDestino({ id, direta }) {
  const request = useRequest((config) => direta
    ? entidadesService.buscarAprovada(id, config)
    : campanhasService.buscarPublica(id, config), [id, direta])
  const voltar = direta ? '/entidades-publicas' : '/explorar'
  if (!request.loading && !request.error && !(direta ? request.data : request.data?.recebendoDoacoes))
    return (
      <Vazio principal titulo={direta ? "Entidade indisponível para doação" : "Campanha indisponível para doação"}>
        <Link to={voltar}>{direta ? "Ver entidades aprovadas" : "Explorar campanhas ativas"}</Link>
      </Vazio>
    )
  return (
    <RequestState {...request}>
      {(destino) => <Fluxo destino={destino} direta={direta} />}
    </RequestState>
  )
}

function Fluxo({ destino, direta }) {
  const urlDestino = direta ? '/entidades-publicas' : `/campanhas/${destino.id}`
  const urlDoacao = direta ? `/doar/entidade/${destino.id}` : `/doar/${destino.id}`
  const [etapa, setEtapa] = useState(0),
    [valor, setValor] = useState('100'),
    [anonima, setAnonima] = useState(false),
    [observacao, setObservacao] = useState(''),
    [erro, setErro] = useState(''),
    [enviando, setEnviando] = useState(false),
    tentativa = useRef(null),
    navigate = useNavigate()
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
    if (enviando) return
    const dados = {
      ...(direta ? { entidadeId: destino.id } : { campanhaId: destino.id }),
      valor: quantia,
      anonima,
      observacao: observacao.trim(),
    }
    const intencao = JSON.stringify(dados)
    if (tentativa.current?.intencao !== intencao) tentativa.current = { intencao, chave: novaChaveIdempotencia() }
    setEnviando(true)
    setErro('')
    try {
      const doacao = await doacoesService.registrar(dados, tentativa.current.chave)
      // O comprovante tem endereço próprio (GET /doacoes/{id}): pode ser recarregado e revisitado.
      navigate(`${urlDoacao}/confirmacao/${doacao.id}`, { replace: true })
    } catch (e) {
      setErro(
        e?.status === 401
          ? 'Sua sessão expirou. Entre novamente para concluir a doação.'
          : (e?.message ?? 'Não foi possível registrar a doação. Tente novamente.'),
      )
      setEnviando(false)
    }
  }

  return (
    <section className="public-section doacao-fluxo">
      <div className="breadcrumb">
        <Link to={urlDestino}>{direta ? 'Entidades' : 'Campanha'}</Link>
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
                  <Botao secundario para={urlDestino}>{direta ? "Voltar às entidades" : "Voltar à campanha"}</Botao>
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
                <li><span>{direta ? 'Entidade' : 'Campanha'}</span><strong>{destino.nome}</strong></li>
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
          {!direta && <img className="resumo-imagem" src={destino.imagem} alt="" />}
          <span className="badge badge--sucesso">{direta ? 'Entidade aprovada' : 'Campanha ativa'}</span>
          <h2>{destino.nome}</h2>
          {!direta && <><p>{destino.entidade}</p><Progresso atual={destino.arrecadado} meta={destino.meta} /></>}
          <hr />
          <h3>Sua contribuição</h3>
          <strong className="numero-destaque">{formatarMoeda(quantia ?? 0)}</strong>
          <p>PIX · contribuição única</p>
        </aside>
      </div>
    </section>
  )
}
