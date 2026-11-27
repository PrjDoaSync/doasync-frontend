// Relatórios e exportação (GES-08, #112) integrados a GET /entidades/{id}/arrecadacao e
// GET /entidades/{id}/doacoes, com exportação CSV gerada no navegador.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { csvArrecadacao, csvDoacoes } from '../utils/exportarCsv'
import { formatarMoeda } from '../utils/format'
import { resumoRelatorio } from '../utils/relatorios'
import { ENTIDADE_SESSAO_ID, adaptadorApiPadrao, campanhasApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

// Doações recebidas do simulador: confirmadas 150 (Ana), 50 (anônima) e 80 (Ana) na campanha 1,
// 300 (Bruno) na campanha 2; e uma PENDENTE de 20 na campanha 2.
const MESA = campanhasApi[0]
const VOLTA = campanhasApi[1]

beforeEach(() => vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())))
afterEach(() => vi.restoreAllMocks())

async function abrir() {
  render(
    <MemoryRouter initialEntries={['/relatorios']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Relatórios e exportação' })
  return userEvent.setup()
}
function espionarApi() {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}
const kpi = (rotulo) => [...document.querySelectorAll('.kpi')].find((k) => k.querySelector('.kpi__rotulo')?.textContent === rotulo)
const linhas = (nome) => within(screen.getByRole('table', { name: nome })).getAllByRole('row').slice(1)

describe('regras do relatório', () => {
  const doacoes = [
    { id: 'a', data: '2026-10-07T10:00:00Z', status: 'Confirmada', anonima: false, doadorId: 'ana', campanhaId: 'c1', valor: 150 },
    { id: 'b', data: '2026-10-03T10:00:00Z', status: 'Pendente', anonima: false, doadorId: 'bia', campanhaId: 'c2', valor: 20 },
    { id: 'c', data: '2026-10-06T10:00:00Z', status: 'Confirmada', anonima: true, doadorId: null, campanhaId: 'c1', valor: 50 },
  ]
  const arrecadacao = {
    inicio: '2026-10-05', fim: '2026-10-07', totalArrecadado: 200, quantidadeDoacoes: 2,
    porCampanha: [{ campanhaId: 'c1', titulo: 'Mesa', total: 200, quantidade: 2 }],
  }
  it('filtra o período, conta só doadores identificados e calcula o ticket médio', () => {
    const r = resumoRelatorio({ arrecadacao, doacoes, inicio: '2026-10-05', fim: '2026-10-07' })
    expect(r.doacoes.map((d) => d.id)).toEqual(['a', 'c'])
    expect(r).toMatchObject({ total: 200, quantidade: 2, ticketMedio: 100, doadores: 1 })
  })
  it('com campanha escolhida, soma só a campanha', () => {
    const r = resumoRelatorio({ arrecadacao, doacoes, campanhaId: 'c2' })
    expect(r).toMatchObject({ total: 0, quantidade: 0, ticketMedio: 0 })
    expect(r.doacoes.map((d) => d.id)).toEqual(['b'])
  })
  it('gera CSV com ponto e vírgula, decimal brasileiro e proteção contra fórmulas', () => {
    const csv = csvArrecadacao({ inicio: '2026-10-01', fim: '', porCampanha: [{ titulo: '=HYPERLINK("x")', quantidade: 2, total: 1234.5 }, { titulo: null, quantidade: 1, total: 10 }] })
    const [cabecalho, primeira, segunda] = csv.split('\r\n')
    expect(cabecalho).toBe('"Início";"Fim";"Campanha";"Doações";"Total (BRL)"')
    expect(primeira).toBe('"2026-10-01";"";"\'=HYPERLINK(""x"")";"2";"1234,50"')
    expect(segunda).toContain('"Doação direta"')
    const linhaDoacao = csvDoacoes([{ data: '2026-10-07T10:00:00Z', comprovante: 'DS-1', campanha: '', doador: 'Ana', anonima: true, formaPagamento: 'PIX', status: 'Confirmada', valor: 5 }]).split('\r\n')[1]
    expect(linhaDoacao).toBe('"2026-10-07";"DS-1";"Doação direta";"Doador anônimo";"PIX";"Confirmada";"5,00"')
  })
})

describe('tela Relatórios', () => {
  it('mostra a arrecadação da entidade, as doações e libera a exportação CSV', async () => {
    const chamadas = espionarApi()
    await abrir()
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    expect(kpi('Total arrecadado').textContent).toContain(formatarMoeda(580))
    expect(kpi('Ticket médio').textContent).toContain(formatarMoeda(145))
    expect(kpi('Doadores identificados').textContent).toContain('2')
    expect(linhas('Arrecadação por campanha')).toHaveLength(2)
    expect(linhas('Doações do período')).toHaveLength(5)
    expect(screen.getAllByText('Doador anônimo')).toHaveLength(2)
    expect(screen.queryByText(/Ambiente de demonstração/)).toBeNull()
    expect(chamadas.some((c) => c.url === `/entidades/${ENTIDADE_SESSAO_ID}/arrecadacao`)).toBe(true)
    expect(screen.getByRole('button', { name: /Baixar CSV da arrecadação/ }).disabled).toBe(false)
    expect(screen.getByRole('button', { name: /Baixar PDF/ }).disabled).toBe(true)
    expect(screen.getByText(/Aguardando integração · Relatório em PDF/)).toBeTruthy()
  })

  it('filtra por período enviando dataInicio e dataFim à API', async () => {
    const chamadas = espionarApi()
    const user = await abrir()
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-05' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-07' } })
    await user.click(screen.getByRole('button', { name: /Gerar prévia/ }))
    await screen.findByText(/3 registros/)
    expect(kpi('Total arrecadado').textContent).toContain(formatarMoeda(500))
    const ultima = chamadas.filter((c) => c.url?.endsWith('/arrecadacao')).at(-1)
    expect(ultima.params).toEqual({ dataInicio: '2026-10-05', dataFim: '2026-10-07' })
  })

  it('filtra por campanha', async () => {
    const user = await abrir()
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    await user.selectOptions(screen.getByLabelText('Campanha'), VOLTA.id)
    await user.click(screen.getByRole('button', { name: /Gerar prévia/ }))
    await screen.findByText(/2 registros/)
    expect(kpi('Total arrecadado').textContent).toContain(formatarMoeda(300))
    expect(linhas('Arrecadação por campanha')).toHaveLength(1)
    expect(screen.queryByText(MESA.titulo, { selector: 'td' })).toBeNull()
  })

  it('não gera a prévia com período invertido', async () => {
    const chamadas = espionarApi()
    const user = await abrir()
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    const antes = chamadas.length
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-10' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-01' } })
    // O próprio navegador barra o envio (min da data final); nada é consultado.
    expect(screen.getByLabelText('Data final').validity.rangeUnderflow).toBe(true)
    await user.click(screen.getByRole('button', { name: /Gerar prévia/ }))
    expect(chamadas.length).toBe(antes)
    expect(kpi('Total arrecadado').textContent).toContain(formatarMoeda(580))
  })

  it('baixa o CSV da arrecadação no navegador', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:relatorio')
    URL.revokeObjectURL = vi.fn()
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const user = await abrir()
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    await user.click(screen.getByRole('button', { name: /Baixar CSV da arrecadação/ }))
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(clique).toHaveBeenCalledTimes(1)
    expect(clique.mock.contexts[0].download).toBe('arrecadacao-inicio-a-hoje.csv')
  })

  it('ADMIN escolhe a entidade antes de ver o relatório', async () => {
    salvarSessao({
      ...SESSAO_ENTIDADE_TESTE,
      usuario: { id: 'admin', nome: 'Admin DoaSync', email: 'admin@doasync.local', tipo: 'ADMIN', entidadeId: null, statusEntidade: null },
    })
    const user = await abrir()
    expect(screen.queryByRole('button', { name: /Gerar prévia/ })).toBeNull()
    await user.selectOptions(await screen.findByLabelText('Entidade'), ENTIDADE_SESSAO_ID)
    expect(await screen.findByRole('table', { name: 'Arrecadação por campanha' })).toBeTruthy()
  })
})
