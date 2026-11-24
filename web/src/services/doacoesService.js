import api from './api'
import { mapDoacao } from './mappers'

// Chave de idempotência por tentativa de doação: reenviar com a mesma chave
// devolve a doação já criada (HTTP 200) em vez de duplicar.
export const novaChaveIdempotencia = () => globalThis.crypto.randomUUID()

export const doacoesService = {
  listar: (params, config) => api.get('/doacoes', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/doacoes/${id}`, config).then((r) => r.data),
  // POST /doacoes (doador PF/PJ autenticado). A API só aceita PIX e exige exatamente
  // um destino: campanhaId OU entidadeId.
  registrar: ({ campanhaId, valor, anonima, observacao }, chave) =>
    api
      .post(
        '/doacoes',
        { campanhaId, valor, formaPagamento: 'PIX', anonima, observacao: observacao || undefined },
        { headers: { 'Idempotency-Key': chave } },
      )
      .then((r) => mapDoacao(r.data.data)),
}
