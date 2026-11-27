import api from './api'

export const dashboardService = {
  // GET /dashboard/kpis (ADMIN): indicadores gerais calculados pelo servidor (contrato, rota 20).
  kpis: (config) => api.get('/dashboard/kpis', config).then((r) => r.data.data),
}
