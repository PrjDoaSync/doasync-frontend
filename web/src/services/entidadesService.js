import api from './api'
import { mapEntidade } from './mappers'

export const entidadesService = {
  listar: (params, config) => api.get('/entidades', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/entidades/${id}`, config).then((r) => r.data),
  // GET /entidades/{id}: dono e ADMIN veem qualquer status e o `usuario` (LGPD).
  buscar: (id, config) => api.get(`/entidades/${id}`, config).then((r) => mapEntidade(r.data.data)),
  // GET /entidades: só APROVADA (inclusive para o ADMIN). Usado para o ADMIN escolher a entidade.
  aprovadas: (config) =>
    api.get('/entidades', { params: { limit: 50 }, ...config }).then((r) => (r.data?.data ?? []).map(mapEntidade)),
  // Perfil público (GET /entidades/{id}): só entidade APROVADA; 404 ou outro status viram null.
  buscarPublica: (id, config) =>
    api
      .get(`/entidades/${id}`, config)
      .then((r) => {
        const entidade = mapEntidade(r.data.data)
        return entidade.status === 'Aprovada' ? entidade : null
      })
      .catch((erro) => {
        if (erro?.status === 404) return null
        throw erro
      }),
  // PATCH /entidades/{id}/status (ADMIN): APROVADA | REPROVADA (motivo obrigatório) | INATIVA | PENDENTE.
  alterarStatus: (id, status, motivo) =>
    api
      .patch(`/entidades/${id}/status`, { status, ...(motivo?.trim() && { motivo: motivo.trim() }) })
      .then((r) => r.data),
  // PATCH /entidades/{id} (dono ou ADMIN): campos ausentes/null mantêm o valor atual.
  atualizar: (id, corpo) => api.patch(`/entidades/${id}`, corpo).then((r) => mapEntidade(r.data.data)),
}
