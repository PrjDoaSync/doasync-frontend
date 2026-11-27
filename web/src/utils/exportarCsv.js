// Exportação CSV gerada no navegador (RF-030 fora do MVP no backend: POST /relatorios/exportar
// não existe). Separador ";" e BOM para o Excel em português; células que começam com
// = + - @ recebem um apóstrofo para não virarem fórmula (injeção de CSV). Porta do PR #146.
const celula = (valor) => {
  const texto = String(valor ?? '')
  const seguro = /^[\s﻿]*[=+@-]/.test(texto) ? `'${texto}` : texto
  return `"${seguro.replaceAll('"', '""')}"`
}

const decimal = (valor) => Number(valor ?? 0).toFixed(2).replace('.', ',')

export const montarCsv = (linhas) => linhas.map((linha) => linha.map(celula).join(';')).join('\r\n')

// Resposta de GET /entidades/{id}/arrecadacao → uma linha por campanha.
export function csvArrecadacao({ inicio, fim, porCampanha = [] }) {
  return montarCsv([
    ['Início', 'Fim', 'Campanha', 'Doações', 'Total (BRL)'],
    ...porCampanha.map(({ titulo, quantidade, total }) => [inicio ?? '', fim ?? '', titulo ?? 'Doação direta', quantidade, decimal(total)]),
  ])
}

// Doações recebidas (já mapeadas por mapDoacao) → uma linha por doação. Anônimas não identificam o doador.
export function csvDoacoes(doacoes) {
  return montarCsv([
    ['Data', 'Comprovante', 'Campanha', 'Doador', 'Forma de pagamento', 'Status', 'Valor (BRL)'],
    ...doacoes.map((d) => [
      d.data.slice(0, 10),
      d.comprovante,
      d.campanha || 'Doação direta',
      d.anonima ? 'Doador anônimo' : d.doador,
      d.formaPagamento,
      d.status,
      decimal(d.valor),
    ]),
  ])
}

export function baixarCsv(nomeArquivo, conteudo) {
  const url = URL.createObjectURL(new Blob(['﻿', conteudo], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
