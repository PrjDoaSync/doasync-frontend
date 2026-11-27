import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import api from '../services/api'
import { authService } from '../services/authService'
import { limparSessao, obterSessao, obterToken, salvarSessao } from '../services/token'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

beforeEach(() => limparSessao())

// Resposta de POST /api/v1/auth/login no formato do contrato.
const usuarioEntidade = {
  id: 'u1',
  nome: 'APAE Florianópolis',
  email: 'apae@doasync.local',
  tipo: 'ENTIDADE',
  entidadeId: 'e1',
  statusEntidade: 'APROVADA',
}
const futuro = () => new Date(Date.now() + 8 * 3600 * 1000).toISOString()

function simularLogin({ status = 200, usuario = usuarioEntidade, expiraEm = futuro() } = {}) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    if (config.url === '/auth/login' && status === 200) {
      const data = { data: { token: 'jwt.token.ok', tipoToken: 'Bearer', expiraEm, usuario } }
      return Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })
    }
    if (config.url === '/auth/login') {
      return Promise.reject({ response: { status, data: { error: 'E-mail ou senha inválidos.' } }, config })
    }
    // Qualquer rota autenticada responde 401: token expirado / usuário desativado.
    return Promise.reject({ response: { status: 401, data: { error: 'Não autenticado.' } }, config })
  }
  return chamadas
}

describe('authService', () => {
  it('entra com POST /auth/login e guarda a sessão', async () => {
    const chamadas = simularLogin()
    const sessao = await authService.entrar(' apae@doasync.local ', 'senha1234')
    expect(chamadas[0]).toMatchObject({ url: '/auth/login', method: 'post' })
    expect(JSON.parse(chamadas[0].data)).toEqual({ email: 'apae@doasync.local', senha: 'senha1234' })
    expect(sessao.usuario).toEqual(usuarioEntidade)
    expect(obterToken()).toBe('jwt.token.ok')
  })

  it('credenciais inválidas rejeitam com a mensagem da API e não criam sessão', async () => {
    simularLogin({ status: 401 })
    await expect(authService.entrar('x@x.com', 'errada')).rejects.toMatchObject({
      status: 401,
      message: 'E-mail ou senha inválidos.',
    })
    expect(obterSessao()).toBeNull()
  })

  it('descarta sessão expirada', () => {
    salvarSessao({ token: 'velho', expiraEm: '2000-01-01T00:00:00Z', usuario: usuarioEntidade })
    expect(obterSessao()).toBeNull()
    expect(obterToken()).toBeNull()
  })

  it('401 em rota autenticada encerra a sessão', async () => {
    simularLogin()
    await authService.entrar('apae@doasync.local', 'senha1234')
    await expect(api.get('/usuarios/me')).rejects.toMatchObject({ status: 401 })
    expect(obterSessao()).toBeNull()
  })
})

function Painel() {
  const { usuario, autenticado, entrar, sair } = useAuth()
  return (
    <div>
      <p>{autenticado ? `Logado: ${usuario.nome} (${usuario.tipo})` : 'Visitante'}</p>
      <button onClick={() => entrar('apae@doasync.local', 'senha1234')}>Entrar</button>
      <button onClick={sair}>Sair</button>
    </div>
  )
}

describe('AuthProvider / useAuth', () => {
  it('entra, mantém a sessão ao recarregar e sai', async () => {
    simularLogin()
    const user = userEvent.setup()
    const { unmount } = render(<AuthProvider><Painel /></AuthProvider>)
    expect(screen.getByText('Visitante')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Logado: APAE Florianópolis (ENTIDADE)')).toBeTruthy()

    // "Recarregar a página": um novo provider lê a sessão salva.
    unmount()
    render(<AuthProvider><Painel /></AuthProvider>)
    expect(screen.getByText('Logado: APAE Florianópolis (ENTIDADE)')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(screen.getByText('Visitante')).toBeTruthy()
    expect(obterSessao()).toBeNull()
  })

  it('volta a visitante quando a API responde 401 com o token', async () => {
    simularLogin()
    const user = userEvent.setup()
    render(<AuthProvider><Painel /></AuthProvider>)
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await screen.findByText(/Logado:/)
    await act(() => api.get('/usuarios/me').catch(() => {}))
    await waitFor(() => expect(screen.getByText('Visitante')).toBeTruthy())
  })
})
