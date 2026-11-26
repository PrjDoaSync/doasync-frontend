import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import Grafico from '../components/Grafico'
import { formatarMoeda } from '../utils/format'
import api from '../services/api'
import { adaptadorApiPadrao } from './fixtures/apiCampanhas'
import { limparSessao, salvarSessao } from '../services/token'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}
describe('Login e recuperação de senha (GES-01)', () => {
  it('apresenta o acesso com campos obrigatórios e os caminhos alternativos', async () => {
    await abrir('/login')
    expect(screen.getByRole('heading', { level: 1, name: 'Bem-vindo ao DoaSync' })).toBeTruthy()
    const email = screen.getByLabelText(/E-mail/)
    expect(email.type).toBe('email')
    expect(email.required).toBe(true)
    expect(screen.getByLabelText(/Senha/).type).toBe('password')
    expect(screen.queryByRole('link', { name: 'Acessar demonstração' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Cadastrar entidade' }).getAttribute('href')).toBe('/cadastro-entidade')
  })
  it('não envia com campos vazios e mostra o erro de credenciais da API', async () => {
    const chamadas = []
    api.defaults.adapter = (config) => {
      chamadas.push(config)
      return Promise.reject({ response: { status: 401, data: { error: 'E-mail ou senha inválidos.' } }, config })
    }
    const user = await abrir('/login')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(chamadas).toHaveLength(0)
    await user.type(screen.getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.type(screen.getByLabelText(/Senha/), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect((await screen.findByRole('alert')).textContent).toContain('E-mail ou senha inválidos.')
    expect(chamadas[0]).toMatchObject({ url: '/auth/login', method: 'post' })
  })
  it.each([
    ['ENTIDADE', 'Dashboard geral'],
    ['PESSOA_FISICA', 'Encontre uma causa. Faça a diferença.'],
  ])('login de %s entra e redireciona; o cabeçalho público mostra o usuário e "Sair"', async (tipo, titulo) => {
    api.defaults.adapter = (config) => {
      if (config.url !== '/auth/login') return adaptadorApiPadrao(config)
      const usuario = { id: 'u1', nome: 'Ana Silva', email: 'ana@x.org', tipo, entidadeId: null, statusEntidade: null }
      const data = { data: { token: 't', tipoToken: 'Bearer', expiraEm: '2999-01-01T00:00:00Z', usuario } }
      return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config })
    }
    const user = await abrir('/login')
    await user.type(screen.getByLabelText(/E-mail/), 'ana@x.org')
    await user.type(screen.getByLabelText(/Senha/), 'senha1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { level: 1, name: titulo })).toBeTruthy()
    if (tipo === 'PESSOA_FISICA') {
      expect(screen.getByRole('link', { name: 'Minha conta' })).toBeTruthy()
      await user.click(screen.getByRole('button', { name: 'Sair' }))
      expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy()
    }
  })
  it('visitante em rota de gestão vai para o login e volta à rota de origem depois de entrar', async () => {
    limparSessao()
    api.defaults.adapter = (config) => {
      if (config.url !== '/auth/login') return adaptadorApiPadrao(config)
      const data = { data: { ...SESSAO_ENTIDADE_TESTE, tipoToken: 'Bearer' } }
      return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config })
    }
    const user = await abrir('/doadores')
    expect(screen.getByRole('heading', { level: 1, name: 'Bem-vindo ao DoaSync' })).toBeTruthy()
    await user.type(screen.getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.type(screen.getByLabelText(/Senha/), 'senha1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { level: 1, name: /Doadores/ })).toBeTruthy()
  })
  it('doador autenticado não acessa a gestão', async () => {
    salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, tipo: 'PESSOA_FISICA' } })
    await abrir('/dashboard')
    expect(screen.getByRole('heading', { level: 1, name: 'Acesso restrito' })).toBeTruthy()
  })
  it('o cadastro de entidade continua público', async () => {
    limparSessao()
    await abrir('/cadastro-entidade')
    expect(screen.queryByRole('heading', { level: 1, name: 'Bem-vindo ao DoaSync' })).toBeNull()
    expect(screen.queryByRole('heading', { level: 1, name: 'Acesso restrito' })).toBeNull()
  })
  it('alterna para a recuperação, avisa que nenhum e-mail foi enviado e volta ao acesso', async () => {
    const user = await abrir('/login')
    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Esqueceu sua senha?' })).toBeTruthy()
    expect(screen.queryByLabelText(/Senha/)).toBe(null)
    expect(screen.getByText(/recuperação de senha por e-mail está indisponível/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Solicitar recuperação' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Voltar para o acesso' }))
    expect(screen.queryByText(/recuperação de senha por e-mail está indisponível/)).toBe(null)
    expect(screen.getByRole('heading', { level: 2, name: 'Entre na sua conta' })).toBeTruthy()
    expect(screen.getByLabelText(/Senha/)).toBeTruthy()
  })
})

describe('Grafico', () => {
  const pagamento = (data, valor, status = 'Confirmada') => ({ tipo: 'Financeira', status, data, valor })
  const recebimento = (data, quantidade) => ({ tipo: 'Itens', status: 'Confirmada', data, quantidade })

  it('sem pagamentos confirmados, mostra o estado vazio financeiro', () => {
    render(<Grafico doacoes={[pagamento('2026-10-01', 100, 'Pendente')]} />)
    expect(screen.getByRole('heading', { name: 'Sem arrecadação neste período' })).toBeTruthy()
    expect(screen.getByText('Não há pagamentos confirmados para os filtros selecionados.')).toBeTruthy()
    expect(screen.queryByRole('img')).toBe(null)
  })
  it('sem recebimentos de itens, mostra o estado vazio de itens', () => {
    render(<Grafico doacoes={[]} medida="itens" />)
    expect(screen.getByRole('heading', { name: 'Sem recebimentos neste período' })).toBeTruthy()
    expect(screen.getByText('Não há doações de itens confirmadas para os filtros selecionados.')).toBeTruthy()
  })
  it('acumula só pagamentos confirmados e descreve o gráfico para leitores de tela', () => {
    const { container } = render(
      <Grafico doacoes={[pagamento('2026-10-03', 50), pagamento('2026-10-01', 100), pagamento('2026-10-04', 999, 'Pendente')]} />,
    )
    expect(screen.getByRole('img', { name: `Arrecadação acumulada: ${formatarMoeda(150)} em 2 datas` })).toBeTruthy()
    expect(screen.getByText('Pagamentos confirmados · valores acumulados')).toBeTruthy()
    const linhas = [...container.querySelectorAll('details tbody tr')].map((l) => [...l.cells].map((c) => c.textContent))
    expect(linhas).toEqual([
      ['2026-10-01', formatarMoeda(100)],
      ['2026-10-03', formatarMoeda(150)],
    ])
    expect(container.querySelector('polygon')).toBeTruthy()
  })
  it('em modo itens, acumula unidades e usa a legenda de recebimentos', () => {
    render(<Grafico doacoes={[recebimento('2026-10-01', 5), recebimento('2026-10-02', 10)]} medida="itens" id="itens" />)
    expect(screen.getByRole('img', { name: 'Itens recebidos: 15 un. em 2 datas' })).toBeTruthy()
    expect(screen.getByText('Recebimentos confirmados · unidades acumuladas')).toBeTruthy()
    expect(screen.getByText('Itens acumulados')).toBeTruthy()
  })
  it('com um único ponto desenha a linha sem a área preenchida', () => {
    const { container } = render(<Grafico doacoes={[pagamento('2026-10-01', 100)]} />)
    expect(screen.getByRole('img', { name: /em 1 datas/ })).toBeTruthy()
    expect(container.querySelector('polygon')).toBe(null)
    expect(container.querySelector('polyline')).toBeTruthy()
  })
})
