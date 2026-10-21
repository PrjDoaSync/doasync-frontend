const TONS = {
  Ativa: 'sucesso',
  Confirmada: 'sucesso',
  Confirmado: 'sucesso',
  Aceito: 'sucesso',
  Pendente: 'alerta',
  Aguardando: 'alerta',
  'Em análise': 'alerta',
  Cancelada: 'perigo',
  Cancelado: 'perigo',
}

export default function StatusBadge({ valor }) {
  const tom = TONS[valor] ?? 'neutro'
  return <span className={`badge badge--${tom}`}>{valor}</span>
}
