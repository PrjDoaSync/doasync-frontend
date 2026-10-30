import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'

const caminhos = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  campanhas: 'M3 11v4h4l10 5V5L7 10H3z M7 15l2 6 M21 9v7',
  doacoes: 'M20 12l-8 8-8-8a5 5 0 0 1 8-6 5 5 0 0 1 8 6z',
  doadores:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M17 11h6',
  relatorios: 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',
  configuracoes:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  seta: 'M5 12h14 M14 7l5 5-5 5',
  voltar: 'M19 12H5 M10 7l-5 5 5 5',
  busca: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M15 15l6 6',
  download: 'M12 3v12 M7 10l5 5 5-5 M3 17v4h18v-4',
  mais: 'M12 5v14 M5 12h14',
  calendario: 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16',
  itens: 'M3 7l9-4 9 4v11l-9 4-9-4z M3 7l9 5 9-5 M12 12v10',
  externo: 'M14 3h7v7 M21 3L11 13 M10 3H3v18h18v-7',
  sino: 'M5 17h14l-2-4V8a5 5 0 0 0-10 0v5z M10 21h4',
  check: 'M5 12l4 4L19 6',
  sair: 'M9 3H3v18h6 M9 12h12 M17 8l4 4-4 4',
}
export function Icon({ nome, size = 19, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={caminhos[nome] ?? caminhos.doacoes} />
    </svg>
  )
}
export function Marca() {
  return (
    <Link to="/" className="marca">
      <span className="marca__icone">
        <Icon nome="doacoes" size={21} />
      </span>
      DoaSync
    </Link>
  )
}
export function Botao({
  children,
  para,
  secundario,
  className = '',
  ...props
}) {
  const classes = `botao ${secundario ? 'botao--secundario' : ''} ${className}`
  return para ? (
    <Link to={para} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
export function Campo({ rotulo, children, ajuda, className = '', ...props }) {
  const ajudaId = useId()
  const controle =
    children &&
    isValidElement(children) &&
    ['input', 'select', 'textarea'].includes(children.type)
      ? cloneElement(children, {
          'aria-describedby': ajuda
            ? ajudaId
            : children.props['aria-describedby'],
        })
      : children
  return (
    <div className={`campo ${className}`}>
      <label className="campo__controle">
        <span>
          {rotulo}
          {props.required && ' *'}
        </span>
        {controle ?? (
          <input aria-describedby={ajuda ? ajudaId : undefined} {...props} />
        )}
      </label>
      {ajuda && <small id={ajudaId}>{ajuda}</small>}
    </div>
  )
}
export function Aviso({ children, erro = false }) {
  return (
    <div
      className={`aviso ${erro ? 'aviso--erro' : ''}`}
      role={erro ? 'alert' : 'status'}
    >
      <span aria-hidden="true">{erro ? '!' : 'ⓘ'}</span>
      <div>{children}</div>
    </div>
  )
}
export function Vazio({
  titulo = 'Nenhum resultado encontrado',
  children,
  principal = false,
}) {
  const Titulo = principal ? 'h1' : 'h2'
  return (
    <div className="vazio">
      <Icon nome="busca" size={30} />
      <Titulo>{titulo}</Titulo>
      <p>
        {children ??
          'Experimente alterar os filtros para encontrar o que procura.'}
      </p>
    </div>
  )
}
export function Secao({ titulo, descricao, children, acao, className = '' }) {
  return (
    <section className={`cartao ${className}`}>
      <div className="secao__cabecalho">
        <div>
          <h2>{titulo}</h2>
          {descricao && <p>{descricao}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  )
}
export function Modal({ titulo, children, fechar }) {
  const ref = useRef(null)
  const aoFechar = useRef(fechar)
  useEffect(() => {
    aoFechar.current = fechar
  })
  useEffect(() => {
    const dialog = ref.current
    const anterior = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      anterior?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault()
        aoFechar.current()
      }}
    >
      <div className="secao__cabecalho">
        <h2>{titulo}</h2>
        <button
          type="button"
          className="icone-botao"
          aria-label="Fechar"
          onClick={fechar}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function Etapas({ atual, itens }) {
  return (
    <ol className="etapas">
      {itens.map((item, i) => (
        <li
          key={item}
          className={i <= atual ? 'etapa--ativa' : ''}
          aria-current={i === atual ? 'step' : undefined}
        >
          <span>{i < atual ? '✓' : i + 1}</span>
          <div>
            {item}
            <small>
              {i < atual
                ? 'Concluído'
                : i === atual
                  ? 'Em andamento'
                  : 'Próxima etapa'}
            </small>
          </div>
        </li>
      ))}
    </ol>
  )
}
