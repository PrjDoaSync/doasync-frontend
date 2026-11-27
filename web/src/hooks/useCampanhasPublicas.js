import { useRequest } from './useRequest'
import { campanhasService } from '../services/campanhasService'

// Campanhas da vitrine pública (GET /campanhas), no formato de useRequest.
export function useCampanhasPublicas() {
  return useRequest(campanhasService.listarPublicas)
}

// Uma campanha da vitrine pública (GET /campanhas/{id}); data === null quando não existe ou não é pública.
export function useCampanhaPublica(id) {
  return useRequest((config) => campanhasService.buscarPublica(id, config), [id])
}

// Campanhas da entidade logada em todos os status (Minhas campanhas, #91).
export function useCampanhasDaEntidade(entidadeId) {
  return useRequest((config) => campanhasService.listarDaEntidade(entidadeId, config), [entidadeId])
}
