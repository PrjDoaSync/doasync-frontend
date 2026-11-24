// Regras do fluxo de doação (#98 a #101). Funções puras para facilitar os testes.
// Nada aqui gera cobrança real: PIX, boleto e cartão são apenas demonstração.

import { formatarMoeda } from './format'

const JANELAS = ['Manhã (9h às 12h)', 'Tarde (13h às 17h)']
export const JANELAS_AGENDAMENTO = JANELAS

const soDigitos = (texto) => String(texto ?? '').replace(/\D/g, '')

function somarDias(dataIso, dias) {
  const [a, m, d] = dataIso.split('-').map(Number)
  const data = new Date(Date.UTC(a, m - 1, d + dias))
  return data.toISOString().slice(0, 10)
}

export function luhn(numero) {
  const digitos = soDigitos(numero)
  if (digitos.length < 13 || digitos.length > 19) return false
  let soma = 0
  for (let i = 0; i < digitos.length; i += 1) {
    let n = Number(digitos[digitos.length - 1 - i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    soma += n
  }
  return soma % 10 === 0
}

// Dados do cartão só são validados no formulário; nunca são guardados no registro.
export function validarCartao({ nome, numero, validade, cvv }, hoje) {
  const erros = {}
  if (String(nome ?? '').trim().length < 3) erros.nome = 'Informe o nome como está no cartão.'
  if (!luhn(numero)) erros.numero = 'Número de cartão inválido.'
  const v = String(validade ?? '').match(/^(\d{2})\/(\d{2})$/)
  if (!v || Number(v[1]) < 1 || Number(v[1]) > 12) {
    erros.validade = 'Use o formato MM/AA.'
  } else {
    const ano = 2000 + Number(v[2])
    const fimDoMes = `${ano}-${v[1]}-${String(new Date(Date.UTC(ano, Number(v[1]), 0)).getUTCDate()).padStart(2, '0')}`
    if (fimDoMes < hoje) erros.validade = 'Cartão vencido.'
  }
  if (!/^\d{3,4}$/.test(String(cvv ?? ''))) erros.cvv = 'Informe o código de segurança.'
  return erros
}

// Código de demonstração: tem o formato de um "copia e cola", mas NÃO é um PIX válido.
export function gerarCodigoPix(valor, campanhaId) {
  const v = Number(valor).toFixed(2)
  return `00020126DEMO0014BR.GOV.BCB.PIX52040000530398654${String(v.length).padStart(2, '0')}${v}5802BR5909DOASYNC62${String(campanhaId).padStart(4, '0')}6304DEMO`
}

// Boleto de demonstração: linha digitável fictícia, não pagável.
export function gerarBoleto(valor, campanhaId, hoje) {
  const centavos = String(Math.round(Number(valor) * 100)).padStart(10, '0')
  const campanha = String(campanhaId).replace(/\D/g, '').padStart(4, '0')
  const linha = `00000.00000 ${campanha}0.000000 00000.000000 0 ${centavos}`
  return { linha, vencimento: somarDias(hoje, 3) }
}

// `selecao`: { [nomeDoItem]: quantidade }; `limites`: { [nomeDoItem]: máximo }
export function validarItens(selecao, limites) {
  const escolhidos = Object.entries(selecao).filter(([, q]) => Number(q) > 0)
  if (escolhidos.length === 0) return 'Escolha ao menos um item e informe a quantidade.'
  for (const [nome, q] of escolhidos) {
    if (!Number.isInteger(Number(q))) return `A quantidade de "${nome}" deve ser um número inteiro.`
    if (Number(q) > (limites[nome] ?? 0)) {
      return `A campanha precisa de no máximo ${limites[nome] ?? 0} unidade(s) de "${nome}".`
    }
  }
  return ''
}

export function itensEscolhidos(selecao) {
  return Object.entries(selecao)
    .filter(([, q]) => Number(q) > 0)
    .map(([nome, q]) => ({ nome, quantidade: Number(q) }))
}

export function validarAgendamento({ modo, data, janela, endereco }, { hoje, limite }) {
  const erros = {}
  if (!data) erros.data = 'Escolha uma data.'
  else if (data < hoje) erros.data = 'Escolha uma data a partir de hoje.'
  else if (limite && data > limite) erros.data = 'A data deve ser até o encerramento da campanha.'
  if (!JANELAS.includes(janela)) erros.janela = 'Escolha um período.'
  if (modo === 'retirada' && String(endereco ?? '').trim().length < 8) {
    erros.endereco = 'Informe o endereço para a retirada.'
  }
  return erros
}

export function montarDoacao({ id, campanha, doador, tipo, valor, metodo, itens, agendamento, hoje }) {
  const financeira = tipo === 'Financeira'
  return {
    id,
    doador,
    doadorId: doador,
    campanhaId: campanha.id,
    campanha: campanha.nome,
    entidadeId: campanha.entidadeId,
    tipo,
    detalhe: financeira
      ? formatarMoeda(valor)
      : itens.map((i) => `${i.quantidade} ${i.nome}`).join(' + '),
    valor: financeira ? valor : 0,
    itens: financeira ? [] : itens,
    quantidade: financeira ? 0 : itens.reduce((s, i) => s + i.quantidade, 0),
    pagamento: financeira ? 'Pendente' : 'Não se aplica',
    metodo: financeira ? metodo : null,
    recebimento: 'Aguardando',
    destinacao: 'Não destinado',
    agendamento: financeira ? null : agendamento,
    data: hoje,
    status: 'Pendente',
  }
}
