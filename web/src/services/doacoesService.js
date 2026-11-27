import api from './api'
import { mapDoacao, mapPaginado } from './mappers'

// Chave de idempotência por tentativa de doação: reenviar com a mesma chave
// devolve a doação já criada (HTTP 200) em vez de duplicar.
export const novaChaveIdempotencia = () => globalThis.crypto.randomUUID()

export const doacoesService = {
  listar: (params, config) => api.get('/doacoes', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/doacoes/${id}`, config).then((r) => r.data),
  // GET /usuarios/me/doacoes (doador PF/PJ), mais recentes primeiro. O backend ignora `busca`
  // e limita `limit` a 50: busca e filtros ficam na tela.
  minhas: (config) =>
    api
      .get('/usuarios/me/doacoes', { params: { limit: 50 }, ...config })
      .then((r) => mapPaginado(r.data, mapDoacao)),
  // GET /entidades/{id}/doacoes (dona ou ADMIN), opcionalmente de uma campanha. Doação anônima
  // chega com `doador: null` para a entidade. Lê todas as páginas (limit máximo 50) para que
  // busca, filtros e totais da tela usem o conjunto completo.
  recebidas: async (entidadeId, { campanhaId } = {}, config) => {
    const pagina = (page) =>
      api
        .get(`/entidades/${entidadeId}/doacoes`, {
          ...config,
          params: { page, limit: 50, ...(campanhaId && { campanhaId }) },
        })
        .then((r) => mapPaginado(r.data, mapDoacao))
    const primeira = await pagina(1)
    const itens = [...primeira.itens]
    for (let page = 2; page <= primeira.totalPaginas; page++) itens.push(...(await pagina(page)).itens)
    return itens
  },
  // GET /entidades/{id}/arrecadacao?dataInicio&dataFim: total de doações CONFIRMADA no período,
  // por campanha (o backend lê dataInicio/dataFim; o contrato do doa-sync cita inicio/fim).
  arrecadacao: (entidadeId, { inicio, fim } = {}, config) =>
    api
      .get(`/entidades/${entidadeId}/arrecadacao`, {
        ...config,
        params: { ...(inicio && { dataInicio: inicio }), ...(fim && { dataFim: fim }) },
      })
      .then((r) => r.data.data),
  // GET /doacoes/{id} (autenticado: doador, entidade dona ou ADMIN); 404 vira null.
  buscar: (id, config) =>
    api
      .get(`/doacoes/${id}`, config)
      .then((r) => mapDoacao(r.data.data))
      .catch((erro) => {
        if (erro?.status === 404) return null
        throw erro
      }),
  // POST /doacoes (doador PF/PJ autenticado). A API só aceita PIX e exige exatamente
  // um destino: campanhaId OU entidadeId.
  registrar: ({ campanhaId, valor, anonima, observacao }, chave) =>
    api
      .post(
        '/doacoes',
        { campanhaId, valor, formaPagamento: 'PIX', anonima, observacao: observacao || undefined },
        { headers: { 'Idempotency-Key': chave } },
      )
      .then((r) => mapDoacao(r.data.data)),
}
