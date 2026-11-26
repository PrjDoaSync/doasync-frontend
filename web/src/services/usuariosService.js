import api from './api'
import { mapPaginado } from './mappers'

export const usuariosService = {
  meuPerfil: (config) => api.get('/usuarios/me', config).then((r) => r.data.data),
  atualizarPerfil: (corpo) => api.patch('/usuarios/me', corpo).then((r) => r.data.data),
  listar: (params, config) => api.get('/usuarios', { ...config, params }).then((r) => mapPaginado(r.data, (usuario) => usuario)),
  alterarStatus: (id, status) => api.patch(`/usuarios/${id}/status`, { status }).then((r) => r.data.data),
}
