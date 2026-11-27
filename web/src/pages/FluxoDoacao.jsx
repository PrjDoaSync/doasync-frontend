import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Aviso, Botao, Campo, Etapas, Icon, Secao, Vazio } from '../components/Ui'
import { Progresso } from '../components/CampanhaCard'
import RequestState from '../components/RequestState'
import Agendamento from '../components/doacao/Agendamento'
import IdentificacaoDoador from '../components/doacao/IdentificacaoDoador'
import PagamentoCartaoBoleto from '../components/doacao/PagamentoCartaoBoleto'
import PagamentoPix from '../components/doacao/PagamentoPix'
import SelecaoItens from '../components/doacao/SelecaoItens'
import { useCampanhaPublica } from '../hooks/useCampanhasPublicas'
import { useRequest } from '../hooks/useRequest'
import { ITENS_EXEMPLO } from '../mocks/itensDemo'
import { doacoesService, novaChaveIdempotencia } from '../services/doacoesService'
import { entidadesService } from '../services/entidadesService'
import { IMAGEM_PADRAO } from '../services/mappers'
import { hojeISO } from '../utils/campanhas'
import { itensEscolhidos, validarItens } from '../utils/doacao'
import { formatarData, formatarMoeda } from '../utils/format'
import { valorDoacao } from '../utils/gestao'
import '../styles/doacao.css'

// Fluxo de doação (DOA-01 a DOA-07, #95 a #101) para uma campanha (/doar/:id) ou direto para
// uma entidade aprovada (/doar/entidade/:id). Integrado: doação financeira via PIX (POST /doacoes,
// com Idempotency-Key). A API ainda não tem provedor de pagamento: nada é cobrado. Cartão,
// boleto, itens e agendamento mostram as telas do protótipo e a pendência (services/indisponivel.js).
const ETAPAS = {
  Financeira: ['Tipo de doação', 'Sua contribuição', 'Identificação', 'Pagamento'],
  Itens: ['Tipo de doação', 'Itens', 'Identificação', 'Agendamento', 'Revisão'],
}
const TITULOS = {
  Financeira: ['Como você quer ajudar?', 'Qual o valor da sua doação?', 'Quem está doando?', 'Finalize sua doação'],
  Itens: ['Como você quer ajudar?', 'Quais itens você vai doar?', 'Quem está doando?', 'Quando os itens chegam?', 'Confira sua doação de itens'],
}
const METODOS = [
  ['PIX', 'Registro imediato na plataforma'],
  ['Cartão', 'Crédito · aguardando integração'],
  ['Boleto', 'Documento para pagamento · aguardando integração'],
]
const AGENDAMENTO_INICIAL = { modo: 'entrega', data: '', janela: '', endereco: '' }

export default function FluxoDoacao({ direta = false }) {
  const { id } = useParams()
  return direta ? <DoacaoEntidade id={id} /> : <DoacaoCampanha id={id} />
}

function DoacaoCampanha({ id }) {
  const request = useCampanhaPublica(id)
  if (!request.loading && !request.error && !request.data?.recebendoDoacoes)
    return (
      <Vazio principal titulo="Campanha indisponível para doação">
        <Link to="/explorar">Explorar campanhas ativas</Link>
      </Vazio>
    )
  return (
    <RequestState {...request}>
      {(c) => (
        <Fluxo
          key={c.id}
          destino={{
            tipo: 'campanha',
            id: c.id,
            nome: c.nome,
            entidade: c.entidade,
            cidade: c.cidade,
            imagem: c.imagem,
            arrecadado: c.arrecadado,
            meta: c.meta,
            encerraEm: c.encerraEm,
            voltar: `/campanhas/${c.id}`,
          }}
        />
      )}
    </RequestState>
  )
}

function DoacaoEntidade({ id }) {
  const request = useRequest((config) => entidadesService.buscarPublica(id, config), [id])
  return (
    <RequestState
      {...request}
      naoEncontrado={
        <Vazio principal titulo="Entidade indisponível para doação">
          <Link to="/entidades-publicas">Ver entidades aprovadas</Link>
        </Vazio>
      }
    >
      {(e) => (
        <Fluxo
          key={e.id}
          destino={{
            tipo: 'entidade',
            id: e.id,
            nome: e.nome,
            entidade: e.nome,
            cidade: e.endereco?.cidade ? [e.endereco.cidade, e.endereco.uf].filter(Boolean).join(', ') : '',
            imagem: e.logoUrl || IMAGEM_PADRAO,
            encerraEm: '',
            voltar: `/entidades-publicas/${e.id}`,
          }}
        />
      )}
    </RequestState>
  )
}

function Fluxo({ destino }) {
  const navigate = useNavigate()
  const hoje = hojeISO()
  const [etapa, setEtapa] = useState(0)
  const [tipo, setTipo] = useState('Financeira')
  const [valor, setValor] = useState('100')
  const [metodo, setMetodo] = useState('PIX')
  const [anonima, setAnonima] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [selecao, setSelecao] = useState({})
  const [agendamento, setAgendamento] = useState(AGENDAMENTO_INICIAL)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [chave] = useState(novaChaveIdempotencia)
  const financeira = tipo === 'Financeira'
  const quantia = valorDoacao(valor)
  const escolhidos = itensEscolhidos(selecao)
  const totalItens = escolhidos.reduce((soma, i) => soma + i.quantidade, 0)
  const ir = (proxima) => {
    setErro('')
    setEtapa(proxima)
  }

  function continuarValor(e) {
    e.preventDefault()
    if (!quantia) {
      setErro('Informe um valor maior que zero com até duas casas decimais.')
      return
    }
    ir(2)
  }

  function continuarItens() {
    const limites = Object.fromEntries(ITENS_EXEMPLO.map((i) => [i.nome, Math.max(i.meta - i.recebido, 0)]))
    const mensagem = validarItens(selecao, limites)
    if (mensagem) {
      setErro(mensagem)
      return
    }
    ir(2)
  }

  async function confirmarPix() {
    setEnviando(true)
    setErro('')
    try {
      const destinoApi = destino.tipo === 'campanha' ? { campanhaId: destino.id } : { entidadeId: destino.id }
      const doacao = await doacoesService.registrar(
        { ...destinoApi, valor: quantia, anonima, observacao: observacao.trim() },
        chave,
      )
      // O comprovante tem endereço próprio (GET /doacoes/{id}): pode ser recarregado e revisitado.
      const base = destino.tipo === 'campanha' ? `/doar/${destino.id}` : `/doar/entidade/${destino.id}`
      navigate(`${base}/confirmacao/${doacao.id}`, { replace: true })
    } catch (e) {
      setErro(
        e?.status === 401
          ? 'Sua sessão expirou. Entre novamente para concluir a doação.'
          : (e?.message ?? 'Não foi possível registrar a doação. Tente novamente.'),
      )
      setEnviando(false)
    }
  }

  async function enviarItens() {
    setEnviando(true)
    setErro('')
    try {
      await doacoesService.registrarItens({
        ...(destino.tipo === 'campanha' ? { campanhaId: destino.id } : { entidadeId: destino.id }),
        itens: escolhidos,
        agendamento,
        anonima,
        observacao: observacao.trim(),
      })
    } catch (e) {
      setErro(`${e?.message ?? 'Não foi possível registrar a doação de itens.'} Nada foi registrado.`)
    } finally {
      setEnviando(false)
    }
  }

  const resumoFinanceiro = [
    [destino.tipo === 'campanha' ? 'Campanha' : 'Entidade', destino.nome],
    ['Valor', formatarMoeda(quantia ?? 0)],
    ['Forma de pagamento', metodo],
    ['Identificação', anonima ? 'Doação anônima' : 'Com seu nome'],
    ...(observacao.trim() ? [['Mensagem', observacao.trim()]] : []),
  ]

  let conteudo
  if (etapa === 0) {
    conteudo = (
      <Secao titulo="Escolha o tipo de doação">
        <fieldset className="opcoes-doacao">
          <legend className="sr-only">Tipo de doação</legend>
          {[
            ['Financeira', 'carteira', 'Doação financeira', 'Contribua com qualquer valor via PIX. Cartão e boleto aguardam integração.'],
            ['Itens', 'itens', 'Doação de itens', 'Alimentos, roupas e outros itens, com entrega ou retirada agendada. Aguardando integração.'],
          ].map(([valorTipo, icone, titulo, texto]) => (
            <label key={valorTipo} className={`opcao-card ${tipo === valorTipo ? 'opcao-card--ativa' : ''}`}>
              <input type="radio" name="tipo-doacao" value={valorTipo} checked={tipo === valorTipo} onChange={() => setTipo(valorTipo)} />
              <Icon nome={icone} size={26} />
              <strong>{titulo}</strong>
              <p>{texto}</p>
            </label>
          ))}
        </fieldset>
        <div className="acoes">
          <Botao secundario para={destino.voltar}>{destino.tipo === 'campanha' ? 'Voltar à campanha' : 'Voltar à entidade'}</Botao>
          <Botao onClick={() => ir(1)}>
            {financeira ? 'Continuar com doação financeira' : 'Continuar com doação de itens'} <Icon nome="seta" />
          </Botao>
        </div>
      </Secao>
    )
  } else if (etapa === 1 && financeira) {
    conteudo = (
      <Secao titulo="Escolha o valor">
        <form onSubmit={continuarValor}>
          <div className="valores-rapidos" role="group" aria-label="Valores sugeridos">
            {[25, 50, 100, 200].map((v) => (
              <button type="button" key={v} aria-pressed={valor === String(v)} onClick={() => setValor(String(v))}>
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
          <fieldset className="metodos">
            <legend>Forma de pagamento</legend>
            {METODOS.map(([m, texto]) => (
              <label className={m === metodo ? 'selecionado' : ''} key={m}>
                <input type="radio" name="metodo" value={m} checked={m === metodo} onChange={() => setMetodo(m)} />
                <strong>{m}</strong>
                <small>{texto}</small>
              </label>
            ))}
          </fieldset>
          <p>Contribuição única.</p>
          {erro && <Aviso erro>{erro}</Aviso>}
          <div className="acoes">
            <Botao secundario onClick={() => ir(0)}>Voltar</Botao>
            <Botao type="submit">
              Continuar <Icon nome="seta" />
            </Botao>
          </div>
        </form>
      </Secao>
    )
  } else if (etapa === 1) {
    conteudo = (
      <SelecaoItens
        itens={ITENS_EXEMPLO}
        selecao={selecao}
        onChange={(nome, quantidade) => setSelecao((atual) => ({ ...atual, [nome]: quantidade }))}
        erro={erro}
        onVoltar={() => ir(0)}
        onContinuar={continuarItens}
      />
    )
  } else if (etapa === 2) {
    conteudo = (
      <Secao titulo="Identificação">
        <IdentificacaoDoador
          anonima={anonima}
          onAnonima={setAnonima}
          observacao={observacao}
          onObservacao={setObservacao}
          onVoltar={() => ir(1)}
          onContinuar={() => ir(3)}
        />
      </Secao>
    )
  } else if (etapa === 3 && financeira && metodo === 'PIX') {
    conteudo = (
      <PagamentoPix
        valor={quantia}
        resumo={resumoFinanceiro}
        enviando={enviando}
        erro={erro}
        onVoltar={() => ir(2)}
        onConfirmar={confirmarPix}
      />
    )
  } else if (etapa === 3 && financeira) {
    conteudo = (
      <PagamentoCartaoBoleto
        metodo={metodo}
        valor={quantia}
        destino={destino}
        hoje={hoje}
        onVoltar={() => ir(2)}
        onUsarPix={() => setMetodo('PIX')}
      />
    )
  } else if (etapa === 3) {
    conteudo = (
      <Agendamento
        destino={destino}
        hoje={hoje}
        valorInicial={agendamento}
        enviando={enviando}
        erro={erro}
        onVoltar={() => ir(2)}
        onConcluir={(dados) => {
          setAgendamento(dados)
          ir(4)
        }}
      />
    )
  } else {
    conteudo = (
      <Secao titulo="Resumo da doação de itens">
        <ul className="resumo-final">
          <li><span>{destino.tipo === 'campanha' ? 'Campanha' : 'Entidade'}</span><strong>{destino.nome}</strong></li>
          {escolhidos.map((i) => (
            <li key={i.nome}><span>{i.nome}</span><strong>{i.quantidade} un.</strong></li>
          ))}
          <li>
            <span>{agendamento.modo === 'retirada' ? 'Retirada' : 'Entrega'}</span>
            <strong>{formatarData(agendamento.data)} · {agendamento.janela}</strong>
          </li>
          {agendamento.modo === 'retirada' && <li><span>Endereço</span><strong>{agendamento.endereco}</strong></li>}
          <li><span>Identificação</span><strong>{anonima ? 'Doação anônima' : 'Com seu nome'}</strong></li>
        </ul>
        {erro && <Aviso erro>{erro}</Aviso>}
        <div className="acoes">
          <Botao secundario onClick={() => ir(3)} disabled={enviando}>Voltar</Botao>
          <Botao onClick={enviarItens} disabled={enviando} aria-busy={enviando}>
            {enviando ? 'Enviando…' : 'Enviar doação de itens'}
          </Botao>
        </div>
      </Secao>
    )
  }

  return (
    <section className="public-section doacao-fluxo">
      <div className="breadcrumb">
        <Link to={destino.voltar}>{destino.tipo === 'campanha' ? 'Campanha' : 'Entidade'}</Link>
        <span>/</span>Doar
      </div>
      <span className="sobretitulo">SUA AJUDA TRANSFORMA HISTÓRIAS</span>
      <div className="public-page-title">
        <h1>{TITULOS[tipo][etapa]}</h1>
        <p>Cada contribuição faz a diferença para essa causa.</p>
      </div>
      <Etapas atual={etapa} itens={ETAPAS[tipo]} />
      <div className="detalhe-grid">
        <div className="fluxo-conteudo">{conteudo}</div>
        <aside className="cartao doar-resumo" aria-label="Resumo da doação">
          <img className="resumo-imagem" src={destino.imagem} alt="" />
          <span className="badge badge--sucesso">{destino.tipo === 'campanha' ? 'Campanha ativa' : 'Entidade aprovada'}</span>
          <h2>{destino.nome}</h2>
          {destino.tipo === 'campanha' && <p>{destino.entidade}</p>}
          {destino.tipo === 'campanha' && <Progresso atual={destino.arrecadado} meta={destino.meta} />}
          <hr />
          <h3>Sua contribuição</h3>
          {financeira ? (
            <>
              <strong className="numero-destaque">{formatarMoeda(quantia ?? 0)}</strong>
              <p>{metodo} · contribuição única</p>
            </>
          ) : (
            <>
              <strong className="numero-destaque">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</strong>
              <p>Doação de itens · aguardando integração</p>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
