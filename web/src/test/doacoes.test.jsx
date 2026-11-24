import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { historicoDoadorDemo } from '../mocks/doador'
import { eventosDoacao, filtrarDoacoes, mesesDisponiveis, nomeDoMes, resumoDoador } from '../utils/doacoes'

let semDoacoes = false
beforeEach(() => {
  semDoacoes = false
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => {
    const dados = fonte.criarDadosDemo()
    return Promise.resolve(semDoacoes ? { ...dados, historicoDoador: [] } : dados)
  })
})
async function abrir(rota) {
  render(<MemoryRouter initialEntries={[rota]}><App /></MemoryRouter>)
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

describe('regras do doador (#102, #103)', () => {
  it('totaliza como no protótipo e separa as pendências', () => {
    expect(resumoDoador(historicoDoadorDemo)).toEqual({
      financeiroConfirmado: 200, contribuicoes: 2, itensRecebidos: 3, itensDescricao: '3 kits de higiene',
      itensAgendados: 5, pagamentosPendentes: 1, entregasPendentes: 1,
    })
  })
  it('filtra por tipo, status, mês e busca', () => {
    expect(filtrarDoacoes(historicoDoadorDemo, { tipo: 'Itens' })).toHaveLength(2)
    expect(filtrarDoacoes(historicoDoadorDemo, { status: 'Pendente' })).toHaveLength(2)
    expect(filtrarDoacoes(historicoDoadorDemo, { mes: '2026-10' })).toHaveLength(5)
    expect(filtrarDoacoes(historicoDoadorDemo, { mes: '2026-09' })).toHaveLength(0)
    expect(filtrarDoacoes(historicoDoadorDemo, { busca: 'ds-1042' })).toHaveLength(1)
  })
  it('lista os meses do histórico', () => {
    expect(mesesDisponiveis(historicoDoadorDemo)).toEqual(['2026-10'])
    expect(nomeDoMes('2026-10')).toBe('Outubro de 2026')
  })
  it('monta a linha do tempo da doação', () => {
    const [recebida, itensPendente, , aplicada] = historicoDoadorDemo
    expect(eventosDoacao(aplicada).map((e) => e.estado)).toEqual(['feito', 'feito', 'final'])
    expect(eventosDoacao(recebida).map((e) => e.estado)).toEqual(['feito', 'feito', 'futuro'])
    expect(eventosDoacao(itensPendente).map((e) => e.estado)).toEqual(['feito', 'futuro', 'futuro'])
  })

})

describe('telas do doador (#102, #103)', () => {
  it('mostra indicadores e as 5 doações do protótipo', async () => {
    await abrir('/minhas-doacoes')
    expect(screen.getByText('R$ 200,00')).toBeTruthy()
    expect(screen.getByText('3 unidades')).toBeTruthy()
    expect(screen.getByText('2 doações')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Ver detalhe/ })).toHaveLength(5)
  })
  it('filtra, mostra vazio e permite limpar', async () => {
    const user = await abrir('/minhas-doacoes')
    await user.selectOptions(screen.getByLabelText('Tipo'), 'Itens')
    expect(screen.getAllByRole('link', { name: /Ver detalhe/ })).toHaveLength(2)
    await user.selectOptions(screen.getByLabelText('Status'), 'Aplicada')
    expect(await screen.findByText(/Nenhuma doação encontrada/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Limpar filtros/ }))
    expect(screen.getAllByRole('link', { name: /Ver detalhe/ })).toHaveLength(5)
  })
  it('mostra estado vazio sem doações', async () => {
    semDoacoes = true
    await abrir('/minhas-doacoes')
    expect(screen.getByText(/ainda não fez nenhuma doação/)).toBeTruthy()
  })
  it('abre o detalhe a partir do histórico', async () => {
    const user = await abrir('/minhas-doacoes')
    await user.click(screen.getAllByRole('link', { name: /Ver detalhe/ })[0])
    expect(await screen.findByRole('heading', { level: 1, name: /O caminho da sua contribuição/ })).toBeTruthy()
  })
  it('mostra o caminho completo de uma doação aplicada', async () => {
    await abrir('/minhas-doacoes/DS-1042')
    expect(screen.getAllByText('Aplicada na campanha').length).toBeGreaterThan(0)
    expect(screen.getByText(/O pagamento foi confirmado em 02\/10\. A aplicação foi registrada em 05\/10/)).toBeTruthy()
    expect(screen.getByText(/Uma mensagem da Rede Esperança/)).toBeTruthy()
    expect(screen.getByText('Destinação registrada')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Baixar recibo/ }).disabled).toBe(true)
    expect(screen.getByRole('link', { name: /Apoiar esta campanha novamente/ }).getAttribute('href')).toBe('/doar/1')
  })
  it('mostra doação pendente sem mensagem nem aplicação', async () => {
    await abrir('/minhas-doacoes/DS-1087')
    expect(screen.queryByText(/Uma mensagem da/)).toBe(null)
    expect(screen.getByText(/Aguardando destinação/)).toBeTruthy()
  })
  it('informa detalhe inexistente', async () => {
    await abrir('/minhas-doacoes/DS-9999')
    expect(screen.getByRole('heading', { level: 1, name: /não encontrada/ })).toBeTruthy()
  })

})
