import api from './api'

export const doacoesService = {
  listar: (params, config) => api.get('/doacoes', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/doacoes/${id}`, config).then((r) => r.data),
}
