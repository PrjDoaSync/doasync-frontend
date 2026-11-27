// Resumo da tela Relatórios (GES-08) a partir de GET /entidades/{id}/arrecadacao e das doações
// recebidas (GET /entidades/{id}/doacoes, já mapeadas). Função pura, testada em relatorios.test.jsx.
// O período das doações também é filtrado aqui: a rota de doações não exige dataInicio/dataFim.
export function resumoRelatorio({ arrecadacao, doacoes, inicio = '', fim = '', campanhaId = '' }) {
  const dentro = (d) => {
    const dia = d.data.slice(0, 10)
    return (!inicio || dia >= inicio) && (!fim || dia <= fim)
  }
  const noPeriodo = doacoes
    .filter((d) => dentro(d) && (!campanhaId || d.campanhaId === campanhaId))
    .sort((a, b) => b.data.localeCompare(a.data))
  const porCampanha = (arrecadacao?.porCampanha ?? [])
    .filter((c) => !campanhaId || c.campanhaId === campanhaId)
    .map((c) => ({ ...c, total: Number(c.total ?? 0), quantidade: Number(c.quantidade ?? 0) }))
    .sort((a, b) => b.total - a.total)
  const total = campanhaId
    ? porCampanha.reduce((soma, c) => soma + c.total, 0)
    : Number(arrecadacao?.totalArrecadado ?? 0)
  const quantidade = campanhaId
    ? porCampanha.reduce((soma, c) => soma + c.quantidade, 0)
    : Number(arrecadacao?.quantidadeDoacoes ?? 0)
  const confirmadas = noPeriodo.filter((d) => d.status === 'Confirmada')
  const doadores = new Set(confirmadas.filter((d) => !d.anonima && d.doadorId).map((d) => d.doadorId)).size
  return {
    total,
    quantidade,
    ticketMedio: quantidade ? total / quantidade : 0,
    doadores,
    porCampanha,
    doacoes: noPeriodo,
    arrecadacao: { ...arrecadacao, porCampanha },
  }
}
