import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import api from '../services/api'
import * as fonte from '../mocks/gestao'

// Modo integrado: as telas públicas leem GET /campanhas em vez dos dados de demonstração.
vi.mock('../services/config', () => ({ USE_API: true, API_URL: 'http://localhost:8080/api/v1' }))

const campanhaApi = {
  id: 'd070d076-f9e3-49b9-933c-4e5fce8e1765',
  titulo: 'Campanha vinda da API',
  descricao: 'Descrição real',
  categoria: 'Saúde',
  metaValor: 1000,
  valorArrecadado: 250,
  percentualAtingido: 25,
  dataInicio: '2026-11-01',
  dataFim: '2026-12-31',
  status: 'ATIVA',
  recebendoDoacoes: true,
  imagemUrl: null,
  entidade: { id: 'a362', razaoSocial: 'APAE Teste', nomeFantasia: null },
  createdAt: '2026-11-23T22:08:45Z',
}

const adapterOriginal = api.defaults.adapter
let chamadas
function responder(corpo, status = 200) {
  chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    if (status >= 400) {
      return Promise.reject({ response: { status, data: corpo }, config, isAxiosError: true })
    }
    return Promise.resolve({ data: corpo, status, statusText: 'OK', headers: {}, config })
  }
}

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)
afterEach(() => {
  api.defaults.adapter = adapterOriginal
})

function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
}

describe('vitrine integrada à API (passo 6)', () => {
  it('Home mostra as campanhas de GET /campanhas, não as da demonstração', async () => {
    responder({ data: [campanhaApi], meta: { total: 1, page: 1, limit: 50, totalPages: 1 } })
    abrir('/')
    expect(await screen.findAllByText('Campanha vinda da API')).not.toHaveLength(0)
    expect(screen.queryByText('Mesa solidária: alimento para 200 famílias')).toBeNull()
    expect(chamadas[0]).toMatchObject({ url: '/campanhas', method: 'get', params: { limit: 50 } })
  })

  it('Explorar lista e conta as campanhas da API', async () => {
    responder({ data: [campanhaApi], meta: { total: 1, page: 1, limit: 50, totalPages: 1 } })
    abrir('/explorar')
    expect(await screen.findByText('Campanha vinda da API')).toBeTruthy()
    expect(screen.getByText('campanhas encontradas').parentElement.textContent).toMatch(/^1/)
    expect(screen.getByRole('option', { name: 'Saúde' })).toBeTruthy()
  })

  it('mostra o erro da API quando a consulta falha', async () => {
    responder({ error: 'Erro interno.' }, 500)
    abrir('/explorar')
    expect(await screen.findByText(/Erro interno\./)).toBeTruthy()
  })
})
