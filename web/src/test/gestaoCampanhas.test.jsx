// Gestão de campanhas integrada a GET /campanhas por status (passo 18).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import axios from 'axios'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { ENTIDADE_SESSAO_ID, adaptadorApiPadrao, campanhasApi, campanhasPrivadasApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

const sessao = (usuario) => salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, ...usuario } })
const linhas = () => screen.getAllByRole('row').slice(1)
const linhaDe = (texto) => within(screen.getByText(texto).closest('tr'))
const kpi = (rotulo) => screen.getByText(rotulo).closest('.kpi')

function espionar() {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

async function abrir() {
  render(
    <MemoryRouter initialEntries={['/campanhas']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('table')
  return userEvent.setup()
}

const daSessao = [...campanhasApi, ...campanhasPrivadasApi].filter((c) => c.entidade.id === ENTIDADE_SESSAO_ID)

// Estados de lista vazia e de erro com nova tentativa (porta dos testes do PR #147, Gustavo).
function renderizar() {
  render(
    <MemoryRouter initialEntries={['/campanhas']}>
      <App />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('gestão de campanhas: estados', () => {
  it('entidade sem campanhas vê a lista vazia com indicadores zerados', async () => {
    api.defaults.adapter = (config) =>
      config.url === '/campanhas' && config.params?.status
        ? Promise.resolve({ data: { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 1 } }, status: 200, headers: {}, config })
        : adaptadorApiPadrao(config)
    renderizar()
    expect(await screen.findByText('Nenhuma campanha cadastrada ainda.')).toBeTruthy()
    expect(kpi('Campanhas ativas').textContent).toContain('0')
  })

  it('falha de rede mostra o erro e "Tentar novamente" recarrega a lista', async () => {
    let falhar = true
    api.defaults.adapter = (config) =>
      falhar && config.url === '/campanhas' && config.params?.status
        ? Promise.reject(new axios.AxiosError('Network Error', 'ERR_NETWORK', config))
        : adaptadorApiPadrao(config)
    const user = renderizar()
    expect(await screen.findByText('Não foi possível conectar ao servidor.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
    falhar = false
    await user.click(screen.getByRole('button', { name: /Tentar novamente/ }))
    expect(await screen.findByText('Mesa solidária: alimento para 200 famílias')).toBeTruthy()
  })
})

describe('gestão de campanhas', () => {
  it('a entidade vê as próprias campanhas em todos os status (uma chamada por status)', async () => {
    const chamadas = espionar()
    await abrir()
    const pedidos = chamadas.filter((c) => c.url === '/campanhas')
    expect(pedidos.map((c) => c.params.status).sort()).toEqual(['AGENDADA', 'ATIVA', 'DESATIVADA', 'ENCERRADA', 'RASCUNHO'])
    expect(pedidos.every((c) => c.params.entidadeId === ENTIDADE_SESSAO_ID)).toBe(true)
    expect(pedidos.every((c) => c.headers.Authorization === `Bearer ${SESSAO_ENTIDADE_TESTE.token}`)).toBe(true)
    expect(linhas()).toHaveLength(daSessao.length)
    expect(screen.queryByText('Cesta básica mensal')).toBeNull() // de outra entidade
    expect(kpi('Campanhas ativas').textContent).toContain(String(daSessao.filter((c) => c.status === 'ATIVA').length))
    expect(screen.getByRole('link', { name: /Criar campanha/ }).getAttribute('href')).toBe('/campanhas/nova')
  })

  it('oferece editar só enquanto a campanha não terminou', async () => {
    await abrir()
    const rascunho = linhaDe('Reforma do abrigo')
    expect(rascunho.getByText('Rascunho')).toBeTruthy()
    expect(rascunho.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(`/campanhas/${campanhasPrivadasApi[1].id}/editar`)
    const encerrada = linhaDe('Inverno com acolhimento')
    expect(encerrada.queryByRole('link', { name: 'Editar' })).toBeNull()
    expect(encerrada.getByRole('img', { name: '100% da meta' })).toBeTruthy()
    expect(encerrada.getByRole('link', { name: 'Acompanhar' }).getAttribute('href')).toBe(`/campanhas/${campanhasPrivadasApi[0].id}/acompanhamento`)
    // Só a encerrada oferece a prestação de contas.
    expect(screen.getAllByRole('link', { name: 'Prestar contas' })).toHaveLength(1)
    expect(encerrada.getByRole('link', { name: 'Prestar contas' }).getAttribute('href')).toBe(`/campanhas/${campanhasPrivadasApi[0].id}/prestacao-de-contas`)
  })

  it('filtra por status e por texto', async () => {
    const user = await abrir()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), 'Agendada')
    expect(linhas()).toHaveLength(1)
    expect(screen.getByText('Mutirão de Natal')).toBeTruthy()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), '')
    await user.type(screen.getByRole('searchbox', { name: /Busque por campanha/ }), 'EDUCAÇÃO')
    expect(linhas()).toHaveLength(1)
    await user.type(screen.getByRole('searchbox', { name: /Busque por campanha/ }), 'zzz')
    expect(screen.getByText('Nenhuma campanha encontrada.')).toBeTruthy()
  })

  it('o ADMIN vê as campanhas de todas as entidades, sem criar nem editar', async () => {
    const chamadas = espionar()
    sessao({ tipo: 'ADMIN', entidadeId: null, statusEntidade: null })
    await abrir()
    expect(chamadas.filter((c) => c.url === '/campanhas').every((c) => !('entidadeId' in c.params))).toBe(true)
    expect(screen.getByText('Cesta básica mensal')).toBeTruthy()
    expect(screen.getByText('Campanha suspensa')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Criar campanha/ })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull()
  })

  it('entidade pendente vê o aviso e não pode criar campanha', async () => {
    sessao({ statusEntidade: 'PENDENTE' })
    await abrir()
    expect(screen.getByText(/ainda não foi aprovada/)).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Criar campanha/ })).toBeNull()
  })
})
