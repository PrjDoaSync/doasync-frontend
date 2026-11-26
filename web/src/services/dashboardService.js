import api from './api'

export const dashboardService = {
  kpis: (config) => api.get('/dashboard/kpis', config).then((r) => r.data.data),
}
