export function filtrarRegistros(registros, filtros = {}) {
  const busca = (filtros.busca ?? '').trim().toLocaleLowerCase('pt-BR')
  return registros.filter((registro) => {
    const data = registro.data ?? registro.criadaEm
    return (
      (!busca ||
        [
          registro.nome,
          registro.doador,
          registro.entidade,
          registro.categoria,
          registro.detalhe,
          registro.campanha,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(busca)) &&
      (!filtros.entidadeId ||
        String(registro.entidadeId) === String(filtros.entidadeId)) &&
      (!filtros.status || registro.status === filtros.status) &&
      (!filtros.tipo || registro.tipo === filtros.tipo) &&
      (!filtros.campanhaId ||
        String(registro.campanhaId ?? registro.id) ===
          String(filtros.campanhaId)) &&
      (!filtros.inicio || (data && data >= filtros.inicio)) &&
      (!filtros.fim || (data && data <= filtros.fim))
    )
  })
}

export function calcularIndicadores(campanhas, doacoes) {
  const confirmadas = doacoes.filter((d) => d.status === 'Confirmada')
  const finalizadas = campanhas.filter((c) => c.status === 'Encerrada')
  return {
    arrecadado: confirmadas
      .filter((d) => d.tipo === 'Financeira')
      .reduce((s, d) => s + Number(d.valor || 0), 0),
    doadores: new Set(confirmadas.map((d) => d.doadorId ?? d.doador)).size,
    ativas: campanhas.filter((c) => c.status === 'Ativa').length,
    concluidas: campanhas.length
      ? Math.round((finalizadas.length / campanhas.length) * 100)
      : 0,
    itens: confirmadas
      .filter((d) => d.tipo === 'Itens')
      .reduce((s, d) => s + Number(d.quantidade || 0), 0),
  }
}

export function serieFinanceira(doacoes) {
  const dias = new Map()
  for (const d of doacoes) {
    if (d.tipo === 'Financeira' && d.status === 'Confirmada')
      dias.set(d.data, (dias.get(d.data) ?? 0) + Number(d.valor || 0))
  }
  let total = 0
  return [...dias]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, valor]) => ({ data, valor, acumulado: (total += valor) }))
}

export function validarPeriodo(inicio, fim) {
  return inicio && fim && inicio > fim
    ? 'A data inicial deve ser anterior ou igual à data final.'
    : ''
}

export function serieItens(doacoes) {
  const dias = new Map()
  for (const d of doacoes) {
    if (d.tipo === 'Itens' && d.status === 'Confirmada')
      dias.set(d.data, (dias.get(d.data) ?? 0) + Number(d.quantidade || 0))
  }
  let total = 0
  return [...dias]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, valor]) => ({ data, valor, acumulado: (total += valor) }))
}

export function validarCnpj(valor) {
  const digitos = String(valor).replace(/\D/g, '')
  if (!/^\d{14}$/.test(digitos) || /^(\d)\1+$/.test(digitos)) return false
  const verificar = (base, pesos) => {
    const resto =
      base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return (
    verificar(digitos.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) ===
      Number(digitos[12]) &&
    verificar(digitos.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) ===
      Number(digitos[13])
  )
}

export function valorDoacao(valor) {
  const normalizado = String(valor)
    .trim()
    .replace(/\s|R\$/g, '')
  if (!/^\d+([.,]\d{1,2})?$/.test(normalizado)) return null
  const numero = Number(normalizado.replace(',', '.'))
  return Number.isFinite(numero) && numero > 0
    ? Math.round(numero * 100) / 100
    : null
}
