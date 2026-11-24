import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { limparSessao, salvarSessao } from '../services/token'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

beforeEach(() => {
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() =>
    Promise.resolve(fonte.criarDadosDemo()),
  )
})

async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

describe('Layout e componentes compartilhados', () => {
  it('renderiza o layout público sem impor navegação administrativa', async () => {
    limparSessao() // visitante
    await abrir('/')

    // Deve ter banner/header público
    const banners = screen.getAllByRole('banner')
    expect(banners.length).toBeGreaterThan(0)

    // Navegação pública contém Início, Campanhas, Entidades
    const navPublica = screen.getByRole('navigation', {
      name: 'Navegação pública',
    })
    expect(navPublica).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Início' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Campanhas' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Entidades' }).getAttribute('href')).toBe('/cadastro-entidade')

    // Ações públicas: Área da entidade e botão Entrar
    expect(
      screen.getByRole('link', { name: 'Ir para área da entidade' }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy()

    // Rodapé público conforme frame Figma
    expect(
      screen.getByText(/DoaSync · Conectando pessoas a causas/),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ajuda' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Privacidade' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Termos de uso' })).toBeTruthy()

    // NÃO deve conter o menu administrativo da sidebar
    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação administrativa',
      }),
    ).toBe(null)
  })

  it('destaca o item ativo de navegação pública de acordo com a rota', async () => {
    // Na Home ('/'), 'Início' deve estar ativo
    await abrir('/')
    const linkInicio = screen.getByRole('link', { name: 'Início' })
    expect(linkInicio.className).toContain('active')

    // Limpa DOM para a próxima rota
    // Ao navegar para /explorar, 'Campanhas' deve estar ativo
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Campanhas' }))
    const linkCampanhas = screen.getByRole('link', { name: 'Campanhas' })
    expect(linkCampanhas.className).toContain('active')
  })

  it('renderiza o layout administrativo com sidebar, topo e perfil na área de gestão', async () => {
    const user = await abrir('/dashboard')

    // Deve conter a navegação administrativa
    const navAdmin = screen.getByRole('navigation', {
      name: 'Navegação administrativa',
    })
    expect(navAdmin).toBeTruthy()

    // Deve conter itens do menu de gestão na barra lateral
    expect(within(navAdmin).getByRole('link', { name: 'Dashboard' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Campanhas' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Doações' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Doadores' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Itens doados' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Relatórios' })).toBeTruthy()
    expect(within(navAdmin).getByRole('link', { name: 'Configurações' })).toBeTruthy()

    // NÃO deve conter a navegação pública
    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação pública',
      }),
    ).toBe(null)

    // Topo administrativo com informações do perfil
    expect(screen.getByText('Ana Silva')).toBeTruthy()
    expect(screen.getByText('Administradora · demonstração')).toBeTruthy()

    // Interação com o menu de perfil do usuário
    const botaoPerfil = screen.getByRole('button', {
      name: 'Perfil do usuário e ações comuns',
    })
    expect(botaoPerfil.getAttribute('aria-expanded')).toBe('false')

    await user.click(botaoPerfil)
    expect(botaoPerfil.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Perfil da entidade' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Sair da conta' })).toBeTruthy()

    // Fecha menu com tecla Escape
    await user.keyboard('{Escape}')
    expect(botaoPerfil.getAttribute('aria-expanded')).toBe('false')
  })

  it('permite pular para o conteúdo principal por atalho de acessibilidade', async () => {
    await abrir('/')
    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skipLink).toBeTruthy()
    expect(skipLink.getAttribute('href')).toBe('#conteudo')
  })

  it('abre as páginas institucionais e o histórico pela navegação', async () => {
    // "Meu histórico" é de doador (GET /usuarios/me/doacoes).
    salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, tipo: 'PESSOA_FISICA' } })
    const user = await abrir('/')
    for (const nome of ['Ajuda', 'Privacidade', 'Termos de uso']) {
      await user.click(screen.getByRole('link', { name: nome, exact: true }))
      expect(await screen.findByRole('heading', { level: 1, name: nome })).toBeTruthy()
    }
    await user.click(screen.getByRole('link', { name: 'Meu histórico' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Minhas doações' })).toBeTruthy()
  })

  it('navega pelo menu de perfil com teclado e nomeia o diálogo de notificações', async () => {
    const user = await abrir('/dashboard')
    await user.click(screen.getByRole('button', { name: 'Perfil do usuário e ações comuns' }))
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Perfil da entidade' }))
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Sair da conta' }))
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Gerenciar equipe' }))
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Notificações da entidade' }))
    expect(screen.getByRole('dialog', { name: 'Notificações da entidade' })).toBeTruthy()
    expect(screen.getByText('Nenhuma notificação nesta demonstração.')).toBeTruthy()
  })
})
