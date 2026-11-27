// Telas de demonstração (itens e equipe): pendência da API identificada e link "Minha conta" da gestão.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { RECURSOS_PENDENTES } from '../services/indisponivel'

beforeEach(() =>
  vi
    .spyOn(fonte, 'carregarDemo')
    .mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
}

describe('Pendências da API em telas de demonstração', () => {
  it.each([
    ['/itens', 'estoqueItens'],
    ['/configuracoes/usuarios', 'equipeEntidade'],
  ])('%s identifica a pendência de %s', async (rota, recurso) => {
    await abrir(rota)
    const aviso = screen
      .getAllByRole('status')
      .find((el) => el.textContent.includes('Aguardando integração'))
    expect(aviso).toBeTruthy()
    expect(aviso.textContent).toContain(RECURSOS_PENDENTES[recurso].titulo)
    expect(aviso.textContent).toContain(RECURSOS_PENDENTES[recurso].motivo)
    expect(screen.getByText(/Ambiente de demonstração/)).toBeTruthy()
  })
})

describe('Minha conta na gestão', () => {
  it('o menu lateral leva a /perfil-usuario', async () => {
    await abrir('/dashboard')
    const lateral = screen.getByRole('complementary', { name: 'Menu lateral administrativo' })
    expect(within(lateral).getByRole('link', { name: 'Minha conta' }).getAttribute('href')).toBe('/perfil-usuario')
  })
})
