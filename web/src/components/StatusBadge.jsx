const TONS = {
  Ativa: 'sucesso',
  Confirmada: 'sucesso',
  Confirmado: 'sucesso',
  Aceito: 'sucesso',
  Ativo: 'sucesso',
  Inativo: 'neutro',
  'Convite simulado': 'alerta',
  Pendente: 'alerta',
  Aguardando: 'alerta',
  'Em análise': 'alerta',
  Cancelada: 'perigo',
  Cancelado: 'perigo',
  // Entidade e campanha (status da API).
  Aprovada: 'sucesso',
  Reprovada: 'perigo',
  Inativa: 'neutro',
  Agendada: 'alerta',
  Rascunho: 'neutro',
  Encerrada: 'neutro',
  Desativada: 'perigo',
}

export default function StatusBadge({ valor }) {
  const tom = TONS[valor] ?? 'neutro'
  return <span className={`badge badge--${tom}`}>{valor}</span>
}
