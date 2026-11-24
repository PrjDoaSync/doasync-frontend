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
  if (config.method === 'post' && config.url === '/doacoes') {
    return resposta(config, 201, { message: 'Doação registrada com sucesso.', data: doacaoCriadaApi(JSON.parse(config.data)) })
  }
  const detalhe = config.method === 'get' && /^\/campanhas\/([^/]+)$/.exec(config.url)
  if (detalhe) {
    const c = detalheCampanhaApi(detalhe[1])
    return c ? resposta(config, 200, { data: c }) : resposta(config, 404, { error: 'Campanha não encontrada.' })
  }
  return resposta(config, 404, { error: 'Endpoint não simulado nos testes.' })
}
