// TEST-CAM-01 (#80): testes unitários do frontend de Campanhas.
// Complementa campanhas.test.jsx, criarCampanha.test.jsx e prestacao.test.jsx: card público
// e regras de prazo. Edição e acompanhamento integrados à API ficam em gestaoApi.test.jsx.
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CampanhaCard, { Progresso } from '../components/CampanhaCard'
import { diasRestantes } from '../utils/campanhas'

describe('diasRestantes', () => {
  it('conta os dias até o término a partir do relógio de demonstração', () => {
    expect(diasRestantes('2026-11-15')).toBe(40)
    expect(diasRestantes('2026-10-16', '2026-10-06')).toBe(10)
    expect(diasRestantes('2026-10-06', '2026-10-06')).toBe(0)
  })
  it('nunca devolve valor negativo para campanhas já encerradas', () => {
    expect(diasRestantes('2026-08-31')).toBe(0)
  })
})

describe('Progresso e CampanhaCard', () => {
  it('Progresso expõe a barra com valores acessíveis e limita a 100%', () => {
    const { rerender } = render(<Progresso atual={50} meta={200} />)
    const barra = screen.getByRole('progressbar', { name: 'Meta arrecadada' })
    expect(barra.getAttribute('aria-valuenow')).toBe('25')
    expect(barra.getAttribute('aria-valuemin')).toBe('0')
    expect(barra.getAttribute('aria-valuemax')).toBe('100')
    expect(screen.getByText('25%')).toBeTruthy()
    expect(screen.getByText(/Meta de R\$\s200,00/)).toBeTruthy()
    rerender(<Progresso atual={300} meta={200} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    rerender(<Progresso atual={10} meta={0} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })
  it('CampanhaCard mostra os dados e leva todos os links ao detalhe', () => {
    const campanha = {
      id: 9,
      nome: 'Natal solidário',
      entidade: 'Casa Acolher',
      cidade: 'Sorocaba, SP',
      categoria: 'Alimentação',
      imagem: '/images/cestas.jpg',
      arrecadado: 50,
      meta: 200,
    }
    const { container } = render(
      <MemoryRouter>
        <CampanhaCard campanha={campanha} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('article')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Natal solidário' })).toBeTruthy()
    expect(screen.getByText('Casa Acolher · Sorocaba, SP')).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links.every((l) => l.getAttribute('href') === '/campanhas/9')).toBe(true)
    expect(screen.getByRole('link', { name: /Conhecer campanha/ })).toBeTruthy()
    const imagem = container.querySelector('img')
    expect(imagem.getAttribute('alt')).toBe('')
    expect(imagem.getAttribute('loading')).toBe('lazy')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25')
  })
})

