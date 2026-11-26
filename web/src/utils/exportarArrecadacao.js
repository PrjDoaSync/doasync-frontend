const celula = (valor) => {
  const texto = String(valor ?? '')
  const seguro = /^[\s\uFEFF]*[=+@-]/.test(texto) ? "'" + texto : texto
  return '"' + seguro.replaceAll('"', '""') + '"'
}

export function csvArrecadacao({ inicio, fim, porCampanha }) {
  return [
    ['Início', 'Fim', 'Campanha', 'Doações', 'Total (BRL)'],
    ...porCampanha.map(({ titulo, quantidade, total }) => [inicio, fim, titulo ?? 'Doação direta', quantidade, total]),
  ].map((linha) => linha.map(celula).join(';')).join('\r\n')
}

export function baixarArrecadacao(resultado) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', csvArrecadacao(resultado)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `arrecadacao-${resultado.inicio}-${resultado.fim}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
