import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

const api = axios.create({
  baseURL,
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
    return {
      status,
      message: data?.message ?? `Erro ${status} ao processar a requisição.`,
      data,
    }
  }
  if (error.code === 'ECONNABORTED') {
    return { status: null, message: 'Tempo de resposta esgotado.' }
  }
  return { status: null, message: 'Não foi possível conectar ao servidor.' }
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
)

export default api
