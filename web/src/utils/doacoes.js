// Regras de "Minhas doações" sobre as doações da API (mapDoacao em services/mappers.js).
export const primeiroNome = (nome) => nome.split(' ')[0]

// Indicadores do histórico: só doações confirmadas contam como arrecadado.
export function resumoDoacoes(lista) {
  const confirmadas = lista.filter((d) => d.status === 'Confirmada')
  return {
    totalConfirmado: confirmadas.reduce((total, d) => total + d.valor, 0),
    confirmadas: confirmadas.length,
    campanhasApoiadas: new Set(confirmadas.map((d) => d.campanhaId ?? `entidade-${d.entidadeId}`)).size,
    pendentes: lista.filter((d) => d.status === 'Pendente').length,
  }
}

export function filtrarDoacoes(lista, { busca = '', status = '', mes = '' } = {}) {
  const termo = busca.trim().toLowerCase()
  return lista.filter(
    (d) =>
      (!status || d.status === status) &&
      (!mes || d.data.startsWith(mes)) &&
      (!termo || `${d.campanha} ${d.entidade} ${d.comprovante}`.toLowerCase().includes(termo)),
  )
}

export const mesesDisponiveis = (lista) => [...new Set(lista.map((d) => d.data.slice(0, 7)))].sort().reverse()
export const nomeDoMes = (ym) => {
  const [ano, mes] = ym.split('-').map(Number)
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`
}
