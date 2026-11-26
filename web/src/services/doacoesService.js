import api from './api'
import { mapDoacao, mapPaginado } from './mappers'
import { carregarPaginas } from './paginacao'

// Chave de idempotência por tentativa de doação: reenviar com a mesma chave
// devolve a doação já criada (HTTP 200) em vez de duplicar.
export const novaChaveIdempotencia = () => globalThis.crypto.randomUUID()

export const doacoesService = {
  recebidas: (id, params, config) => api.get(`/entidades/${id}/doacoes`, { ...config, params }).then((r) => mapPaginado(r.data, mapDoacao)),
  historicoEntidade: (id, config) => carregarPaginas(
    (page) => api.get(`/entidades/${id}/doacoes`, { ...config, params: { page, limit: 50 } }).then((r) => r.data),
    mapDoacao,
  ).then(({ itens }) => itens),
  arrecadacao: (id, params, config) => api.get(`/entidades/${id}/arrecadacao`, { ...config, params }).then((r) => r.data.data),
  buscarPorId: (id, config) => api.get(`/doacoes/${id}`, config).then((r) => r.data),
  // GET /usuarios/me/doacoes (doador PF/PJ), mais recentes primeiro. O backend ignora `busca`
  // e limita `limit` a 50: busca e filtros ficam na tela.
  minhas: (config) => carregarPaginas(
    (page) => api.get('/usuarios/me/doacoes', { ...config, params: { page, limit: 50 } }).then((r) => r.data),
    mapDoacao,
  ),
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
  registrar: ({ campanhaId, entidadeId, valor, anonima, observacao }, chave) =>
    api
      .post(
        '/doacoes',
        { campanhaId, entidadeId, valor, formaPagamento: 'PIX', anonima, observacao: observacao || undefined },
        { headers: { 'Idempotency-Key': chave } },
      )
      .then((r) => mapDoacao(r.data.data)),
}
