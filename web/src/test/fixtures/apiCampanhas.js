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

export const detalheCampanhaApi = (id) => {
  const c = campanhasApi.find((item) => item.id === id)
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

// EntidadeResposta das entidades das campanhas acima (a Rede Esperança é a da sessão de teste).
// resetarEntidadesApi() volta ao estado inicial (chamado pelo setup antes de cada teste).
const entidadeApi = (e, status = 'APROVADA') => ({
  id: e.id, cnpj: '11.222.333/0001-81', razaoSocial: e.razaoSocial, nomeFantasia: e.nomeFantasia,
  descricao: `Sobre ${e.nomeFantasia}.`, areaAtuacao: 'Saúde', site: 'https://exemplo.org', logoUrl: null,
  statusAprovacao: status, motivoReprovacao: null, dataAprovacao: '2026-10-01T12:00:00Z',
  emailContato: 'contato@exemplo.org', telefoneContato: '4833330000', whatsapp: null, endereco: null,
  usuario: { id: 'u0000000-0000-4000-8000-000000000001', nome: 'Ana Silva', email: 'ana@redeesperanca.org.br', status: 'ATIVO' },
  createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-10-01T12:00:00Z',
})
const entidadesApi = new Map()
export function resetarEntidadesApi() {
  entidadesApi.clear()
  for (const e of [REDE, AMOR, MAOS]) entidadesApi.set(e.id, entidadeApi(e))
}
export const entidadeDaSessao = () => entidadesApi.get(REDE.id)
export const definirEntidadeApi = (dados) => entidadesApi.set(dados.id, { ...entidadesApi.get(dados.id), ...dados })
resetarEntidadesApi()

const resposta = (config, status, data) =>
  status >= 400
    ? Promise.reject({ response: { status, data }, config, isAxiosError: true })
    : Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })

// Adaptador Axios que responde como o backend para as rotas públicas de campanhas.
export function adaptadorApiPadrao(config) {
  if (config.method === 'get' && config.url === '/campanhas') {
    return resposta(config, 200, {
      data: campanhasApi,
      meta: { total: campanhasApi.length, page: 1, limit: 50, totalPages: 1 },
    })
  }
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
