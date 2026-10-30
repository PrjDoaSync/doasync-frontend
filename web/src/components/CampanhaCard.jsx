import { Link } from 'react-router-dom'
import { formatarMoeda, percentual } from '../utils/format'
import { Icon } from './Ui'

export function Progresso({ atual, meta }) {
  const pct = percentual(atual, meta)
  return (
    <div>
      <div
        className="progresso"
        role="progressbar"
        aria-label="Meta arrecadada"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progresso__barra" style={{ width: `${pct}%` }} />
      </div>
      <div className="progresso-legenda">
        <span>
          <strong>{formatarMoeda(atual)}</strong> arrecadados
        </span>
        <span>{pct}%</span>
      </div>
      <small>Meta de {formatarMoeda(meta)}</small>
    </div>
  )
}
export default function CampanhaCard({ campanha: c }) {
  return (
    <article className="campanha-card">
      <Link to={`/campanhas/${c.id}`} className="campanha-card__imagem">
        <img src={c.imagem} alt="" loading="lazy" />
        <span>{c.categoria}</span>
      </Link>
      <div className="campanha-card__conteudo">
        <small>
          {c.entidade} · {c.cidade}
        </small>
        <h2>
          <Link to={`/campanhas/${c.id}`}>{c.nome}</Link>
        </h2>
        <p>
          Um gesto seu pode fazer a diferença. Faça parte dessa transformação.
        </p>
        <Progresso atual={c.arrecadado} meta={c.meta} />
        <Link to={`/campanhas/${c.id}`} className="campanha-card__link">
          Conhecer campanha <Icon nome="seta" size={16} />
        </Link>
      </div>
    </article>
  )
}
