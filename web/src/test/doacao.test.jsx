// Fluxo de doação financeira via PIX integrado a POST /doacoes (passo 12).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { limparSessao, salvarSessao } from '../services/token'
import { DOACAO_EXISTENTE_ID, adaptadorApiPadrao, campanhasApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

const CAMPANHA = campanhasApi[0]
const DOADORA = {
  ...SESSAO_ENTIDADE_TESTE,
  usuario: { id: 'u2', nome: 'Maria Souza', email: 'maria@doasync.local', tipo: 'PESSOA_FISICA', entidadeId: null, statusEntidade: null },
}

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

// Registra as chamadas e permite forçar uma resposta para POST /doacoes.
function espionarApi(respostaDoacao) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    if (respostaDoacao && config.url === '/doacoes') return respostaDoacao(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

// A primeira etapa escolhe o tipo de doação (DOA-01); a financeira é a opção padrão.
async function ateValor(user) {
  await user.click(screen.getByRole('button', { name: /Continuar com doação financeira/ }))
}
// formatarMoeda usa espaço não separável: "R$ 50,00".
async function ateIdentificacao(user) {
  await ateValor(user)
  await user.click(screen.getByRole('button', { name: /R\$\s50,00/ }))
  await user.click(screen.getByRole('button', { name: /Continuar/ }))
}

describe('doação financeira via PIX (POST /doacoes)', () => {
  it('doadora registra a doação anônima com mensagem e vê o comprovante', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    expect(screen.getByRole('heading', { level: 1, name: 'Como você quer ajudar?' })).toBeTruthy()
    await ateValor(user)
    expect(screen.getByRole('heading', { level: 1, name: 'Qual o valor da sua doação?' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /R\$\s50,00/ }))
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    expect(screen.getByText('Maria Souza')).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: /Doação anônima/ }))
    await user.type(screen.getByLabelText(/Mensagem para a entidade/), 'Força!')
    await user.click(screen.getByRole('button', { name: /Revisar doação/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Finalize sua doação' })).toBeTruthy()
    // Sem provedor PIX: a tela não mostra código fictício e avisa que nada é cobrado.
    expect(screen.getByRole('img', { name: /QR Code PIX indisponível/ })).toBeTruthy()
    expect(screen.getByText(/nenhum valor é cobrado/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Confirmar doação' }))

    // Ao confirmar, vai para o comprovante, que lê GET /doacoes/{id}.
    expect(await screen.findByRole('heading', { level: 1, name: 'Sua doação foi registrada. Obrigado!' })).toBeTruthy()
    expect(screen.getAllByText(/DS-2E95E189B340/).length).toBeGreaterThan(0)
    expect(screen.getByText('Maria Souza · doação anônima')).toBeTruthy()
    expect(screen.getByText('Força!')).toBeTruthy()
    expect(chamadas.some((c) => c.method === 'get' && c.url === '/doacoes/d0000000-0000-4000-8000-000000000001')).toBe(true)

    const post = chamadas.find((c) => c.method === 'post' && c.url === '/doacoes')
    expect(JSON.parse(post.data)).toEqual({
      campanhaId: CAMPANHA.id,
      valor: 50,
      formaPagamento: 'PIX',
      anonima: true,
      observacao: 'Força!',
    })
    expect(post.headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/)
    expect(post.headers.Authorization).toBe('Bearer token-de-teste')
  })

  it('não avança com valor inválido', async () => {
    salvarSessao(DOADORA)
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await ateValor(user)
    const valor = screen.getByLabelText(/Outro valor/)
    await user.clear(valor)
    await user.type(valor, '0')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    expect(screen.getByRole('alert').textContent).toContain('maior que zero')
  })

  it('erro da API aparece na confirmação e a nova tentativa reaproveita a mesma Idempotency-Key', async () => {
    salvarSessao(DOADORA)
    let falhar = true
    const chamadas = espionarApi((config) => {
      if (falhar) {
        falhar = false
        return Promise.reject({ response: { status: 409, data: { error: 'Campanha não está recebendo doações.' } }, config })
      }
      return adaptadorApiPadrao(config)
    })
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await ateIdentificacao(user)
    await user.click(screen.getByRole('button', { name: /Revisar doação/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar doação' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Campanha não está recebendo doações.')
    await user.click(screen.getByRole('button', { name: 'Confirmar doação' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sua doação foi registrada. Obrigado!' })).toBeTruthy()
    const posts = chamadas.filter((c) => c.url === '/doacoes')
    expect(posts).toHaveLength(2)
    expect(posts[1].headers['Idempotency-Key']).toBe(posts[0].headers['Idempotency-Key'])
  })

  it('visitante é convidado a entrar e não envia a doação', async () => {
    limparSessao()
    const chamadas = espionarApi()
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await ateIdentificacao(user)
    expect(screen.getByRole('link', { name: /Entrar para doar/ }).getAttribute('href')).toBe('/login')
    expect(chamadas.some((c) => c.url === '/doacoes')).toBe(false)
  })

  it('conta de entidade não pode doar', async () => {
    const user = await abrir(`/doar/${CAMPANHA.id}`) // sessão padrão: ENTIDADE
    await ateIdentificacao(user)
    expect(screen.getByRole('alert').textContent).toContain('contas de doador')
    expect(screen.queryByRole('button', { name: /Revisar doação/ })).toBeNull()
  })

  it('campanha inexistente ou fora da vitrine informa indisponibilidade', async () => {
    await abrir('/doar/00000000-0000-0000-0000-000000000000')
    expect(screen.getByRole('heading', { level: 1, name: 'Campanha indisponível para doação' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Explorar campanhas ativas' }).getAttribute('href')).toBe('/explorar')
  })

  it('o detalhe da campanha leva ao fluxo de doação', async () => {
    const user = await abrir(`/campanhas/${CAMPANHA.id}`)
    await user.click(screen.getByRole('link', { name: /Quero doar/ }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Como você quer ajudar?' })).toBeTruthy()
  })
})

describe('comprovante da doação (GET /doacoes/{id})', () => {
  const rota = `/doar/${CAMPANHA.id}/confirmacao/${DOACAO_EXISTENTE_ID}`

  it('a doadora abre o comprovante pela URL', async () => {
    salvarSessao(DOADORA)
    await abrir(rota)
    expect(await screen.findByRole('heading', { level: 1, name: 'Sua doação foi registrada. Obrigado!' })).toBeTruthy()
    expect(screen.getAllByText(/DS-0000EXISTE/).length).toBeGreaterThan(0)
    expect(screen.getByText('Maria Souza')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Voltar à campanha/ }).getAttribute('href')).toBe(`/campanhas/${CAMPANHA.id}`)
    expect(screen.getByRole('link', { name: /Minhas doações/ }).getAttribute('href')).toBe('/minhas-doacoes')
  })

  it('visitante é convidado a entrar', async () => {
    limparSessao()
    await abrir(rota)
    expect(screen.getByRole('heading', { level: 1, name: 'Entre para ver o comprovante' })).toBeTruthy()
  })

  it('doação inexistente ou de outra pessoa (404) informa que não foi encontrada', async () => {
    salvarSessao(DOADORA)
    await abrir(`/doar/${CAMPANHA.id}/confirmacao/00000000-0000-0000-0000-000000000000`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Doação não encontrada' })).toBeTruthy()
  })
})
