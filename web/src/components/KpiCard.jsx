import { Icon } from './Ui'

export default function KpiCard({ rotulo, valor, detalhe, icone }) {
  return (
    <div className="kpi">
      <span className="kpi__rotulo kpi__topo">
        {rotulo}
        {icone && <Icon nome={icone} size={18} aria-hidden="true" />}
      </span>
      <strong className="kpi__valor">{valor}</strong>
      {detalhe && <span className="kpi__detalhe">{detalhe}</span>}
    </div>
  )
}
