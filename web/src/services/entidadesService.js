import api from './api'

export const entidadesService = {
  listar: (params, config) => api.get('/entidades', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/entidades/${id}`, config).then((r) => r.data),
}
