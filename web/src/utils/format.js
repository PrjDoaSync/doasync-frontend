const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarMoeda = (valor) => brl.format(valor)

export const formatarData = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')

export const percentual = (parte, total) =>
  total > 0 ? Math.min(100, Math.round((parte / total) * 100)) : 0
