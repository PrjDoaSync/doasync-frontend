import api from './api'
import { mapEntidade } from './mappers'

export const entidadesService = {
  listar: (params, config) => api.get('/entidades', { params, ...config }).then((r) => r.data),
  publicas: (config) => api.get('/entidades', config).then((r) => r.data.data.map(mapEntidade)),
  buscarAprovada: (id, config) => entidadesService.buscar(id, config)
    .then((entidade) => entidade.status === 'Aprovada' ? entidade : null)
    .catch((erro) => { if (erro?.status === 404) return null; throw erro }),
  buscarPorId: (id, config) => api.get(`/entidades/${id}`, config).then((r) => r.data),
  // GET /entidades/{id}: dono e ADMIN veem qualquer status e o `usuario` (LGPD).
  buscar: (id, config) => api.get(`/entidades/${id}`, config).then((r) => mapEntidade(r.data.data)),
  alterarStatus: (id, corpo) => api.patch(`/entidades/${id}/status`, corpo).then((r) => mapEntidade(r.data.data)),
  // PATCH /entidades/{id} (dono ou ADMIN): campos ausentes/null mantêm o valor atual.
  atualizar: (id, corpo) => api.patch(`/entidades/${id}`, corpo).then((r) => mapEntidade(r.data.data)),
}
