export default function KpiCard({ rotulo, valor, detalhe }) {
  return (
    <div className="kpi">
      <span className="kpi__rotulo">{rotulo}</span>
      <strong className="kpi__valor">{valor}</strong>
      {detalhe && <span className="kpi__detalhe">{detalhe}</span>}
    </div>
  )
}
