import { formatarMoeda } from './format'

// Validação da edição de campanha publicada (issue #92).
// Regras do protótipo: meta não pode ser menor que o total já recebido e o
// término não pode ser anterior ao início (que não é editável após publicar).
export function validarEdicao(form, campanha) {
  const erros = {}
  const meta = Number(String(form.meta).replace(',', '.'))
  if (!form.nome.trim()) erros.nome = 'Título não pode ser vazio.'
  if (!form.descricao.trim()) erros.descricao = 'Descrição não pode ser vazia.'
  if (!(meta > 0)) erros.meta = 'Meta deve ser maior que zero.'
  else if (meta < campanha.arrecadado)
    erros.meta = `A meta não pode ser menor que o total recebido (${formatarMoeda(campanha.arrecadado)}).`
  if (!form.encerraEm) erros.encerraEm = 'Data de término é obrigatória.'
  else if (form.encerraEm < campanha.criadaEm)
    erros.encerraEm = 'Data de término deve ser igual ou posterior à data de início.'
  return erros
}

// Dias restantes até o término, a partir de uma data de referência (relógio de demonstração).
export function diasRestantes(fim, hoje = '2026-10-06') {
  return Math.max(0, Math.round((Date.parse(fim) - Date.parse(hoje)) / 86400000))
}

// A API só permite editar campanha que ainda não terminou (e só a entidade dona edita).
export const podeEditar = (status) => ['Rascunho', 'Agendada', 'Ativa'].includes(status)

// Data de hoje no fuso do navegador (AAAA-MM-DD). toISOString() usaria UTC e, entre 21h e
// 24h no Brasil, já devolveria o dia seguinte.
export function hojeISO(agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`
}

// Ações de status oferecidas na tela (PATCH /campanhas/{id}/status), por perfil, conforme o
// contrato (rota 17): a dona publica o rascunho e encerra a campanha ativa; o ADMIN encerra,
// desativa (motivo obrigatório) e reativa. O servidor continua decidindo: um 409 é exibido.
export function acoesDeStatus(campanha, usuario, hoje = hojeISO()) {
  const admin = usuario?.tipo === 'ADMIN'
  const dona = usuario?.tipo === 'ENTIDADE' && usuario.entidadeId === campanha.entidadeId
  const acoes = []
  if (dona && campanha.status === 'Rascunho') {
    const agendar = campanha.iniciaEm > hoje
    acoes.push({
      status: agendar ? 'AGENDADA' : 'ATIVA',
      rotulo: agendar ? 'Agendar publicação' : 'Publicar campanha',
      confirmacao: agendar
        ? 'A campanha ficará agendada e começará a receber doações na data de início.'
        : 'A campanha aparecerá na vitrine e começará a receber doações.',
    })
  }
  if ((dona || admin) && campanha.status === 'Ativa') {
    acoes.push({
      status: 'ENCERRADA',
      rotulo: 'Encerrar campanha',
      perigo: true,
      confirmacao: 'Encerrar é definitivo: a campanha deixa de receber doações e não pode ser reaberta.',
    })
  }
  if (admin && campanha.status === 'Ativa') {
    acoes.push({
      status: 'DESATIVADA',
      rotulo: 'Desativar campanha',
      perigo: true,
      exigeMotivo: true,
      confirmacao: 'A campanha sai da vitrine e deixa de receber doações até ser reativada.',
    })
  }
  if (admin && campanha.status === 'Desativada') {
    acoes.push({ status: 'ATIVA', rotulo: 'Reativar campanha', confirmacao: 'A campanha volta a receber doações.' })
  }
  return acoes
}

// Dias restantes até o término (data real; 0 quando já terminou).
export const diasAte = (fim, hoje = hojeISO()) => diasRestantes(fim, hoje)
