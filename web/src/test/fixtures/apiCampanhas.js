// Respostas da API no formato do contrato (doasync-backend docs/api-contract.md),
// usadas pelos testes das telas já integradas. Não são dados da aplicação.
// O estado (campanhas, entidades) é recriado antes de cada teste por resetarApiSimulada() (setup.js).
const entidade = (id, nome) => ({ id, razaoSocial: nome, nomeFantasia: nome })
const REDE = entidade('e0000000-0000-4000-8000-000000000001', 'Rede Esperança')
const AMOR = entidade('e0000000-0000-4000-8000-000000000002', 'Amor Inclusivo')
const MAOS = entidade('e0000000-0000-4000-8000-000000000003', 'Mãos que Ajudam')
export const ENTIDADE_SESSAO_ID = REDE.id

function campanha(n, titulo, ent, categoria, metaValor, valorArrecadado, dataFim, status = 'ATIVA', extra = {}) {
  return {
    id: `c0000000-0000-4000-8000-00000000000${n}`,
    titulo,
    descricao: `Descrição de ${titulo}.`,
    categoria,
    metaValor,
    valorArrecadado,
    percentualAtingido: Math.round((valorArrecadado / metaValor) * 10000) / 100,
    dataInicio: '2026-10-01',
    dataFim,
    status,
    recebendoDoacoes: status === 'ATIVA',
    imagemUrl: null,
    motivoDesativacao: null,
    entidade: ent,
    createdAt: `2026-10-0${n}T12:00:00Z`,
    updatedAt: `2026-10-0${n}T12:00:00Z`,
    ...extra,
  }
}

// A vitrine pública só devolve campanhas ATIVA de entidade aprovada.
export const campanhasApi = [
  campanha(1, 'Mesa solidária: alimento para 200 famílias', REDE, 'Alimentação', 30000, 18400, '2027-01-15'),
  campanha(2, 'Volta às aulas: kits escolares', REDE, 'Educação', 12000, 9600, '2027-01-30'),
  campanha(3, 'Cesta básica mensal', MAOS, 'Alimentação', 20000, 4300, '2027-02-20'),
  campanha(4, 'Higiene para todos', AMOR, 'Higiene', 6000, 2150, '2027-01-05'),
]
// Só a entidade dona e o ADMIN veem (GET /campanhas com status).
export const campanhasPrivadasApi = [
  campanha(5, 'Inverno com acolhimento', REDE, 'Vestuário', 15000, 15000, '2026-08-31', 'ENCERRADA'),
  campanha(6, 'Reforma do abrigo', REDE, 'Infraestrutura', 45000, 0, '2027-02-10', 'RASCUNHO'),
  campanha(7, 'Mutirão de Natal', REDE, 'Alimentação', 8000, 0, '2027-01-20', 'AGENDADA', { dataInicio: '2026-12-15' }),
  campanha(8, 'Campanha suspensa', AMOR, 'Saúde', 5000, 300, '2027-03-01', 'DESATIVADA', { motivoDesativacao: 'Dados inconsistentes.' }),
]

const campanhasStore = new Map()
const versoes = new Map()
let proximaCampanha = 1

export const campanhaApi = (id) => campanhasStore.get(id)
export const campanhasDaEntidadeApi = (entidadeId) => [...campanhasStore.values()].filter((c) => c.entidade.id === entidadeId)

export const detalheCampanhaApi = (id) => {
  const c = campanhasStore.get(id)
  return c && {
    ...c,
    versao: versoes.get(id) ?? 0,
    ultimasDoacoes: [
      { valor: 150, dataDoacao: '2026-10-07T14:30:00Z', anonima: false, nomeDoador: 'Ana Oliveira' },
      { valor: 50, dataDoacao: '2026-10-06T09:00:00Z', anonima: true, nomeDoador: 'Doador anônimo' },
    ],
  }
}

// Doações criadas por POST /doacoes nos testes, devolvidas por GET /doacoes/{id}.
// Inclui uma doação já existente para abrir o comprovante direto pela URL.
const doacoesCriadas = new Map()
export const DOACAO_EXISTENTE_ID = 'd0000000-0000-4000-8000-000000000009'

// DoacaoResponse de POST /doacoes (a API registra direto como CONFIRMADA).
export function doacaoCriadaApi({ campanhaId, valor, anonima, observacao }) {
  const c = campanhasApi.find((item) => item.id === campanhaId)
  return {
    id: 'd0000000-0000-4000-8000-000000000001',
    codigoComprovante: 'DS-2E95E189B340',
    valor,
    formaPagamento: 'PIX',
    status: 'CONFIRMADA',
    anonima: Boolean(anonima),
    ...(observacao && { observacao }),
    dataDoacao: '2026-11-23T22:08:59Z',
    campanha: { id: c.id, titulo: c.titulo },
    entidade: c.entidade,
    doador: { id: 'u0000000-0000-4000-8000-000000000002', nome: 'Maria Souza' },
  }
}

// EntidadeResposta das entidades das campanhas acima (a Rede Esperança é a da sessão de teste).
const entidadeApi = (e, status = 'APROVADA') => ({
  id: e.id, cnpj: '11.222.333/0001-81', razaoSocial: e.razaoSocial, nomeFantasia: e.nomeFantasia,
  descricao: `Sobre ${e.nomeFantasia}.`, areaAtuacao: 'Saúde', site: 'https://exemplo.org', logoUrl: null,
  statusAprovacao: status, motivoReprovacao: null, dataAprovacao: '2026-10-01T12:00:00Z',
  emailContato: 'contato@exemplo.org', telefoneContato: '4833330000', whatsapp: null, endereco: null,
  usuario: { id: 'u0000000-0000-4000-8000-000000000001', nome: 'Ana Silva', email: 'ana@redeesperanca.org.br', status: 'ATIVO' },
  createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-10-01T12:00:00Z',
})
const entidadesApi = new Map()
export const entidadeDaSessao = () => entidadesApi.get(REDE.id)
export const definirEntidadeApi = (dados) => entidadesApi.set(dados.id, { ...entidadesApi.get(dados.id), ...dados })

export function resetarApiSimulada() {
  entidadesApi.clear()
  for (const e of [REDE, AMOR, MAOS]) entidadesApi.set(e.id, entidadeApi(e))
  campanhasStore.clear()
  versoes.clear()
  proximaCampanha = 1
  for (const c of [...campanhasApi, ...campanhasPrivadasApi]) campanhasStore.set(c.id, structuredClone(c))
  doacoesCriadas.clear()
  doacoesCriadas.set(DOACAO_EXISTENTE_ID, {
    ...doacaoCriadaApi({ campanhaId: campanhasApi[0].id, valor: 150, anonima: false, observacao: 'Força!' }),
    id: DOACAO_EXISTENTE_ID,
    codigoComprovante: 'DS-0000EXISTE',
    dataDoacao: '2026-11-20T14:30:00Z',
  })
}
resetarApiSimulada()

const resposta = (config, status, data) =>
  status >= 400
    ? Promise.reject({ response: { status, data }, config, isAxiosError: true })
    : Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })

const paginado = (lista) => ({ data: lista, meta: { total: lista.length, page: 1, limit: 50, totalPages: 1 } })

// Transições aceitas por PATCH /campanhas/{id}/status (Campanha.trocarStatus no backend).
const TRANSICOES = { RASCUNHO: ['AGENDADA', 'ATIVA', 'DESATIVADA'], AGENDADA: ['ATIVA', 'DESATIVADA'], ATIVA: ['ENCERRADA', 'DESATIVADA'] }

function rotasCampanhas(config) {
  const { method, url } = config
  if (method === 'get' && url === '/campanhas') {
    const { status, entidadeId } = config.params ?? {}
    // Sem status: visão pública (ATIVA). Com status: tudo daquele status (dona/ADMIN).
    const lista = [...campanhasStore.values()].filter(
      (c) => (status ? c.status === status : c.status === 'ATIVA') && (!entidadeId || c.entidade.id === entidadeId),
    )
    return resposta(config, 200, paginado(lista))
  }
  if (method === 'post' && url === '/campanhas') {
    const corpo = JSON.parse(config.data)
    const id = `c1000000-0000-4000-8000-00000000000${proximaCampanha++}`
    const status = corpo.rascunho ? 'RASCUNHO' : corpo.dataInicio > '2026-11-25' ? 'AGENDADA' : 'ATIVA'
    const dados = { ...corpo }
    delete dados.rascunho
    const nova = { ...campanha(9, corpo.titulo, REDE, corpo.categoria ?? null, corpo.metaValor, 0, corpo.dataFim, status), ...dados, id }
    campanhasStore.set(id, nova)
    return resposta(config, 201, { data: detalheCampanhaApi(id) })
  }
  const statusRota = /^\/campanhas\/([^/]+)\/status$/.exec(url)
  if (method === 'patch' && statusRota) {
    const c = campanhasStore.get(statusRota[1])
    if (!c) return resposta(config, 404, { error: 'Campanha não encontrada.' })
    const { status, motivo } = JSON.parse(config.data)
    if (!(TRANSICOES[c.status] ?? []).includes(status)) {
      return resposta(config, 409, { error: `Transição de ${c.status} para ${status} não é permitida.` })
    }
    if (status === 'DESATIVADA' && !motivo?.trim()) {
      return resposta(config, 422, { erros: { motivo: 'Motivo é obrigatório para desativar uma campanha.' } })
    }
    campanhasStore.set(c.id, { ...c, status, recebendoDoacoes: status === 'ATIVA', motivoDesativacao: status === 'DESATIVADA' ? motivo : null })
    versoes.set(c.id, (versoes.get(c.id) ?? 0) + 1)
    return resposta(config, 200, { data: detalheCampanhaApi(c.id) })
  }
  const umaRota = /^\/campanhas\/([^/]+)$/.exec(url)
  if (umaRota && method === 'patch') {
    const c = campanhasStore.get(umaRota[1])
    if (!c) return resposta(config, 404, { error: 'Campanha não encontrada.' })
    if (['ENCERRADA', 'DESATIVADA'].includes(c.status)) {
      return resposta(config, 409, { error: 'Campanha encerrada ou desativada não pode ser editada.' })
    }
    const { versao, ...dados } = JSON.parse(config.data)
    if (versao !== (versoes.get(c.id) ?? 0)) return resposta(config, 409, { error: 'Campanha alterada por outra operação.' })
    campanhasStore.set(c.id, { ...c, ...dados })
    versoes.set(c.id, versao + 1)
    return resposta(config, 200, { data: detalheCampanhaApi(c.id) })
  }
  if (umaRota && method === 'get') {
    const c = detalheCampanhaApi(umaRota[1])
    return c ? resposta(config, 200, { data: c }) : resposta(config, 404, { error: 'Campanha não encontrada.' })
  }
  return null
}

function rotasEntidades(config) {
  const entidadeRota = /^\/entidades\/([^/]+)$/.exec(config.url)
  if (entidadeRota && (config.method === 'get' || config.method === 'patch')) {
    const atual = entidadesApi.get(entidadeRota[1])
    if (!atual) return resposta(config, 404, { error: 'Entidade não encontrada.' })
    if (config.method === 'patch') {
      // Como a API real, o responsável é gravado mas não volta na resposta.
      const campos = JSON.parse(config.data)
      delete campos.responsavelNome
      delete campos.responsavelCpf
      entidadesApi.set(atual.id, { ...atual, ...campos, endereco: campos.endereco ?? atual.endereco })
    }
    return resposta(config, 200, { data: entidadesApi.get(atual.id) })
  }
  return null
}

function rotasDoacoes(config) {
  if (config.method === 'post' && config.url === '/doacoes') {
    const doacao = doacaoCriadaApi(JSON.parse(config.data))
    doacoesCriadas.set(doacao.id, doacao)
    return resposta(config, 201, { message: 'Doação registrada com sucesso.', data: doacao })
  }
  if (config.method === 'get' && config.url === '/usuarios/me/doacoes') {
    const lista = [...doacoesCriadas.values()].sort((a, b) => b.dataDoacao.localeCompare(a.dataDoacao))
    return resposta(config, 200, paginado(lista))
  }
  const comprovante = config.method === 'get' && /^\/doacoes\/([^/]+)$/.exec(config.url)
  if (comprovante) {
    const d = doacoesCriadas.get(comprovante[1])
    return d ? resposta(config, 200, { data: d }) : resposta(config, 404, { error: 'Doação não encontrada.' })
  }
  return null
}

// Adaptador Axios que responde como o backend.
export function adaptadorApiPadrao(config) {
  return (
    rotasCampanhas(config) ??
    rotasEntidades(config) ??
    rotasDoacoes(config) ??
    resposta(config, 404, { error: 'Endpoint não simulado nos testes.' })
  )
}
