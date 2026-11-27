// Páginas do sistema (erro, acesso restrito, indisponibilidade), ErrorBoundary,
// recuperação de senha (GES-01) e mensagem de 403.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import ErrorBoundary from '../components/ErrorBoundary'
import ErrorMessage from '../components/ErrorMessage'
import api from '../services/api'
import { limparSessao, salvarSessao } from '../services/token'

async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

afterEach(() => vi.restoreAllMocks())

describe('páginas do sistema', () => {
  it('rota inexistente mostra a página não encontrada com ações úteis', async () => {
    limparSessao()
    await abrir('/rota-que-nao-existe')
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao início' }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Explorar campanhas' }).getAttribute('href')).toBe('/explorar')
  })

  it('acesso restrito oferece Minhas doações ao doador e permite sair', async () => {
    salvarSessao({
      token: 't',
      expiraEm: new Date(Date.now() + 3600_000).toISOString(),
      usuario: { id: 9, nome: 'Dora', email: 'dora@exemplo.com', tipo: 'DOADOR' },
    })
    const user = await abrir('/acesso-restrito')
    expect(screen.getByRole('heading', { level: 1, name: 'Acesso restrito' })).toBeTruthy()
    expect(screen.getByText(/A área de gestão é exclusiva para entidades e administradores\./)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Minhas doações' }).getAttribute('href')).toBe('/minhas-doacoes')
    await user.click(screen.getByRole('button', { name: 'Sair e entrar com outra conta' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Bem-vindo ao DoaSync' })).toBeTruthy()
  })

  it('visitante no acesso restrito não vê Minhas doações nem Sair', async () => {
    limparSessao()
    await abrir('/acesso-restrito')
    expect(screen.queryByRole('link', { name: 'Minhas doações' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Sair e entrar/ })).toBeNull()
  })

  it('/indisponivel explica a falha e oferece nova tentativa e retorno ao início', async () => {
    limparSessao()
    await abrir('/indisponivel')
    expect(screen.getByRole('heading', { level: 1, name: 'Serviço indisponível' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao início' }).getAttribute('href')).toBe('/')
  })
})

describe('ErrorBoundary', () => {
  it('mostra tela amigável, registra o erro e reseta ao tentar novamente', async () => {
    const registro = vi.spyOn(console, 'error').mockImplementation(() => {})
    let quebrar = true
    function Quebra() {
      if (quebrar) throw new Error('falha de teste')
      return <p>Conteúdo recuperado</p>
    }
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Quebra />
        </ErrorBoundary>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Algo deu errado' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao início' }).getAttribute('href')).toBe('/')
    expect(registro).toHaveBeenCalled()
    quebrar = false
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(screen.getByText('Conteúdo recuperado')).toBeTruthy()
  })
})

describe('recuperação de senha', () => {
  async function abrirRecuperacao() {
    limparSessao()
    const user = await abrir('/login')
    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }))
    return user
  }

  it('valida e-mail obrigatório e formato com aria-invalid', async () => {
    const adaptador = vi.fn()
    const user = await abrirRecuperacao()
    api.defaults.adapter = adaptador
    const campo = screen.getByLabelText(/E-mail/)
    await user.click(screen.getByRole('button', { name: 'Solicitar recuperação' }))
    expect(campo.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Informe o e-mail da sua conta.')).toBeTruthy()
    await user.type(campo, 'sem-arroba')
    await user.click(screen.getByRole('button', { name: 'Solicitar recuperação' }))
    expect(screen.getByText(/Informe um e-mail válido/)).toBeTruthy()
    expect(screen.queryByText(/Aguardando integração/)).toBeNull()
    expect(adaptador).not.toHaveBeenCalled()
  })

  it('envio válido mostra a pendência, não faz requisição e permite voltar ao login', async () => {
    const adaptador = vi.fn()
    const user = await abrirRecuperacao()
    api.defaults.adapter = adaptador
    await user.type(screen.getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.click(screen.getByRole('button', { name: 'Solicitar recuperação' }))
    const aviso = await screen.findByText(/Aguardando integração/)
    expect(aviso.closest('[role="status"]').textContent).toContain('Nenhum e-mail foi enviado')
    expect(screen.queryByText(/enviamos|e-mail enviado/i)).toBeNull()
    expect(adaptador).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Voltar para o acesso' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Entre na sua conta' })).toBeTruthy()
  })
})

describe('ErrorMessage com 403', () => {
  it('mostra a mensagem de permissão e mantém a nova tentativa', async () => {
    const tentar = vi.fn()
    render(<ErrorMessage error={{ status: 403, message: 'Forbidden' }} onRetry={tentar} />)
    expect(screen.getByRole('alert').textContent).toContain('Você não tem permissão para acessar estes dados.')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(tentar).toHaveBeenCalledTimes(1)
  })
  it('mantém a mensagem original em outros status', () => {
    render(<ErrorMessage error={{ status: 401, message: 'Sessão expirada.' }} />)
    expect(screen.getByRole('alert').textContent).toContain('Sessão expirada.')
  })
})
