import api from './api'
import { mapCampanha, mapPaginado } from './mappers'

// A vitrine pública da API devolve no máximo 50 itens por página (contrato do backend).
const LIMITE_VITRINE = 50
const STATUS_GESTAO = ['RASCUNHO', 'AGENDADA', 'ATIVA', 'ENCERRADA', 'DESATIVADA']

export const campanhasService = {
  listar: (params, config) => api.get('/campanhas', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/campanhas/${id}`, config).then((r) => r.data),
  // Campanhas públicas já no formato das telas (filtros e paginação da vitrine ficam no front).
  listarPublicas: (config) =>
    api
      .get('/campanhas', { params: { limit: LIMITE_VITRINE }, ...config })
      .then((r) => mapPaginado(r.data, mapCampanha).itens),
  // Campanhas da gestão em todos os status. Sem `status` a API devolve só a visão pública,
  // então pedimos um status por vez: a entidade dona filtra pelo próprio entidadeId; o ADMIN, sem ele.
  daGestao: ({ entidadeId } = {}, config) =>
    Promise.all(
      STATUS_GESTAO.map((status) =>
        api
          .get('/campanhas', { params: { status, limit: LIMITE_VITRINE, ...(entidadeId && { entidadeId }) }, ...config })
          .then((r) => mapPaginado(r.data, mapCampanha).itens),
      ),
    ).then((listas) => listas.flat().sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))),
  // Detalhe público; 404 (inexistente, rascunho ou sem acesso) vira null.
  buscarPublica: (id, config) =>
    api
      .get(`/campanhas/${id}`, config)
      .then((r) => mapCampanha(r.data.data))
      .catch((erro) => {
        if (erro?.status === 404) return null
        throw erro
      }),
}
