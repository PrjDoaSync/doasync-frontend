// Minhas doações (GET /usuarios/me/doacoes) e detalhe (GET /doacoes/{id}) — passo 15.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { limparSessao, salvarSessao } from '../services/token'
import { filtrarDoacoes, mesesDisponiveis, nomeDoMes, resumoDoacoes } from '../utils/doacoes'
import { DOACAO_EXISTENTE_ID, adaptadorApiPadrao, campanhasApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

const DOADORA = {
  ...SESSAO_ENTIDADE_TESTE,
  usuario: { id: 'u2', nome: 'Maria Souza', email: 'maria@doasync.local', tipo: 'PESSOA_FISICA', entidadeId: null, statusEntidade: null },
}

// Doações já no formato das telas (mapDoacao).
const doacao = (n, extra) => ({
  id: `d${n}`, comprovante: `DS-00${n}`, valor: 100, formaPagamento: 'PIX', status: 'Confirmada', anonima: false,
  observacao: '', data: `2026-1${n % 2}-0${n}T12:00:00Z`, campanhaId: `c${n % 2}`, campanha: n % 2 ? 'Natal solidário' : 'Cadeiras de rodas',
  entidadeId: 'e1', entidade: 'APAE Florianópolis', doador: 'Maria Souza', ...extra,
})
const lista = [doacao(1), doacao(2, { valor: 50 }), doacao(3, { status: 'Pendente', valor: 30 }), doacao(4, { status: 'Cancelada' })]

describe('regras de Minhas doações', () => {
  it('soma só as confirmadas e conta as causas apoiadas', () => {
    expect(resumoDoacoes(lista)).toEqual({ totalConfirmado: 150, confirmadas: 2, campanhasApoiadas: 2, pendentes: 1 })
  })
  it('filtra por situação, mês e busca (campanha, entidade ou comprovante)', () => {
    expect(filtrarDoacoes(lista, { status: 'Pendente' })).toHaveLength(1)
    expect(filtrarDoacoes(lista, { mes: '2026-10' }).map((d) => d.id)).toEqual(['d2', 'd4'])
    expect(filtrarDoacoes(lista, { busca: 'natal' })).toHaveLength(2)
    expect(filtrarDoacoes(lista, { busca: 'ds-003' })).toHaveLength(1)
  })
  it('lista os meses do histórico', () => {
    expect(mesesDisponiveis(lista)).toEqual(['2026-11', '2026-10'])
    expect(nomeDoMes('2026-10')).toBe('Outubro de 2026')
  })
})

beforeEach(() => {
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo()))
  salvarSessao(DOADORA)
})
async function abrir(rota) {
  render(<MemoryRouter initialEntries={[rota]}><App /></MemoryRouter>)
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

describe('tela Minhas doações', () => {
  it('lista as doações da API com indicadores e leva ao detalhe', async () => {
    const chamadas = []
    api.defaults.adapter = (config) => {
      chamadas.push(config)
      return adaptadorApiPadrao(config)
    }
    const user = await abrir('/minhas-doacoes')
    expect(await screen.findByText('DS-0000EXISTE')).toBeTruthy()
    expect(chamadas.find((c) => c.url === '/usuarios/me/doacoes').params).toEqual({ page: 1, limit: 50 })
    expect(screen.getByText('Olá, Maria. Acompanhe as contribuições feitas com a sua conta.')).toBeTruthy()
    await user.click(screen.getAllByRole('link', { name: /Ver detalhe/ })[0])
    expect(await screen.findByRole('heading', { level: 1, name: /^Doação DS-/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Voltar a Minhas doações/ }).getAttribute('href')).toBe('/minhas-doacoes')
    expect(screen.getByRole('link', { name: /Apoiar esta campanha novamente/ }).getAttribute('href')).toBe(`/doar/${campanhasApi[0].id}`)
  })

  it('filtra, mostra vazio e permite limpar', async () => {
    const user = await abrir('/minhas-doacoes')
    await screen.findByText('DS-0000EXISTE')
    const total = screen.getAllByRole('link', { name: /Ver detalhe/ }).length
    await user.selectOptions(screen.getByLabelText('Situação'), 'Cancelada')
    expect(screen.getByText(/Nenhuma doação encontrada/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getAllByRole('link', { name: /Ver detalhe/ })).toHaveLength(total)
  })

  it('mostra estado vazio sem doações', async () => {
    api.defaults.adapter = (config) =>
      config.url === '/usuarios/me/doacoes'
        ? Promise.resolve({ data: { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } }, status: 200, statusText: 'OK', headers: {}, config })
        : adaptadorApiPadrao(config)
    await abrir('/minhas-doacoes')
    expect(await screen.findByText(/ainda não fez nenhuma doação/)).toBeTruthy()
  })

  it('visitante é convidado a entrar; entidade vê aviso', async () => {
    limparSessao()
    await abrir('/minhas-doacoes')
    expect(screen.getByRole('heading', { level: 1, name: 'Entre para ver suas doações' })).toBeTruthy()
  })

  it('conta de entidade não tem histórico de doador', async () => {
    salvarSessao(SESSAO_ENTIDADE_TESTE)
    await abrir('/minhas-doacoes')
    expect(screen.getByRole('heading', { level: 1, name: 'Histórico disponível só para doadores' })).toBeTruthy()
  })

  it('detalhe inexistente informa que não foi encontrado', async () => {
    await abrir('/minhas-doacoes/00000000-0000-0000-0000-000000000000')
    expect(await screen.findByRole('heading', { level: 1, name: 'Doação não encontrada' })).toBeTruthy()
  })

  it('o detalhe também abre direto pela URL', async () => {
    await abrir(`/minhas-doacoes/${DOACAO_EXISTENTE_ID}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Doação DS-0000EXISTE' })).toBeTruthy()
  })
})
