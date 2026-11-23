// Configuração da integração com a API (ver docs/integracao-api.md).
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

// Liga a leitura da API nas telas já integradas; desligado mantém o modo demonstração.
export const USE_API = import.meta.env.VITE_USE_API === 'true'
