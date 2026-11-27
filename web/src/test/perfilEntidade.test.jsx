// Perfil da entidade integrado a GET/PATCH /entidades/{id} (passo 17).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { adaptadorApiPadrao, definirEntidadeApi, entidadeDaSessao } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

function espionar() {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

async function abrir() {
  render(
    <MemoryRouter initialEntries={['/configuracoes']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Perfil da entidade' })
  await screen.findByLabelText(/Nome da entidade/)
  return userEvent.setup()
}

describe('perfil da entidade (GET/PATCH /entidades/{id})', () => {
  it('carrega os dados da entidade da sessão e salva as alterações', async () => {
    const chamadas = espionar()
    const user = await abrir()
    const id = SESSAO_ENTIDADE_TESTE.usuario.entidadeId
    expect(chamadas.find((c) => c.method === 'get' && c.url === `/entidades/${id}`)).toBeTruthy()
    expect(screen.getByLabelText(/Nome da entidade/).value).toBe('Rede Esperança')
    expect(screen.getByText('11.222.333/0001-81')).toBeTruthy()

    const nome = screen.getByLabelText(/Nome da entidade/)
    await user.clear(nome)
    await user.type(nome, 'Rede Esperança SC')
    await user.type(screen.getByLabelText(/^WhatsApp/), '48999990000')
    await user.click(screen.getByRole('button', { name: /Salvar perfil/ }))
    expect(await screen.findByText('Perfil atualizado.')).toBeTruthy()

    const patch = chamadas.find((c) => c.method === 'patch')
    expect(patch.url).toBe(`/entidades/${id}`)
    expect(JSON.parse(patch.data)).toMatchObject({ nomeFantasia: 'Rede Esperança SC', whatsapp: '48999990000' })
    expect(JSON.parse(patch.data).endereco).toBeUndefined()
    expect(entidadeDaSessao().nomeFantasia).toBe('Rede Esperança SC')
  })

  it('valida endereço incompleto e responsável sem CPF antes de enviar', async () => {
    const chamadas = espionar()
    const user = await abrir()
    await user.type(screen.getByLabelText(/^Cidade/), 'Florianópolis')
    await user.type(screen.getByLabelText(/Nome do responsável/), 'Ana Lima')
    await user.click(screen.getByRole('button', { name: /Salvar perfil/ }))
    expect(screen.getByRole('alert').textContent).toContain('Revise os campos')
    expect(screen.getByLabelText(/^CEP/).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText(/CPF do responsável/).getAttribute('aria-invalid')).toBe('true')
    expect(chamadas.some((c) => c.method === 'patch')).toBe(false)
  })

  it('envia o endereço completo com CEP mascarado e UF maiúscula', async () => {
    const chamadas = espionar()
    const user = await abrir()
    for (const [rotulo, valor] of [[/^CEP/, '88010000'], [/^Logradouro/, 'Rua A'], [/^Número/, '10'], [/^Bairro/, 'Centro'], [/^Cidade/, 'Florianópolis'], [/^UF/, 'sc']]) {
      await user.type(screen.getByLabelText(rotulo), valor)
    }
    await user.click(screen.getByRole('button', { name: /Salvar perfil/ }))
    await screen.findByText('Perfil atualizado.')
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data).endereco).toMatchObject({ cep: '88010-000', uf: 'SC' })
  })

  it('entidade pendente vê o aviso de análise', async () => {
    definirEntidadeApi({ id: SESSAO_ENTIDADE_TESTE.usuario.entidadeId, statusAprovacao: 'PENDENTE' })
    await abrir()
    expect(screen.getByText(/Cadastro em análise/)).toBeTruthy()
  })

  it('admin não tem perfil de entidade', async () => {
    salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, tipo: 'ADMIN', entidadeId: null } })
    render(
      <MemoryRouter initialEntries={['/configuracoes']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { level: 1, name: 'Perfil disponível só para entidades' })).toBeTruthy()
  })
})
