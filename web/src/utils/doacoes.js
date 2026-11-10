import { formatarData } from './format'
// Regras das telas do doador (#102 e #103).
export const primeiroNome = (nome) => nome.split(' ')[0]
const soma = (lista, campo) => lista.reduce((total, d) => total + (d[campo] ?? 0), 0)

export function resumoDoador(lista) {
  const fin = lista.filter((d) => d.tipo === 'Financeira')
  const itens = lista.filter((d) => d.tipo === 'Itens')
  const finOk = fin.filter((d) => d.pagamentoStatus === 'Confirmado')
  const itensOk = itens.filter((d) => d.status !== 'Pendente')
  const itensAgendados = itens.filter((d) => d.status === 'Pendente')
  return {
    financeiroConfirmado: soma(finOk, 'valor'),
    contribuicoes: finOk.length,
    itensRecebidos: soma(itensOk, 'quantidade'),
    itensDescricao: itensOk.map((d) => d.titulo).join(' + '),
    itensAgendados: soma(itensAgendados, 'quantidade'),
    pagamentosPendentes: fin.filter((d) => d.pagamentoStatus === 'Pendente').length,
    entregasPendentes: itensAgendados.length,
  }
}

export function filtrarDoacoes(lista, { busca = '', tipo = '', status = '', mes = '' } = {}) {
  const termo = busca.trim().toLowerCase()
  return lista.filter(
    (d) =>
      (!tipo || d.tipo === tipo) &&
      (!status || d.status === status) &&
      (!mes || d.data.startsWith(mes)) &&
      (!termo || `${d.campanha} ${d.id}`.toLowerCase().includes(termo)),
  )
}

export const mesesDisponiveis = (lista) => [...new Set(lista.map((d) => d.data.slice(0, 7)))].sort().reverse()
export const nomeDoMes = (ym) => {
  const [ano, mes] = ym.split('-').map(Number)
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`
}

// Título, texto e faixa da confirmação conforme o estado real da doação.
export function mensagemConfirmacao(d, nome) {
  const quem = primeiroNome(nome)
  if (d.status === 'Pendente')
    return d.tipo === 'Itens'
      ? { titulo: 'Doação aguardando conferência', texto: `${quem}, a entidade confirmará o recebimento após conferir a entrega.`, faixa: 'Entrega agendada · aguardando conferência' }
      : { titulo: 'Doação aguardando pagamento', texto: `${quem}, sua contribuição será confirmada após o pagamento.`, faixa: `Aguardando pagamento · ${d.meio}` }
  return {
    titulo: 'Sua doação foi recebida. Obrigado!',
    texto: `${quem}, sua contribuição de ${d.titulo} chegou à ${d.entidade}. Guarde os documentos e acompanhe a destinação.`,
    faixa: d.tipo === 'Itens' ? 'Entrega conferida pela entidade' : `Pagamento confirmado · ${d.meio}`,
  }
}

// Linha do tempo da doação (Pendente → Recebida → Aplicada). Usa os eventos
// registrados, se houver; senão deriva do estado atual da doação.
export function eventosDoacao(d) {
  if (d.eventos) return d.eventos
  const quando = `${formatarData(d.data)} · ${d.hora}`
  const itens = d.tipo === 'Itens'
  const pendente = d.status === 'Pendente'
  return [
    { chave: 'pendente', titulo: 'Pendente', quando, estado: 'feito',
      texto: itens ? 'Doação registrada. Aguardando a entrega e a conferência da entidade.' : `Doação registrada. Aguardando ${d.meio === 'boleto bancário' ? 'o pagamento do boleto' : 'a autorização do pagamento no cartão'}.` },
    { chave: 'recebida', titulo: 'Recebida', quando: pendente ? '' : quando, estado: pendente ? 'futuro' : 'feito',
      texto: pendente ? 'Será registrada quando a entidade confirmar o recebimento.' : itens ? `Entrega conferida. ${d.titulo} recebidos pela ${d.entidade}.` : `Pagamento confirmado. ${d.titulo} recebidos pela ${d.entidade} para a campanha.` },
    { chave: 'aplicada', titulo: 'Aplicada', quando: '', estado: 'futuro',
      texto: itens ? 'Será registrada quando a entidade distribuir os itens.' : 'Será registrada quando a entidade usar o recurso na campanha.' },
  ]
}
