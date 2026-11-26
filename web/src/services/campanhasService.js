import api from './api'
import { mapCampanha } from './mappers'
import { carregarPaginas } from './paginacao'

// A vitrine pública da API devolve no máximo 50 itens por página (contrato do backend).
const LIMITE_VITRINE = 50
const STATUS_GESTAO = ['RASCUNHO', 'AGENDADA', 'ATIVA', 'ENCERRADA', 'DESATIVADA']

export const campanhasService = {
  listar: (params, config) => api.get('/campanhas', { params, ...config }).then((r) => r.data),
  buscarPorId: (id, config) => api.get(`/campanhas/${id}`, config).then((r) => r.data),
  // Campanhas públicas já no formato das telas (filtros e paginação da vitrine ficam no front).
  listarPublicas: (config) =>
    carregarPaginas(
      (page) => campanhasService.listar({ page, limit: LIMITE_VITRINE }, config),
      mapCampanha,
    ).then(({ itens }) => itens),
  // Campanhas da gestão em todos os status. Sem `status` a API devolve só a visão pública,
  // então pedimos um status por vez: a entidade dona filtra pelo próprio entidadeId; o ADMIN, sem ele.
  /** @param {{entidadeId?: string}} [filtros] @param {import('axios').AxiosRequestConfig} [config] */
  daGestao: ({ entidadeId } = {}, config) =>
    Promise.all(
      STATUS_GESTAO.map((status) => carregarPaginas(
        (page) => campanhasService.listar({ page, status, limit: LIMITE_VITRINE, ...(entidadeId && { entidadeId }) }, config),
        mapCampanha,
      )),
    ).then((listas) => listas.flatMap(({ itens }) => itens).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))),
  // POST /campanhas (ENTIDADE aprovada). rascunho: true → RASCUNHO; senão AGENDADA/ATIVA pela data de início.
  criar: (corpo, rascunho) =>
    api.post('/campanhas', { ...corpo, rascunho }).then((r) => mapCampanha(r.data.data)),
  atualizar: (id, corpo) => api.patch(`/campanhas/${id}`, corpo).then((r) => mapCampanha(r.data.data)),
  alterarStatus: (id, corpo) => api.patch(`/campanhas/${id}/status`, corpo).then((r) => mapCampanha(r.data.data)),
  // O detalhe respeita a sessão atual; 404 vira null.
  buscarPublica: (id, config) =>
    api
      .get(`/campanhas/${id}`, config)
      .then((r) => mapCampanha(r.data.data))
      .catch((erro) => {
        if (erro?.status === 404) return null
        throw erro
      }),
}
