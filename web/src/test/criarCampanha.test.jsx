// Criar campanha integrado a POST /campanhas (passo 19).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { corpoCampanha, urlDaImagem, validarCampanha } from '../utils/criarCampanha'
import { adaptadorApiPadrao } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

const hoje = new Date().toISOString().slice(0, 10)
const emDias = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const VALIDA = { titulo: 'Uma nova causa', categoria: 'Educação', descricao: 'Kits para alunos.', dataInicio: hoje, dataFim: emDias(30), metaValor: '500', imagemUrl: '/images/educacao.jpg' }

describe('regras do formulário de campanha', () => {
  it('aceita uma campanha válida', () => {
    expect(validarCampanha(VALIDA, { hoje })).toEqual({})
  })
  it('valida título, descrição, meta, período e imagem', () => {
    const erros = validarCampanha(
      { ...VALIDA, titulo: ' ', descricao: '', metaValor: '0', dataFim: emDias(-5), imagemUrl: 'ftp://x' },
      { hoje },
    )
    expect(Object.keys(erros).sort()).toEqual(['dataFim', 'descricao', 'imagemUrl', 'metaValor', 'titulo'])
    expect(validarCampanha({ ...VALIDA, metaValor: '10,555' }, { hoje }).metaValor).toBeTruthy()
    expect(validarCampanha({ ...VALIDA, metaValor: '10,55' }, { hoje })).toEqual({})
  })
  it('para publicar exige confirmação e encerramento a partir de hoje', () => {
    expect(validarCampanha(VALIDA, { hoje, publicar: true }).confirmado).toBeTruthy()
    expect(
      validarCampanha({ ...VALIDA, dataInicio: emDias(-10), dataFim: emDias(-1) }, { hoje, publicar: true, confirmado: true }).dataFim,
    ).toMatch(/publicar/)
    expect(validarCampanha(VALIDA, { hoje, publicar: true, confirmado: true })).toEqual({})
  })
  it('monta o corpo da API com meta numérica e capa como URL absoluta', () => {
    expect(corpoCampanha({ ...VALIDA, metaValor: '10,5' })).toEqual({
      titulo: 'Uma nova causa', descricao: 'Kits para alunos.', metaValor: 10.5, dataInicio: hoje, dataFim: emDias(30),
      imagemUrl: `${globalThis.location.origin}/images/educacao.jpg`, categoria: 'Educação',
    })
    expect(corpoCampanha({ ...VALIDA, imagemUrl: '', categoria: '' })).not.toHaveProperty('imagemUrl')
    expect(urlDaImagem('https://cdn.x/y.jpg')).toBe('https://cdn.x/y.jpg')
  })
})

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

function espionar(respostaCriar) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    if (respostaCriar && config.method === 'post' && config.url === '/campanhas') return respostaCriar(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

async function abrir() {
  render(
    <MemoryRouter initialEntries={['/campanhas/nova']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Criar campanha' })
  return userEvent.setup()
}

// Etapa 1 (Dados básicos) e, depois de Continuar, a meta da etapa 2 (Metas e itens).
async function preencher(user, { inicio = hoje } = {}) {
  await user.type(screen.getByLabelText(/Título da campanha/), 'Uma nova causa')
  await user.type(screen.getByLabelText(/^Categoria/), 'Educação')
  await user.type(screen.getByLabelText(/Descrição da campanha/), 'Kits para alunos.')
  fireEvent.change(screen.getByLabelText(/^Início/), { target: { value: inicio } })
  fireEvent.change(screen.getByLabelText(/^Encerramento/), { target: { value: emDias(30) } })
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Metas e itens' })).toBeTruthy()
  await user.type(screen.getByLabelText(/Meta financeira/), '500')
}

describe('tela Criar campanha', () => {
  it('publica: envia POST /campanhas e a campanha aparece na gestão como ativa', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Imagens e publicação' })).toBeTruthy()
    expect(screen.getByText(/Aguardando integração · Envio de imagens/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect(screen.getByRole('alert').textContent).toContain('Confirme')
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect(await screen.findByRole('heading', { name: 'Gestão de campanhas' })).toBeTruthy()
    const post = chamadas.find((c) => c.method === 'post' && c.url === '/campanhas')
    // Corpo exato do contrato: itens, galeria e localização não vão para a API.
    expect(JSON.parse(post.data)).toEqual({
      titulo: 'Uma nova causa',
      descricao: 'Kits para alunos.',
      metaValor: 500,
      dataInicio: hoje,
      dataFim: emDias(30),
      imagemUrl: `${window.location.origin}/images/alimentos.jpg`,
      categoria: 'Educação',
      rascunho: false,
    })
    expect((await screen.findByText('Uma nova causa')).closest('tr').textContent).toContain('Ativa')
  })

  it('salva rascunho antes da revisão', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(await screen.findByRole('heading', { name: 'Gestão de campanhas' })).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'post').data).rascunho).toBe(true)
    expect((await screen.findByText('Uma nova causa')).closest('tr').textContent).toContain('Rascunho')
  })

  it('início futuro avisa que a campanha fica agendada', async () => {
    espionar()
    const user = await abrir()
    await preencher(user, { inicio: emDias(5) })
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText(/fica agendada/)).toBeTruthy()
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect((await screen.findByText('Uma nova causa')).closest('tr').textContent).toContain('Agendada')
  })

  it('não avança com campos inválidos e marca os campos', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('Revise os campos')
    expect(screen.getByLabelText(/Título da campanha/).getAttribute('aria-invalid')).toBe('true')
    expect(chamadas.some((c) => c.method === 'post')).toBe(false)
  })

  it('mostra no campo o erro de validação da API (422)', async () => {
    espionar((config) => Promise.reject({ response: { status: 422, data: { erros: { titulo: 'Título já usado.' } } }, config }))
    const user = await abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(await screen.findByText('Título já usado.')).toBeTruthy()
  })

  it('itens necessários ficam só na tela: entram na revisão e não vão no POST', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await preencher(user)
    expect(screen.getByText(/Aguardando integração · Itens da campanha/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(screen.getByText('Informe o nome do item.')).toBeTruthy()
    await user.type(screen.getByLabelText(/^Item/), 'Cesta básica')
    await user.type(screen.getByLabelText(/^Quantidade/), '20')
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(screen.getByRole('button', { name: 'Remover Cesta básica' })).toBeTruthy()
    await user.type(screen.getByLabelText(/^Item/), 'cesta básica')
    await user.type(screen.getByLabelText(/^Quantidade/), '5')
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(screen.getByText('Este item já está na lista.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('1 (não enviados)')).toBeTruthy()
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect(await screen.findByRole('heading', { name: 'Gestão de campanhas' })).toBeTruthy()
    const corpo = JSON.parse(chamadas.find((c) => c.method === 'post').data)
    expect(corpo).not.toHaveProperty('itens')
  })

  it('409 da API (entidade não aprovada) mantém o formulário preenchido com a mensagem', async () => {
    espionar((config) => Promise.reject({ response: { status: 409, data: { error: 'Entidade não aprovada não pode criar campanhas.' } }, config }))
    const user = await abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Entidade não aprovada não pode criar campanhas.')
    expect(screen.getByLabelText(/Meta financeira/).value).toBe('500')
    expect(screen.getByRole('heading', { level: 1, name: 'Criar campanha' })).toBeTruthy()
  })

  it('rascunho sem meta leva à etapa da meta com o campo marcado', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await user.type(screen.getByLabelText(/Título da campanha/), 'Uma nova causa')
    await user.type(screen.getByLabelText(/Descrição da campanha/), 'Kits para alunos.')
    fireEvent.change(screen.getByLabelText(/^Início/), { target: { value: hoje } })
    fireEvent.change(screen.getByLabelText(/^Encerramento/), { target: { value: emDias(30) } })
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Metas e itens' })).toBeTruthy()
    expect(screen.getByLabelText(/Meta financeira/).getAttribute('aria-invalid')).toBe('true')
    expect(chamadas.some((c) => c.method === 'post')).toBe(false)
  })

  it('entidade pendente não cria campanha', async () => {
    salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, statusEntidade: 'PENDENTE' } })
    render(
      <MemoryRouter initialEntries={['/campanhas/nova']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/ainda não foi aprovada/)).toBeTruthy()
    expect(screen.queryByLabelText(/Título da campanha/)).toBeNull()
  })
})
