import api from './api'
import { mapCampanha, mapPaginado } from './mappers'

// A vitrine pública da API devolve no máximo 50 itens por página (contrato do backend).
const LIMITE_VITRINE = 50

// Sem `status`, GET /campanhas aplica o filtro público (só ATIVA). A entidade dona só vê
// as demais campanhas pedindo cada status, então "Minhas campanhas" consulta todos.
export const STATUS_DA_ENTIDADE = ['RASCUNHO', 'AGENDADA', 'ATIVA', 'ENCERRADA', 'DESATIVADA']

// Mais recentes primeiro; empates pelo título para a ordem ser estável.
const porCriacao = (a, b) => b.criadaEm.localeCompare(a.criadaEm) || a.nome.localeCompare(b.nome)

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
  // Minhas campanhas (#91): todas as campanhas da entidade logada, em qualquer status.
  // Exige o token da entidade dona; sem ele a API ignora `status` e devolve só as ativas.
  listarDaEntidade: (entidadeId, config) =>
    Promise.all(
      STATUS_DA_ENTIDADE.map((status) =>
        api
          .get('/campanhas', { params: { entidadeId, status, limit: LIMITE_VITRINE }, ...config })
          .then((r) => mapPaginado(r.data, mapCampanha).itens),
      ),
    ).then((listas) => listas.flat().sort(porCriacao)),
  // Criar campanha (#89, #90): POST /campanhas; o status (RASCUNHO, AGENDADA ou ATIVA) vem do servidor.
  criar: (corpo, config) =>
    api.post('/campanhas', corpo, config).then((r) => mapCampanha(r.data.data)),
}
