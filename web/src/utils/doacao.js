// Regras do fluxo de doação (DOA-05 a DOA-07, #99 a #101). Funções puras, testadas em
// src/test/doacao.test.jsx. Nada aqui gera cobrança nem registro: cartão, boleto, itens e
// agendamento dependem de rotas que ainda não existem (services/indisponivel.js).

export const JANELAS_AGENDAMENTO = ['Manhã (9h às 12h)', 'Tarde (13h às 17h)']

const soDigitos = (texto) => String(texto ?? '').replace(/\D/g, '')

// Soma dias a uma data AAAA-MM-DD sem depender do fuso do navegador.
export function somarDias(dataIso, dias) {
  const [a, m, d] = dataIso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
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

// Os dados do cartão são só validados no formulário: nunca são guardados nem enviados.
export function validarCartao({ nome, numero, validade, cvv }, hoje) {
  const erros = {}
  if (String(nome ?? '').trim().length < 3) erros.nome = 'Informe o nome como está no cartão.'
  if (!luhn(numero)) erros.numero = 'Número de cartão inválido.'
  const v = String(validade ?? '').match(/^(\d{2})\/(\d{2})$/)
  if (!v || Number(v[1]) < 1 || Number(v[1]) > 12) {
    erros.validade = 'Use o formato MM/AA.'
  } else {
    const ano = 2000 + Number(v[2])
    const ultimoDia = new Date(Date.UTC(ano, Number(v[1]), 0)).getUTCDate()
    if (`${ano}-${v[1]}-${String(ultimoDia).padStart(2, '0')}` < hoje) erros.validade = 'Cartão vencido.'
  }
  if (!/^\d{3,4}$/.test(String(cvv ?? ''))) erros.cvv = 'Informe o código de segurança.'
  return erros
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
  if (!JANELAS_AGENDAMENTO.includes(janela)) erros.janela = 'Escolha um período.'
  if (modo === 'retirada' && String(endereco ?? '').trim().length < 8) {
    erros.endereco = 'Informe o endereço para a retirada.'
  }
  return erros
}
