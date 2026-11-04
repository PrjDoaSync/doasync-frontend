import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { validarEdicao } from '../utils/campanhas'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)
async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

describe('validarEdicao (#92)', () => {
  const campanha = { arrecadado: 18400, criadaEm: '2026-10-01' }
  const ok = { nome: 'A', descricao: 'B', encerraEm: '2026-10-20', meta: '30000' }
  it('aceita dados válidos', () => expect(validarEdicao(ok, campanha)).toEqual({}))
  it('recusa meta menor que o recebido e término anterior ao início', () => {
    const erros = validarEdicao({ ...ok, meta: '1000', encerraEm: '2026-09-01' }, campanha)
    expect(erros.meta).toMatch(/menor que o total recebido/)
    expect(erros.encerraEm).toMatch(/posterior à data de início/)
  })
  it('recusa campos obrigatórios vazios', () => {
    expect(Object.keys(validarEdicao({ ...ok, nome: ' ', descricao: '' }, campanha))).toEqual(['nome', 'descricao'])
  })
})

describe('telas de campanha (#92, #93)', () => {
  it('não salva meta menor que o total recebido', async () => {
    const user = await abrir('/campanhas/1/editar')
    const meta = screen.getByLabelText(/Meta financeira/)
    await user.clear(meta)
    await user.type(meta, '1000')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(await screen.findByText(/menor que o total recebido/)).toBeTruthy()
  })
  it('salva alterações válidas e informa o sucesso', async () => {
    const user = await abrir('/campanhas/1/editar')
    const titulo = screen.getByLabelText(/Título da campanha/)
    await user.clear(titulo)
    await user.type(titulo, 'Mesa solidária atualizada')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(await screen.findByText(/Campanha atualizada/)).toBeTruthy()
  })
  it('bloqueia a edição de campanha encerrada', async () => {
    await abrir('/campanhas/3/editar')
    expect(screen.getByRole('button', { name: /Salvar alterações/ }).disabled).toBe(true)
  })
  it('mostra os indicadores do acompanhamento', async () => {
    await abrir('/campanhas/1/acompanhamento')
    expect(screen.getByText('260 de 480')).toBeTruthy()
    expect(screen.getByText(/Doações recebidas/)).toBeTruthy()
  })
  it('informa campanha inexistente', async () => {
    await abrir('/campanhas/999/acompanhamento')
    expect(screen.getByRole('heading', { level: 1, name: /não encontrada/ })).toBeTruthy()
  })
})
