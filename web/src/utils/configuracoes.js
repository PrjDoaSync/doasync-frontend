// Configurações da entidade (#114). SEM CONTRATO na API: recebimento de itens,
// notificações e recebimento financeiro (PATCH /entidades/{id} só aceita os dados
// cadastrais). Persistem só na sessão de demonstração, dentro de dados.entidade.
export const NOTIFICACOES = [
  { chave: 'doacoes', titulo: 'Novas doações confirmadas', detalhe: 'E-mail e central · financeiro e itens', padrao: true },
  { chave: 'convites', titulo: 'Convites e mudanças de acesso', detalhe: 'E-mail e central · segurança da equipe', padrao: true },
  { chave: 'entregas', titulo: 'Entregas de itens agendadas', detalhe: 'E-mail e central · aviso 1 dia antes', padrao: true },
  { chave: 'resumo', titulo: 'Resumo semanal', detalhe: 'E-mail às segundas-feiras, às 9h', padrao: false },
  { chave: 'metas', titulo: 'Metas e fim de campanha', detalhe: 'E-mail e central · progresso e prazo', padrao: true },
  { chave: 'novidades', titulo: 'Novidades do DoaSync', detalhe: 'E-mail · dicas e atualizações do produto', padrao: false },
]

const ITENS_PADRAO = {
  local: 'Sede da Rede Esperança',
  endereco: 'Rua Esperança, 120 · Vila Mariana · São Paulo – SP',
  horario: 'Seg. a sex. · 9h às 17h',
  responsavel: 'Paulo Souza',
  orientacoes: 'Agendar entrega; alimentos lacrados e dentro da validade.',
}

export function configuracaoPadrao(entidade = {}) {
  return {
    recebimentoItens: { ...ITENS_PADRAO, ...entidade.recebimentoItens },
    notificacoes: {
      ...Object.fromEntries(NOTIFICACOES.map((n) => [n.chave, n.padrao])),
      ...entidade.notificacoes,
    },
  }
}

// Se algum campo do ponto de entrega for preenchido, local e endereço são obrigatórios.
export function validarRecebimentoItens(r = {}) {
  const preenchido = Object.values(r).some((v) => String(v ?? '').trim())
  if (!preenchido) return ''
  if (!String(r.local ?? '').trim()) return 'Informe o local de recebimento dos itens.'
  if (!String(r.endereco ?? '').trim()) return 'Informe o endereço de recebimento dos itens.'
  return ''
}

// Mostra só os dois primeiros dígitos e o final: 11.•••.•••/0001-••
export function mascararCnpj(cnpj = '') {
  const d = String(cnpj).replace(/\D/g, '')
  return d.length === 14 ? `${d.slice(0, 2)}.•••.•••/${d.slice(8, 12)}-••` : '••.•••.•••/••••-••'
}

export const agoraFormatado = () => new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
export const ULTIMA_ATUALIZACAO_DEMO = '06/10/2026 10:45'
