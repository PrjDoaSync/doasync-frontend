import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { adaptadorApiPadrao } from './fixtures/apiCampanhas'
import {
  corpoCriacaoApi,
  hojeISO,
  mensagemCriacao,
  montarCampanha,
  validarBasicos,
  validarMetas,
  validarNovoItem,
  validarPublicacao,
} from '../utils/criarCampanha'

beforeEach(() =>
  vi
    .spyOn(fonte, 'carregarDemo')
    .mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

describe('regras de criar campanha (#89, #90)', () => {
  const basicos = { nome: 'Causa', descricao: 'Texto', inicio: '2026-10-01', encerraEm: '2026-11-01' }
  it('valida os dados básicos', () => {
    expect(validarBasicos(basicos)).toBe('')
    expect(validarBasicos({ ...basicos, nome: ' ' })).toMatch(/nome e a descrição/)
    expect(validarBasicos({ ...basicos, encerraEm: '2026-09-01' })).toBeTruthy()
  })
  it('exige meta financeira positiva e limita a quantidade de itens', () => {
    expect(validarMetas({ meta: '500', itens: [] })).toBe('')
    expect(validarMetas({ meta: '0', itens: [] })).toMatch(/maior que zero/)
    expect(validarMetas({ meta: '', itens: [] })).toMatch(/maior que zero/)
    expect(validarMetas({ meta: '10', itens: Array.from({ length: 11 }, (_, i) => ({ nome: `i${i}`, meta: 1 })) })).toMatch(/no máximo 10/)
  })
  it('valida item novo: nome, quantidade inteira e duplicidade', () => {
    const itens = [{ nome: 'Cesta básica', meta: 10 }]
    expect(validarNovoItem({ nome: 'Leite', quantidade: '5' }, itens)).toBe('')
    expect(validarNovoItem({ nome: ' ', quantidade: '5' }, itens)).toMatch(/nome do item/)
    expect(validarNovoItem({ nome: 'Leite', quantidade: '0' }, itens)).toMatch(/maior que zero/)
    expect(validarNovoItem({ nome: 'Leite', quantidade: '2.5' }, itens)).toMatch(/inteira/)
    expect(validarNovoItem({ nome: 'cesta BÁSICA', quantidade: '3' }, itens)).toMatch(/já está/)
  })
  it('publica só com encerramento a partir de hoje e confirmação', () => {
    expect(validarPublicacao({ encerraEm: '2026-10-05', confirmado: true }, '2026-10-06')).toMatch(/hoje ou posterior/)
    expect(validarPublicacao({ encerraEm: '2026-10-20', confirmado: false }, '2026-10-06')).toMatch(/Confirme/)
    expect(validarPublicacao({ encerraEm: '2026-10-06', confirmado: true }, '2026-10-06')).toBe('')
  })
  it('monta a campanha com as metas de itens somadas', () => {
    const nova = montarCampanha({
      id: 1,
      basicos: { ...basicos, categoria: 'Alimentação', cidade: 'São Paulo, SP' },
      meta: '500',
      itens: [{ nome: 'Cesta básica', meta: 10 }, { nome: 'Leite', meta: 5 }],
      imagem: '/images/alimentos.jpg',
      entidade: { id: 1, nome: 'Rede Esperança' },
      status: 'Ativa',
    })
    expect(nova).toMatchObject({ meta: 500, itensMeta: 15, status: 'Ativa', arrecadado: 0, entidadeId: 1 })
    expect(nova.necessidades).toEqual([{ nome: 'Cesta básica', meta: 10 }, { nome: 'Leite', meta: 5 }])
  })
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

async function preencherEtapa1(user) {
  await user.type(screen.getByLabelText(/Nome da campanha/), 'Uma nova causa')
  await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação')
  await user.type(screen.getByLabelText('Descrição da campanha'), 'Uma causa de demonstração.')
  // Início no passado (a API cria como ATIVA) e término no futuro (a publicação exige).
  fireEvent.change(screen.getByLabelText(/Início/), { target: { value: '2026-10-01' } })
  fireEvent.change(screen.getByLabelText(/Encerramento/), { target: { value: '2099-12-31' } })
  await user.type(screen.getByLabelText(/Meta financeira/), '500')
}
// Depois de salvar, a lista é recarregada da API.
const linhaNaLista = async (titulo) => (await screen.findByText(titulo)).closest('tr')

describe('assistente de criação de campanha', () => {
  it('não avança com dados básicos incompletos', async () => {
    const user = await abrir('/campanhas/nova')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('nome e a descrição')
    expect(screen.getByRole('heading', { name: 'Dados básicos' })).toBeTruthy()
  })
  it('adiciona, recusa duplicado e remove itens necessários', async () => {
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('heading', { name: 'Metas e necessidades' })).toBeTruthy()
    expect(screen.getByText(/Nenhum item adicionado/)).toBeTruthy()
    await user.type(screen.getByLabelText('Nome do item'), 'Cesta básica')
    await user.type(screen.getByLabelText('Quantidade'), '10')
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    const lista = screen.getByRole('list', { name: 'Itens necessários' })
    expect(within(lista).getByText('Cesta básica')).toBeTruthy()
    await user.type(screen.getByLabelText('Nome do item'), 'cesta básica')
    await user.type(screen.getByLabelText('Quantidade'), '3')
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(screen.getByText('Esse item já está na lista.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remover Cesta básica' }))
    expect(screen.getByText(/Nenhum item adicionado/)).toBeTruthy()
  })
  it('mantém os dados ao voltar e exige meta maior que zero', async () => {
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    const meta = screen.getByLabelText(/Meta financeira/)
    await user.clear(meta)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('meta financeira maior que zero')
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByLabelText(/Nome da campanha/).value).toBe('Uma nova causa')
  })
  it('exige confirmação e publica a campanha como ativa', async () => {
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.type(screen.getByLabelText('Nome do item'), 'Cesta básica')
    await user.type(screen.getByLabelText('Quantidade'), '10')
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('heading', { name: 'Revisão e publicação' })).toBeTruthy()
    expect(screen.getByText('10 Cesta básica')).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: /Educação/ }))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect(screen.getByRole('alert').textContent).toContain('Confirme')
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect(await screen.findByRole('heading', { name: 'Gestão de campanhas' })).toBeTruthy()
    expect((await linhaNaLista('Uma nova causa')).textContent).toContain('Ativa')
    expect(screen.getByText('Campanha publicada.')).toBeTruthy()
  })
  it('salva rascunho a partir da etapa de revisão', async () => {
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(await screen.findByRole('heading', { name: 'Gestão de campanhas' })).toBeTruthy()
    expect((await linhaNaLista('Uma nova causa')).textContent).toContain('Rascunho')
  })
})

describe('criar campanha na API (POST /campanhas)', () => {
  function capturar(responder) {
    const enviados = []
    api.defaults.adapter = (config) => {
      if (config.method === 'post' && config.url === '/campanhas') {
        enviados.push(JSON.parse(config.data))
        if (responder) return responder(config)
      }
      return adaptadorApiPadrao(config)
    }
    return enviados
  }
  it('envia só os campos do contrato, com o token e rascunho: false ao publicar', async () => {
    const enviados = capturar()
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    await screen.findByRole('heading', { name: 'Gestão de campanhas' })
    expect(enviados).toEqual([
      {
        titulo: 'Uma nova causa',
        descricao: 'Uma causa de demonstração.',
        metaValor: 500,
        dataInicio: '2026-10-01',
        dataFim: '2099-12-31',
        categoria: 'Alimentação',
        rascunho: false,
      },
    ])
  })
  it('início no futuro: a API agenda a campanha e a tela avisa', async () => {
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    fireEvent.change(screen.getByLabelText(/Início/), { target: { value: '2099-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByLabelText(/Confirmo que as informações/))
    await user.click(screen.getByRole('button', { name: 'Publicar campanha' }))
    expect((await linhaNaLista('Uma nova causa')).textContent).toContain('Agendada')
    expect(screen.getByText(/Campanha agendada/)).toBeTruthy()
  })
  it('entidade ainda não aprovada (409) vê a mensagem da API e continua no formulário', async () => {
    capturar((config) =>
      Promise.reject({
        response: { status: 409, data: { error: 'A entidade ainda não foi aprovada.' } },
        config,
        isAxiosError: true,
      }),
    )
    const user = await abrir('/campanhas/nova')
    await preencherEtapa1(user)
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(await screen.findByText('A entidade ainda não foi aprovada.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Dados básicos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Salvar rascunho' }).disabled).toBe(false)
  })
})

describe('corpo de POST /campanhas', () => {
  const basicos = { nome: ' Causa ', descricao: ' Texto ', inicio: '2026-10-01', encerraEm: '2026-11-01', meta: '10.5', categoria: '' }
  it('apara textos, converte a meta e omite a categoria vazia', () => {
    expect(corpoCriacaoApi(basicos, { rascunho: true })).toEqual({
      titulo: 'Causa',
      descricao: 'Texto',
      metaValor: 10.5,
      dataInicio: '2026-10-01',
      dataFim: '2026-11-01',
      rascunho: true,
    })
  })
  it('hojeISO usa a data local com zeros à esquerda', () => {
    expect(hojeISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
  it('mensagem de sucesso segue o status devolvido pela API', () => {
    expect(mensagemCriacao('Rascunho')).toBe('Rascunho salvo.')
    expect(mensagemCriacao('Agendada')).toMatch(/agendada/)
    expect(mensagemCriacao('Ativa')).toBe('Campanha publicada.')
  })
})
