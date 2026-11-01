import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { checklist, prestacaoInicial, totalAplicado, validarDespesa } from '../utils/prestacao'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)
async function abrir(rota) {
  render(<MemoryRouter initialEntries={[rota]}><App /></MemoryRouter>)
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

describe('regras da prestação de contas (#94)', () => {
  const campanha = { arrecadado: 8000 }
  it('soma as despesas e valida valor e descrição', () => {
    expect(totalAplicado([{ valor: 100 }, { valor: 50.5 }])).toBe(150.5)
    expect(Object.keys(validarDespesa({ descricao: ' ', valor: '0' }, campanha, []))).toEqual(['descricao', 'valor'])
  })
  it('recusa despesa que ultrapassa o arrecadado', () => {
    const erros = validarDespesa({ descricao: 'X', valor: '500' }, campanha, [{ valor: 7800 }])
    expect(erros.valor).toMatch(/não pode passar do arrecadado/)
  })
  it('exige despesa, relato, anexo e declaração para publicar', () => {
    expect(checklist(prestacaoInicial(), false).every((i) => i.ok)).toBe(false)
    const completa = { despesas: [{}], relato: 'ok', anexos: [{}], publicada: false }
    expect(checklist(completa, true).every((i) => i.ok)).toBe(true)
  })
})

describe('tela de prestação de contas (#94)', () => {
  it('chega à tela pelo link "Prestar contas" da lista de campanhas', async () => {
    const user = await abrir('/campanhas')
    await user.click(await screen.findByRole('link', { name: /Prestar contas/ }))
    expect(await screen.findByRole('heading', { level: 1, name: /Encerramento e prestação de contas/ })).toBeTruthy()
  })
  it('só permite prestar contas de campanha encerrada', async () => {
    await abrir('/campanhas/1/prestacao-de-contas')
    expect(screen.getByText(/só está disponível para campanhas encerradas/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Publicar prestação/ })).toBeNull()
  })
  it('mantém a publicação bloqueada até cumprir o checklist e publica', async () => {
    const user = await abrir('/campanhas/3/prestacao-de-contas')
    const publicar = screen.getByRole('button', { name: /Publicar prestação de contas/ })
    expect(publicar.disabled).toBe(true)
    await user.type(screen.getByLabelText(/Descrição da despesa/), 'Compra de agasalhos')
    await user.type(screen.getByLabelText(/Valor \(R\$\)/), '8000')
    await user.click(screen.getByRole('button', { name: /Adicionar despesa/ }))
    await user.type(screen.getByLabelText(/Relato de aplicação/), 'Agasalhos distribuídos.')
    await user.upload(screen.getByLabelText(/Anexar documento/), new File(['x'], 'nf-0821.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByLabelText(/Declaro que/))
    expect(publicar.disabled).toBe(false)
    await user.click(publicar)
    expect(await screen.findByText(/Prestação de contas publicada\. O relatório/)).toBeTruthy()
  })
  it('recusa despesa acima do arrecadado', async () => {
    const user = await abrir('/campanhas/3/prestacao-de-contas')
    await user.type(screen.getByLabelText(/Descrição da despesa/), 'Excesso')
    await user.type(screen.getByLabelText(/Valor \(R\$\)/), '9000')
    await user.click(screen.getByRole('button', { name: /Adicionar despesa/ }))
    expect(await screen.findByText(/não pode passar do arrecadado/)).toBeTruthy()
  })
})
