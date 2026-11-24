import { useRequest } from './useRequest'
import { doacoesService } from '../services/doacoesService'

// Uma doação (GET /doacoes/{id}); data === null quando não existe ou não pertence ao usuário.
export function useDoacao(id) {
  return useRequest((config) => doacoesService.buscar(id, config), [id])
}

// Histórico do doador autenticado (GET /usuarios/me/doacoes): { itens, total, ... }.
export function useMinhasDoacoes() {
  return useRequest(doacoesService.minhas)
}
