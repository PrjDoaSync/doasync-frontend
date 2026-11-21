import { VOCE } from '../mocks/equipe'

export const PAPEIS = ['Administradora', 'Operador', 'Financeiro', 'Leitura']
export const ACESSOS = ['Ativo', 'Suspenso', 'Convite pendente']
export const PERMISSOES = [
  { chave: 'campanhas', texto: 'Criar e editar campanhas', papeis: ['Administradora', 'Operador'] },
  { chave: 'doacoes', texto: 'Consultar doações e doadores', papeis: PAPEIS },
  { chave: 'itens', texto: 'Confirmar recebimento de itens', papeis: ['Administradora', 'Operador'] },
  { chave: 'saidas', texto: 'Registrar saídas e destinação de itens', papeis: ['Administradora', 'Operador'] },
  { chave: 'relatorios', texto: 'Exportar relatórios PDF / CSV', papeis: ['Administradora', 'Financeiro'] },
  { chave: 'usuarios', texto: 'Gerenciar usuários e permissões', papeis: ['Administradora'] },
  { chave: 'financeiro', texto: 'Editar dados financeiros e configurações', papeis: ['Administradora'] },
]

export function resumoEquipe(equipe) {
  const ativos = equipe.filter((u) => u.acesso === 'Ativo')
  const admins = ativos.filter((u) => u.papel === 'Administradora').length
  const convites = equipe.filter((u) => u.acesso === 'Convite pendente')
  return {
    ativos: ativos.length, admins, naEquipe: ativos.length - admins,
    convites: convites.length, expira: convites[0]?.conviteExpira ?? '',
    suspensos: equipe.filter((u) => u.acesso === 'Suspenso').length,
  }
}

export function filtrarEquipe(equipe, { busca = '', papel = '', acesso = '' } = {}) {
  const termo = busca.trim().toLowerCase()
  return equipe.filter(
    (u) => (!papel || u.papel === papel) && (!acesso || u.acesso === acesso) && (!termo || `${u.nome} ${u.email}`.toLowerCase().includes(termo)),
  )
}

// Regras do protótipo: a última administradora ativa não perde papel nem acesso,
// e o acesso de quem tem convite pendente só é liberado quando aceitar o convite.
export function validarAcesso(novo, usuario, equipe) {
  const admins = equipe.filter((u) => u.papel === 'Administradora' && u.acesso === 'Ativo')
  const ultima = usuario.papel === 'Administradora' && usuario.acesso === 'Ativo' && admins.length === 1
  if (ultima && (novo.papel !== 'Administradora' || novo.acesso !== 'Ativo'))
    return 'A última administradora não pode ter o papel ou o acesso removido.'
  if (usuario.acesso === 'Convite pendente' && novo.acesso !== 'Convite pendente')
    return 'O acesso só é liberado quando a pessoa aceitar o convite.'
  return ''
}

export const aplicarAcesso = (equipe, id, novo) => equipe.map((u) => (u.id === id ? { ...u, ...novo } : u))

export function validarConvite(f, equipe) {
  if (!f.nome.trim()) return 'Informe o nome da pessoa.'
  if (!f.email.includes('@')) return 'Informe um e-mail válido.'
  if (equipe.some((u) => u.email.toLowerCase() === f.email.trim().toLowerCase())) return 'Já existe uma pessoa com este e-mail na equipe.'
  return ''
}

export const acaoDaLinha = (u) =>
  u.id === VOCE ? 'Ver permissões' : u.acesso === 'Convite pendente' ? 'Reenviar convite' : u.acesso === 'Suspenso' ? 'Reativar acesso' : 'Editar acesso'
