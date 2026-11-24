import api from './api'
import { mapCampanha, mapPaginado } from './mappers'

// A vitrine pública da API devolve no máximo 50 itens por página (contrato do backend).
const LIMITE_VITRINE = 50

export const campanhasService = {
  listar: (params, config) => api.get('/campanhas', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/campanhas/${id}`, config).then((r) => r.data),
  // Campanhas públicas já no formato das telas (filtros e paginação da vitrine ficam no front).
  listarPublicas: (config) =>
    api
      .get('/campanhas', { params: { limit: LIMITE_VITRINE }, ...config })
      .then((r) => mapPaginado(r.data, mapCampanha).itens),
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
