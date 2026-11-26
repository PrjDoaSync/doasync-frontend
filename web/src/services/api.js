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
  if (error.code === 'API_ORIGIN_MISMATCH') return { status: null, message: 'Destino fora da API configurada.' }
  if (error.response) {
    const { status, data } = error.response
    // O backend responde { error: "..." } ou, em validação (422), { erros: { campo: "..." } }.
    const campos = data?.erros && typeof data.erros === 'object' ? data.erros : null
    const normalizado = {
      status,
      message:
        data?.message ??
        (typeof data?.error === 'string' ? data.error : data?.error?.message) ??
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
  const origem = globalThis.location?.origin ?? 'http://localhost'
  const base = new URL(API_URL, origem)
  const destino = new URL(api.getUri(config), origem)
  const caminho = base.pathname.replace(/\/$/, '')
  if (destino.origin !== base.origin || (destino.pathname !== caminho && !destino.pathname.startsWith(`${caminho}/`))) {
    throw Object.assign(new Error('Destino fora da API configurada.'), { code: 'API_ORIGIN_MISMATCH' })
  }
  const token = obterToken()
  if (token && config.url !== '/auth/login') config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizado = normalizeError(error)
    // 401 com token (fora do login) = sessão expirada ou usuário desativado: encerra a sessão.
    const token = obterToken()
    if (normalizado.status === 401 && token && error.config?.headers?.Authorization === `Bearer ${token}`) {
      limparSessao()
      window.dispatchEvent(new Event(EVENTO_SESSAO_ENCERRADA))
    }
    return Promise.reject(normalizado)
  },
)

export default api
