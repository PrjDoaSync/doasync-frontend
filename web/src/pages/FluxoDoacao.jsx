import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import {
  Aviso,
  Botao,
  Campo,
  Etapas,
  Icon,
  Secao,
  Vazio,
} from '../components/Ui'
import { Progresso } from '../components/CampanhaCard'
import { formatarMoeda } from '../utils/format'
import { valorDoacao } from '../utils/gestao'

export default function FluxoDoacao() {
  const { id } = useParams(),
    { dados } = useDemo(),
    [etapa, setEtapa] = useState(0),
    [tipo, setTipo] = useState('Financeira'),
    [valor, setValor] = useState('100'),
    [metodo, setMetodo] = useState('PIX'),
    [identificacao, setIdentificacao] = useState('rapido'),
    [doador, setDoador] = useState({ nome: '', email: '' }),
    [erro, setErro] = useState(''),
    [aviso, setAviso] = useState('')
  const campanha = dados.campanhas.find(
    (c) => String(c.id) === id && c.status === 'Ativa',
  )
  if (!campanha)
    return (
      <Vazio principal titulo="Campanha indisponível para doação">
        <Link to="/explorar">Explorar campanhas ativas</Link>
      </Vazio>
    )
  const titulos = [
    'Como você quer ajudar?',
    'Qual o valor da sua doação?',
    'Como você prefere se identificar?',
  ]
  function proxima(e) {
    e?.preventDefault()
    setErro('')
    setAviso('')
    if (etapa === 1 && !valorDoacao(valor)) {
      setErro('Informe um valor maior que zero com até duas casas decimais.')
      return
    }
    setEtapa((e) => Math.min(e + 1, 2))
  }
  function identificar(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    if (identificacao !== 'anonimo' && (!f.nome?.trim() || !f.email?.trim())) {
      setErro('Informe seu nome e e-mail.')
      return
    }
    setDoador({
      nome: f.nome?.trim() ?? 'Doador anônimo',
      email: f.email?.trim() ?? '',
    })
    setErro('')
    setAviso(
      `Identificação preenchida para a contribuição de ${formatarMoeda(valorDoacao(valor) ?? 0)} por ${metodo}. A próxima tela de pagamento depende de outra entrega. Nenhuma cobrança, QR Code ou boleto foi gerado e a doação não foi registrada.`,
    )
  }
  return (
    <section className="public-section doacao-fluxo">
      <div className="breadcrumb">
        <Link to={`/campanhas/${campanha.id}`}>Campanha</Link>
        <span>/</span>Doar
      </div>
      <span className="sobretitulo">SUA AJUDA TRANSFORMA HISTÓRIAS</span>
      <div className="public-page-title">
        <h1>{titulos[etapa]}</h1>
        <p>
          Escolha como contribuir com essa causa. Cada gesto faz a diferença.
        </p>
      </div>
      <Etapas
        atual={etapa}
        itens={[
          'Tipo de doação',
          'Sua contribuição',
          'Identificação',
          'Pagamento',
        ]}
      />
      <div className="detalhe-grid">
        <div className="fluxo-conteudo">
          {etapa === 0 ? (
            <Secao titulo="Escolha o tipo de doação">
              <fieldset className="opcoes-doacao">
                <legend className="sr-only">Tipo de doação</legend>
                {[
                  [
                    'Financeira',
                    'doacoes',
                    'Doação financeira',
                    'Contribua com qualquer valor. Escolha entre PIX, cartão ou boleto.',
                  ],
                  [
                    'Itens',
                    'itens',
                    'Doação de itens',
                    'Ajude com alimentos, roupas e outros itens de que a campanha precisa.',
                  ],
                ].map(([value, icone, titulo, texto]) => (
                  <label
                    key={value}
                    className={`opcao-card ${tipo === value ? 'opcao-card--ativa' : ''}`}
                  >
                    <input
                      type="radio"
                      name="tipo-doacao"
                      value={value}
                      checked={tipo === value}
                      onChange={() => setTipo(value)}
                    />
                    <Icon nome={icone} size={26} />
                    <strong>{titulo}</strong>
                    <p>{texto}</p>
                  </label>
                ))}
              </fieldset>
              {tipo === 'Itens' && (
                <Aviso>
                  A seleção de itens e o agendamento fazem parte das próximas
                  entregas desse fluxo. Você pode consultar as necessidades na
                  campanha.
                </Aviso>
              )}
              <div className="acoes">
                {tipo === 'Financeira' ? (
                  <Botao onClick={proxima}>
                    Continuar com doação financeira <Icon nome="seta" />
                  </Botao>
                ) : (
                  <Botao para={`/campanhas/${id}?aba=itens`}>
                    Consultar itens necessários
                  </Botao>
                )}
              </div>
            </Secao>
          ) : etapa === 1 ? (
            <Secao titulo="Escolha o valor">
              <form onSubmit={proxima}>
                <div
                  className="valores-rapidos"
                  role="group"
                  aria-label="Valores sugeridos"
                >
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
                <fieldset className="metodos">
                  <legend>Forma de pagamento</legend>
                  {['PIX', 'Cartão', 'Boleto'].map((m) => (
                    <label
                      className={m === metodo ? 'selecionado' : ''}
                      key={m}
                    >
                      <input
                        type="radio"
                        name="metodo"
                        value={m}
                        checked={m === metodo}
                        onChange={() => setMetodo(m)}
                      />
                      <strong>{m}</strong>
                      <small>
                        {m === 'PIX'
                          ? 'Pagamento por QR Code'
                          : m === 'Cartão'
                            ? 'Crédito ou débito'
                            : 'Documento para pagamento'}
                      </small>
                    </label>
                  ))}
                </fieldset>
                <Aviso>
                  Você está experimentando o fluxo de doação. As formas de
                  pagamento ainda não estão integradas.
                </Aviso>
                {erro && <Aviso erro>{erro}</Aviso>}
                <div className="acoes">
                  <Botao secundario onClick={() => setEtapa(0)}>
                    Voltar
                  </Botao>
                  <Botao type="submit">
                    Continuar <Icon nome="seta" />
                  </Botao>
                </div>
              </form>
            </Secao>
          ) : (
            <>
              <fieldset className="identificacao-opcoes">
                <legend className="sr-only">Identificação do doador</legend>
                {[
                  ['conta', 'Já tenho uma conta'],
                  ['rapido', 'Cadastro rápido'],
                  ['anonimo', 'Doação anônima'],
                ].map(([value, titulo]) => (
                  <label
                    key={value}
                    className={identificacao === value ? 'selecionado' : ''}
                  >
                    <input
                      type="radio"
                      name="identificacao"
                      value={value}
                      checked={identificacao === value}
                      onChange={() => {
                        setIdentificacao(value)
                        setErro('')
                        setAviso('')
                      }}
                    />
                    <strong>{titulo}</strong>
                  </label>
                ))}
              </fieldset>
              <Secao
                titulo={
                  identificacao === 'anonimo'
                    ? 'Continue sem exibir seu nome'
                    : identificacao === 'conta'
                      ? 'Acesso à sua conta'
                      : 'Identificação rápida'
                }
              >
                <form onSubmit={identificar} className="form-grid">
                  {identificacao === 'anonimo' ? (
                    <Aviso>
                      Seu nome não será exibido na demonstração. Nenhum cadastro
                      será criado.
                    </Aviso>
                  ) : (
                    <>
                      <Campo
                        className="campo--inteiro"
                        rotulo="Nome completo"
                        name="nome"
                        required
                        defaultValue={doador.nome}
                        autoComplete="name"
                      />
                      <Campo
                        className="campo--inteiro"
                        rotulo="E-mail"
                        name="email"
                        type="email"
                        required
                        defaultValue={doador.email}
                        autoComplete="email"
                      />
                      {identificacao === 'conta' && (
                        <div className="campo--inteiro">
                          <Aviso>
                            A autenticação ainda não está integrada. Você pode
                            continuar apenas na demonstração, sem informar
                            senha.
                          </Aviso>
                        </div>
                      )}
                    </>
                  )}
                  {erro && <Aviso erro>{erro}</Aviso>}
                  {aviso && (
                    <div className="campo--inteiro">
                      <Aviso>{aviso}</Aviso>
                      <Botao disabled>Pagamento indisponível</Botao>
                    </div>
                  )}
                  <div className="acoes campo--inteiro">
                    <Botao secundario onClick={() => setEtapa(1)}>
                      Voltar à contribuição
                    </Botao>
                    <Botao type="submit">
                      Continuar na demonstração <Icon nome="seta" />
                    </Botao>
                  </div>
                  <small className="campo--inteiro">
                    As informações ficam somente na memória desta sessão.
                    Nenhuma conta será criada.
                  </small>
                </form>
              </Secao>
            </>
          )}
        </div>
        <aside className="cartao doar-resumo">
          <img className="resumo-imagem" src={campanha.imagem} alt="" />
          <span className="badge badge--sucesso">Campanha ativa</span>
          <h2>{campanha.nome}</h2>
          <p>
            {campanha.entidade} · {campanha.cidade}
          </p>
          <Progresso atual={campanha.arrecadado} meta={campanha.meta} />
          <hr />
          <h3>Sua contribuição</h3>
          <strong className="numero-destaque">
            {tipo === 'Financeira'
              ? formatarMoeda(valorDoacao(valor) ?? 0)
              : 'Doação de itens'}
          </strong>
          <p>
            {tipo === 'Financeira'
              ? `${metodo} · contribuição única`
              : 'Seleção disponível em uma próxima entrega'}
          </p>
          <Aviso>Dados fictícios · nenhum valor é cobrado.</Aviso>
        </aside>
      </div>
    </section>
  )
}
