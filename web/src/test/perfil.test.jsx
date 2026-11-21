import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { configuracaoPadrao, mascararCnpj, validarRecebimentoItens } from '../utils/configuracoes'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)
async function abrir(rota) {
  render(<MemoryRouter initialEntries={[rota]}><App /></MemoryRouter>)
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}
const salvarTopo = () => screen.getAllByRole('button', { name: /Salvar alterações/ })[0]

describe('regras de configurações (#114)', () => {
  it('aplica padrões de notificação e preserva o que foi salvo', () => {
    expect(configuracaoPadrao({}).notificacoes).toMatchObject({ doacoes: true, resumo: false, novidades: false })
    expect(configuracaoPadrao({ notificacoes: { resumo: true } }).notificacoes.resumo).toBe(true)
  })
  it('exige local e endereço quando o ponto de entrega é preenchido', () => {
    expect(validarRecebimentoItens({})).toBe('')
    expect(validarRecebimentoItens({ horario: '9h' })).toMatch(/local/)
    expect(validarRecebimentoItens({ local: 'Sede' })).toMatch(/endereço/)
    expect(validarRecebimentoItens({ local: 'Sede', endereco: 'Rua A' })).toBe('')
  })
  it('mascara o CNPJ', () => {
    expect(mascararCnpj('11.222.333/0001-81')).toBe('11.•••.•••/0001-••')
    expect(mascararCnpj('')).toBe('••.•••.•••/••••-••')
  })
})

describe('tela de perfil e configurações (#114)', () => {
  it('mostra CNPJ e recebimento financeiro mascarados e bloqueados', async () => {
    await abrir('/configuracoes')
    expect(screen.getByLabelText(/CNPJ/).disabled).toBe(true)
    expect(screen.getByLabelText(/CNPJ/).value).toBe('11.•••.•••/0001-••')
    expect(screen.getByLabelText(/Chave Pix institucional/).value).toBe('CNPJ · 11.•••.•••/0001-••')
    expect(screen.getByLabelText('Agência').value).toBe('••••')
  })
  it('exige nome da entidade', async () => {
    const user = await abrir('/configuracoes')
    await user.clear(screen.getByLabelText(/Nome da entidade/))
    await user.click(salvarTopo())
    expect(screen.getByRole('alert').textContent).toMatch(/nome da entidade/)
  })
  it('bloqueia ponto de entrega sem endereço', async () => {
    const user = await abrir('/configuracoes')
    await user.clear(screen.getByLabelText(/Endereço demonstrativo/))
    await user.click(salvarTopo())
    expect(screen.getByRole('alert').textContent).toMatch(/endereço/)
  })
  it('altera notificações e salva', async () => {
    const user = await abrir('/configuracoes')
    const resumo = screen.getByRole('switch', { name: 'Resumo semanal' })
    expect(resumo.checked).toBe(false)
    await user.click(resumo)
    expect(resumo.checked).toBe(true)
    await user.click(salvarTopo())
    expect(await screen.findByText(/Informações salvas na demonstração/)).toBeTruthy()
    expect(screen.getByRole('switch', { name: 'Resumo semanal' }).checked).toBe(true)
  })
  it('descarta alterações não salvas', async () => {
    const user = await abrir('/configuracoes')
    await user.click(screen.getByRole('switch', { name: 'Novidades do DoaSync' }))
    expect(screen.getByRole('switch', { name: 'Novidades do DoaSync' }).checked).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Descartar alterações' }))
    expect(screen.getByRole('switch', { name: 'Novidades do DoaSync' }).checked).toBe(false)
  })
})
