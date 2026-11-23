import { useDemo } from './useDemo'
import { useRequest } from './useRequest'
import { USE_API } from '../services/config'
import { campanhasService } from '../services/campanhasService'

const nuncaResolve = () => new Promise(() => {})

// Campanhas da vitrine pública no formato de useRequest ({ data, loading, error, reload }).
// Com VITE_USE_API=true vêm de GET /campanhas; senão, dos dados de demonstração.
export function useCampanhasPublicas() {
  const { dados } = useDemo()
  const request = useRequest(USE_API ? campanhasService.listarPublicas : nuncaResolve)
  if (!USE_API) return { data: dados.campanhas, loading: false, error: null, reload: () => {} }
  return request
}

// Uma campanha da vitrine pública; data === null quando não existe ou não é pública.
export function useCampanhaPublica(id) {
  const { dados } = useDemo()
  const request = useRequest(
    USE_API ? (config) => campanhasService.buscarPublica(id, config) : nuncaResolve,
    [id],
  )
  if (!USE_API) {
    const campanha = dados.campanhas.find((c) => String(c.id) === id && c.status !== 'Rascunho')
    return { data: campanha ?? null, loading: false, error: null, reload: () => {} }
  }
  return request
}
