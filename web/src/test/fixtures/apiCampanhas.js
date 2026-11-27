// Respostas da API no formato do contrato (doasync-backend docs/api-contract.md),
// usadas pelos testes das telas já integradas. Não são dados da aplicação.
const entidade = (id, nome) => ({ id, razaoSocial: nome, nomeFantasia: nome })
const REDE = entidade('e0000000-0000-4000-8000-000000000001', 'Rede Esperança')
const AMOR = entidade('e0000000-0000-4000-8000-000000000002', 'Amor Inclusivo')
const MAOS = entidade('e0000000-0000-4000-8000-000000000003', 'Mãos que Ajudam')

function campanha(n, titulo, ent, categoria, metaValor, valorArrecadado, dataFim) {
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
    status: 'ATIVA',
    recebendoDoacoes: true,
    imagemUrl: null,
    motivoDesativacao: null,
    entidade: ent,
    createdAt: `2026-10-0${n}T12:00:00Z`,
    updatedAt: `2026-10-0${n}T12:00:00Z`,
  }
}

// A vitrine pública só devolve campanhas ATIVA de entidade aprovada.
export const campanhasApi = [
  campanha(1, 'Mesa solidária: alimento para 200 famílias', REDE, 'Alimentação', 30000, 18400, '2027-01-15'),
  campanha(2, 'Volta às aulas: kits escolares', REDE, 'Educação', 12000, 9600, '2027-01-30'),
  campanha(3, 'Cesta básica mensal', MAOS, 'Alimentação', 20000, 4300, '2027-02-20'),
  campanha(4, 'Higiene para todos', AMOR, 'Higiene', 6000, 2150, '2027-01-05'),
]

// Campanhas da Rede Esperança (entidade da sessão de teste) fora da vitrine pública:
// só aparecem para a dona, pedindo o status em GET /campanhas.
const comStatus = (c, status, extra = {}) => ({ ...c, status, recebendoDoacoes: status === 'ATIVA', ...extra })
export const campanhasPrivadasApi = [
  comStatus(campanha(5, 'Inverno com acolhimento', REDE, 'Vestuário', 8000, 8000, '2026-08-31'), 'ENCERRADA'),
  comStatus(campanha(6, 'Biblioteca comunitária', REDE, 'Educação', 5000, 0, '2027-03-01'), 'RASCUNHO'),
  comStatus(campanha(7, 'Natal das crianças', REDE, 'Lazer', 4000, 0, '2027-12-24'), 'AGENDADA', {
    dataInicio: '2027-12-01',
  }),
]

// Campanhas criadas por POST /campanhas no teste atual (zeradas a cada teste no setup).
const campanhasCriadas = []
export function reiniciarCampanhasCriadas() {
  campanhasCriadas.length = 0
}

const ENTIDADE_SESSAO = REDE.id
const todasAsCampanhas = () => [...campanhasApi, ...campanhasPrivadasApi, ...campanhasCriadas]

// POST /campanhas: o servidor calcula o status (RASCUNHO, AGENDADA ou ATIVA).
export function campanhaCriadaApi(corpo, hoje = '2026-11-26') {
  const status = corpo.rascunho ? 'RASCUNHO' : corpo.dataInicio > hoje ? 'AGENDADA' : 'ATIVA'
  return {
    ...campanha(8, corpo.titulo, REDE, corpo.categoria ?? null, corpo.metaValor, 0, corpo.dataFim),
    id: `c0000000-0000-4000-8000-0000000001${String(campanhasCriadas.length).padStart(2, '0')}`,
    descricao: corpo.descricao,
    dataInicio: corpo.dataInicio,
    percentualAtingido: 0,
    status,
    recebendoDoacoes: status === 'ATIVA',
    createdAt: '2026-11-26T12:00:00Z',
  }
}

export const detalheCampanhaApi = (id) => {
  const c = todasAsCampanhas().find((item) => item.id === id)
  return c && {
    ...c,
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

doacoesCriadas.set(DOACAO_EXISTENTE_ID, {
  ...doacaoCriadaApi({ campanhaId: campanhasApi[0].id, valor: 150, anonima: false, observacao: 'Força!' }),
  id: DOACAO_EXISTENTE_ID,
  codigoComprovante: 'DS-0000EXISTE',
  dataDoacao: '2026-11-20T14:30:00Z',
})

const resposta = (config, status, data) =>
  status >= 400
    ? Promise.reject({ response: { status, data }, config, isAxiosError: true })
    : Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })

// Adaptador Axios que responde como o backend para as rotas públicas de campanhas.
export function adaptadorApiPadrao(config) {
  if (config.method === 'get' && config.url === '/campanhas' && config.params?.status) {
    // Filtro por status: só vale para a entidade dona com token (senão a API usa o filtro público).
    const { entidadeId, status } = config.params
    const dona = Boolean(config.headers?.Authorization) && entidadeId === ENTIDADE_SESSAO
    const lista = dona
      ? todasAsCampanhas().filter((c) => c.entidade.id === entidadeId && c.status === status)
      : campanhasApi.filter((c) => !entidadeId || c.entidade.id === entidadeId)
    return resposta(config, 200, {
      data: lista,
      meta: { total: lista.length, page: 1, limit: 50, totalPages: 1 },
    })
  }
  if (config.method === 'post' && config.url === '/campanhas') {
    const corpo = JSON.parse(config.data)
    if (!corpo.titulo || !corpo.descricao || !(corpo.metaValor > 0)) {
      return resposta(config, 422, { erros: { titulo: 'não deve estar em branco' } })
    }
    const criada = campanhaCriadaApi(corpo)
    campanhasCriadas.push(criada)
    return resposta(config, 201, { data: { ...criada, ultimasDoacoes: [] } })
  }
  if (config.method === 'get' && config.url === '/campanhas') {
    return resposta(config, 200, {
      data: campanhasApi,
      meta: { total: campanhasApi.length, page: 1, limit: 50, totalPages: 1 },
    })
  }
  if (config.method === 'post' && config.url === '/doacoes') {
    const doacao = doacaoCriadaApi(JSON.parse(config.data))
    doacoesCriadas.set(doacao.id, doacao)
    return resposta(config, 201, { message: 'Doação registrada com sucesso.', data: doacao })
  }
  if (config.method === 'get' && config.url === '/usuarios/me/doacoes') {
    const lista = [...doacoesCriadas.values()].sort((a, b) => b.dataDoacao.localeCompare(a.dataDoacao))
    return resposta(config, 200, { data: lista, meta: { total: lista.length, page: 1, limit: 50, totalPages: 1 } })
  }
  const comprovante = config.method === 'get' && /^\/doacoes\/([^/]+)$/.exec(config.url)
  if (comprovante) {
    const d = doacoesCriadas.get(comprovante[1])
    return d ? resposta(config, 200, { data: d }) : resposta(config, 404, { error: 'Doação não encontrada.' })
  }
  const detalhe = config.method === 'get' && /^\/campanhas\/([^/]+)$/.exec(config.url)
  if (detalhe) {
    const c = detalheCampanhaApi(detalhe[1])
    return c ? resposta(config, 200, { data: c }) : resposta(config, 404, { error: 'Campanha não encontrada.' })
  }
  return resposta(config, 404, { error: 'Endpoint não simulado nos testes.' })
}
