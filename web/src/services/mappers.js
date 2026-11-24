// Converte respostas da API (docs/api-contract.md do doasync-backend) para o
// formato que as telas já consomem nos dados de demonstração (mocks/gestao.js).

const STATUS_CAMPANHA = {
  RASCUNHO: 'Rascunho',
  AGENDADA: 'Agendada',
  ATIVA: 'Ativa',
  ENCERRADA: 'Encerrada',
  DESATIVADA: 'Desativada',
}

// A API ainda não recebe upload de imagem; sem imagemUrl usamos uma capa neutra.
export const IMAGEM_PADRAO = '/images/cestas.jpg'

const numero = (valor) => (valor == null ? 0 : Number(valor))
const dataISO = (instante) => (instante ? String(instante).slice(0, 10) : '')

export function mapStatusCampanha(status) {
  return STATUS_CAMPANHA[status] ?? status ?? ''
}

// CampanhaResposta / CampanhaDetalheResposta → campanha usada nas telas.
export function mapCampanha(api) {
  const entidade = api.entidade ?? {}
  return {
    id: api.id,
    nome: api.titulo ?? '',
    descricao: api.descricao ?? '',
    categoria: api.categoria ?? '',
    entidade: entidade.nomeFantasia || entidade.razaoSocial || '',
    entidadeId: entidade.id ?? null,
    meta: numero(api.metaValor),
    arrecadado: numero(api.valorArrecadado),
    percentual: numero(api.percentualAtingido),
    status: mapStatusCampanha(api.status),
    recebendoDoacoes: Boolean(api.recebendoDoacoes),
    iniciaEm: api.dataInicio ?? '',
    encerraEm: api.dataFim ?? '',
    criadaEm: dataISO(api.createdAt),
    imagem: api.imagemUrl || IMAGEM_PADRAO,
    motivoDesativacao: api.motivoDesativacao ?? null,
    // Campos de demonstração sem equivalente na API (doação de itens, localização).
    cidade: '',
    itensMeta: 0,
    itensRecebidos: 0,
    necessidades: [],
    ultimasDoacoes: (api.ultimasDoacoes ?? []).map((d) => ({
      valor: numero(d.valor),
      data: dataISO(d.dataDoacao),
      anonima: Boolean(d.anonima),
      doador: d.nomeDoador ?? 'Doador anônimo',
    })),
  }
}

// Envelope paginado { data, meta } → { itens, total, pagina, limite, totalPaginas }.
export function mapPaginado(resposta, mapItem) {
  const meta = resposta?.meta ?? {}
  const itens = (resposta?.data ?? []).map(mapItem)
  return {
    itens,
    total: meta.total ?? itens.length,
    pagina: meta.page ?? 1,
    limite: meta.limit ?? itens.length,
    totalPaginas: meta.totalPages ?? 1,
  }
}
