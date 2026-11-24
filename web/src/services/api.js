import axios from 'axios'
import { API_URL } from './config'
import { EVENTO_SESSAO_ENCERRADA, limparSessao, obterToken } from './token'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Converte qualquer erro do Axios em um objeto padronizado para as telas
// (usado no tratamento de erros da issue #36).
export function normalizeError(error) {
  if (axios.isCancel(error)) {
    return { status: null, message: 'Requisição cancelada.', cancelled: true }
  }
  if (error.response) {
    const { status, data } = error.response
    // O backend responde { error: "..." } ou, em validação (422), { erros: { campo: "..." } }.
    const campos = data?.erros && typeof data.erros === 'object' ? data.erros : null
    const normalizado = {
      status,
      message:
        data?.message ??
        data?.error ??
        (campos && Object.values(campos)[0]) ??
        `Erro ${status} ao processar a requisição.`,
      data,
    }
    if (campos) normalizado.campos = campos
    return normalizado
  }
  if (error.code === 'ECONNABORTED') {
    return { status: null, message: 'Tempo de resposta esgotado.' }
  }
  return { status: null, message: 'Não foi possível conectar ao servidor.' }
}

// Envia o token da sessão em todas as chamadas; rotas públicas o ignoram.
api.interceptors.request.use((config) => {
  const token = obterToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizado = normalizeError(error)
    // 401 com token (fora do login) = sessão expirada ou usuário desativado: encerra a sessão.
    const comToken = Boolean(error.config?.headers?.Authorization)
    if (normalizado.status === 401 && comToken && error.config?.url !== '/auth/login') {
      limparSessao()
      window.dispatchEvent(new Event(EVENTO_SESSAO_ENCERRADA))
    }
    return Promise.reject(normalizado)
  },
)

export default api
