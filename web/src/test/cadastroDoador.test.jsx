// Cadastro de doador integrado a POST /doadores (passo 13).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { limparSessao, obterSessao } from '../services/token'
import { corpoCadastroDoador, idade, validarCadastroDoador, validarCpf } from '../utils/cadastroDoador'
import { adaptadorApiPadrao, campanhasApi } from './fixtures/apiCampanhas'

const CPF_VALIDO = '529.982.247-25'

describe('regras do cadastro de doador', () => {
  it('valida CPF pelos dígitos verificadores', () => {
    expect(validarCpf(CPF_VALIDO)).toBe(true)
    expect(validarCpf('52998224725')).toBe(true)
    expect(validarCpf('529.982.247-26')).toBe(false)
    expect(validarCpf('111.111.111-11')).toBe(false)
    expect(validarCpf('123')).toBe(false)
  })
  it('envia CPF e CNPJ sempre com máscara (o banco exige 14 e 18 caracteres)', () => {
    const base = { nome: ' Ana ', email: ' a@x.com ', senha: 's', telefone: '48', cpf: '52998224725', dataNascimento: '1990-01-01' }
    expect(corpoCadastroDoador({ ...base, tipo: 'PESSOA_FISICA' }).cpf).toBe(CPF_VALIDO)
    expect(corpoCadastroDoador({ ...base, tipo: 'PESSOA_JURIDICA', cnpj: '11222333000181', razaoSocial: 'X' }).cnpj).toBe(
      '11.222.333/0001-81',
    )
  })
  it('calcula a idade em anos completos', () => {
    expect(idade('2008-11-24', '2026-11-23')).toBe(17)
    expect(idade('2008-11-23', '2026-11-23')).toBe(18)
  })
  it('exige os campos do tipo escolhido, senha confirmada e maioridade', () => {
    const base = { nome: 'Maria', email: 'maria@x.com', senha: 'senha1234', confirmacao: 'senha1234', telefone: '48999990000' }
    expect(validarCadastroDoador({ ...base, tipo: 'PESSOA_FISICA', cpf: CPF_VALIDO, dataNascimento: '1990-01-01' }, '2026-11-23')).toEqual({})
    expect(
      Object.keys(validarCadastroDoador({ ...base, tipo: 'PESSOA_FISICA', cpf: '1', dataNascimento: '2010-01-01', confirmacao: 'outra' }, '2026-11-23')),
    ).toEqual(['confirmacao', 'cpf', 'dataNascimento'])
    expect(Object.keys(validarCadastroDoador({ ...base, tipo: 'PESSOA_JURIDICA', cnpj: '123', razaoSocial: '' }, '2026-11-23'))).toEqual([
      'cnpj',
      'razaoSocial',
    ])
  })
})

beforeEach(() => {
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo()))
  limparSessao()
})

function simularApi({ cadastro } = {}) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    const ok = (data, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })
    if (config.url === '/doadores') {
      if (cadastro) return cadastro(config)
      const c = JSON.parse(config.data)
      return ok({ data: { id: 'u9', nome: c.nome, email: c.email, tipo: c.tipo, dataCadastro: '2026-11-23T22:00:00Z' } }, 201)
    }
    if (config.url === '/auth/login') {
      const { email } = JSON.parse(config.data)
      const usuario = { id: 'u9', nome: 'Joana Lima', email, tipo: 'PESSOA_FISICA', entidadeId: null, statusEntidade: null }
      return ok({ data: { token: 't9', tipoToken: 'Bearer', expiraEm: '2999-01-01T00:00:00Z', usuario } })
    }
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

async function abrir(rota, state) {
  render(
    <MemoryRouter initialEntries={[{ pathname: rota, state }]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}

async function preencherPf(user, { email = 'joana@x.com' } = {}) {
  await user.type(screen.getByLabelText(/Nome completo/), 'Joana Lima')
  await user.type(screen.getByLabelText(/CPF/), CPF_VALIDO)
  await user.type(screen.getByLabelText(/Data de nascimento/), '1990-05-15')
  await user.type(screen.getByLabelText(/E-mail/), email)
  await user.type(screen.getByLabelText(/Telefone/), '48999990000')
  await user.type(screen.getByLabelText(/^Senha/), 'senha1234')
  await user.type(screen.getByLabelText(/Confirme a senha/), 'senha1234')
}

describe('tela de cadastro de doador', () => {
  it('cria a conta PF, entra e volta para a doação de origem', async () => {
    const chamadas = simularApi()
    const doacao = `/doar/${campanhasApi[0].id}`
    const user = await abrir('/cadastro-doador', { de: doacao })
    await preencherPf(user)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Qual o valor da sua doação?' })).toBeTruthy()
    const cadastro = chamadas.find((c) => c.url === '/doadores')
    expect(JSON.parse(cadastro.data)).toEqual({
      tipo: 'PESSOA_FISICA',
      nome: 'Joana Lima',
      email: 'joana@x.com',
      senha: 'senha1234',
      telefone: '48999990000',
      cpf: CPF_VALIDO,
      dataNascimento: '1990-05-15',
    })
    expect(obterSessao().usuario.email).toBe('joana@x.com')
  })

  it('não envia com dados inválidos e marca os campos', async () => {
    const chamadas = simularApi()
    const user = await abrir('/cadastro-doador')
    await user.type(screen.getByLabelText(/CPF/), '123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(screen.getByRole('alert').textContent).toContain('Revise os campos')
    expect(screen.getByText('CPF inválido.')).toBeTruthy()
    expect(screen.getByLabelText(/CPF/).getAttribute('aria-invalid')).toBe('true')
    expect(chamadas.some((c) => c.url === '/doadores')).toBe(false)
  })

  it('mostra no campo o e-mail já cadastrado (409) e não entra', async () => {
    simularApi({
      cadastro: (config) =>
        Promise.reject({ response: { status: 409, data: { erros: { email: 'E-mail já cadastrado.' } } }, config }),
    })
    const user = await abrir('/cadastro-doador')
    await preencherPf(user, { email: 'maria@doasync.local' })
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('E-mail já cadastrado.')).toBeTruthy()
    expect(screen.getByLabelText(/E-mail/).getAttribute('aria-invalid')).toBe('true')
    expect(obterSessao()).toBeNull()
  })

  it('pessoa jurídica pede CNPJ e razão social', async () => {
    const user = await abrir('/cadastro-doador')
    await user.click(screen.getByRole('radio', { name: /Pessoa jurídica/ }))
    expect(screen.getByLabelText(/CNPJ/)).toBeTruthy()
    expect(screen.getByLabelText(/Razão social/)).toBeTruthy()
    expect(screen.queryByLabelText(/CPF/)).toBeNull()
  })

  it('a identificação da doação e o login levam ao cadastro', async () => {
    simularApi()
    const user = await abrir(`/doar/${campanhasApi[0].id}`)
    await user.click(screen.getByRole('button', { name: /R\$\s50,00/ }))
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.click(screen.getByRole('link', { name: 'Criar conta de doador' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Crie sua conta para doar' })).toBeTruthy()
    const rodapeFormulario = screen.getByText(/Já tem uma conta\?/).closest('p')
    await user.click(within(rodapeFormulario).getByRole('link', { name: 'Entrar' }))
    expect(screen.getByRole('link', { name: 'Criar conta de doador' }).getAttribute('href')).toBe('/cadastro-doador')
  })
})
