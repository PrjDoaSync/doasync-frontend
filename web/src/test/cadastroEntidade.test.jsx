// Cadastro de entidade integrado a POST /entidades (passo 16).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { limparSessao, obterSessao } from '../services/token'
import { corpoCadastroEntidade, formatarCep, validarCadastroEntidade } from '../utils/cadastroEntidade'
import { adaptadorApiPadrao } from './fixtures/apiCampanhas'

const VALIDO = {
  nome: 'APAE Teste', razaoSocial: 'Associação de Pais e Amigos', cnpj: '11222333000181', email: 'apae@teste.org',
  telefone: '4833330000', senha: 'senha1234', confirmacao: 'senha1234', descricao: 'Atendimento especializado.',
  areaAtuacao: 'Saúde', site: '', responsavelNome: '', responsavelCpf: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
}
const ENDERECO = { cep: '88010000', logradouro: 'Rua das Flores', numero: '123', complemento: '', bairro: 'Centro', cidade: 'Florianópolis', uf: 'sc' }

describe('regras do cadastro de entidade', () => {
  it('aceita só os obrigatórios', () => {
    expect(validarCadastroEntidade(VALIDO)).toEqual({})
  })
  it('exige nome e CPF do responsável juntos (RN46) e CPF válido', () => {
    expect(Object.keys(validarCadastroEntidade({ ...VALIDO, responsavelNome: 'Ana' }))).toEqual(['responsavelCpf'])
    expect(Object.keys(validarCadastroEntidade({ ...VALIDO, responsavelCpf: '529.982.247-25' }))).toEqual(['responsavelNome'])
  })
  it('endereço é tudo ou nada (menos o complemento), com CEP de 8 dígitos e UF de 2 letras', () => {
    expect(validarCadastroEntidade({ ...VALIDO, ...ENDERECO })).toEqual({})
    expect(Object.keys(validarCadastroEntidade({ ...VALIDO, cidade: 'Florianópolis' })).sort()).toEqual(
      ['bairro', 'cep', 'logradouro', 'numero', 'uf'],
    )
    expect(Object.keys(validarCadastroEntidade({ ...VALIDO, ...ENDERECO, cep: '880', uf: 'Santa' })).sort()).toEqual(['cep', 'uf'])
  })
  it('monta o corpo com CNPJ/CPF/CEP mascarados, UF maiúscula e sem opcionais vazios', () => {
    const corpo = corpoCadastroEntidade({ ...VALIDO, ...ENDERECO, responsavelNome: ' Ana ', responsavelCpf: '52998224725' })
    expect(corpo).toMatchObject({
      nome: 'APAE Teste', nomeFantasia: 'APAE Teste', cnpj: '11.222.333/0001-81',
      responsavelNome: 'Ana', responsavelCpf: '529.982.247-25',
      endereco: { cep: '88010-000', uf: 'SC', cidade: 'Florianópolis', complemento: undefined },
    })
    expect(corpo.site).toBeUndefined()
    expect('endereco' in corpoCadastroEntidade(VALIDO)).toBe(false)
    expect(formatarCep('88010-000')).toBe('88010-000')
  })
})

beforeEach(() => {
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo()))
  limparSessao()
})

function simularApi(resposta) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    if (config.url === '/entidades' && config.method === 'post') {
      if (resposta) return resposta(config)
      const c = JSON.parse(config.data)
      const data = { id: 'e9', cnpj: c.cnpj, razaoSocial: c.razaoSocial, nomeFantasia: c.nomeFantasia, statusAprovacao: 'PENDENTE' }
      return Promise.resolve({ data: { data }, status: 201, statusText: 'Created', headers: {}, config })
    }
    return adaptadorApiPadrao(config)
  }
  return chamadas
}

async function abrir() {
  render(
    <MemoryRouter initialEntries={['/cadastro-entidade']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Cadastre sua entidade' })
  return userEvent.setup()
}

async function preencher(user) {
  await user.type(screen.getByLabelText(/Nome da entidade/), 'APAE Teste')
  await user.type(screen.getByLabelText(/Razão social/), 'Associação de Pais e Amigos')
  await user.type(screen.getByLabelText(/^CNPJ/), '11222333000181')
  await user.type(screen.getByLabelText(/Sobre a entidade/), 'Atendimento especializado.')
  await user.type(screen.getByLabelText(/^E-mail/), 'apae@teste.org')
  await user.type(screen.getByLabelText(/^Telefone/), '4833330000')
  await user.type(screen.getByLabelText(/^Senha/), 'senha1234')
  await user.type(screen.getByLabelText(/Confirme a senha/), 'senha1234')
}

describe('tela de cadastro de entidade', () => {
  it('é pública, usa o layout público e envia POST /entidades', async () => {
    const chamadas = simularApi()
    const user = await abrir()
    expect(screen.getByRole('navigation', { name: 'Navegação pública' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Navegação administrativa' })).toBeNull()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar entidade' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Cadastro enviado para análise' })).toBeTruthy()
    expect(screen.getByText('aguardando aprovação')).toBeTruthy()
    const post = chamadas.find((c) => c.url === '/entidades')
    expect(JSON.parse(post.data)).toMatchObject({ nome: 'APAE Teste', cnpj: '11.222.333/0001-81', nomeFantasia: 'APAE Teste' })
    // Cadastrar não autentica: a entidade entra depois pelo login.
    expect(obterSessao()).toBeNull()
    const proximos = within(screen.getByRole('heading', { name: 'Próximos passos' }).closest('section'))
    expect(proximos.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/login')
  })

  it('não envia com dados inválidos e marca os campos', async () => {
    const chamadas = simularApi()
    const user = await abrir()
    await user.type(screen.getByLabelText(/^CNPJ/), '123')
    await user.type(screen.getByLabelText(/^Cidade/), 'Florianópolis')
    await user.click(screen.getByRole('button', { name: 'Cadastrar entidade' }))
    expect(screen.getByRole('alert').textContent).toContain('Revise os campos')
    expect(screen.getByLabelText(/^CNPJ/).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText(/^Logradouro/).getAttribute('aria-invalid')).toBe('true')
    expect(chamadas.some((c) => c.url === '/entidades')).toBe(false)
  })

  it('mostra no campo o CNPJ já cadastrado (409)', async () => {
    simularApi((config) => Promise.reject({ response: { status: 409, data: { erros: { cnpj: 'CNPJ já cadastrado.' } } }, config }))
    const user = await abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar entidade' }))
    expect(await screen.findByText('CNPJ já cadastrado.')).toBeTruthy()
    expect(screen.getByLabelText(/^CNPJ/).getAttribute('aria-invalid')).toBe('true')
  })

  it('não tem mais o envio de documentos (sem endpoint na API)', async () => {
    await abrir()
    expect(screen.queryByLabelText('Adicionar documentos')).toBeNull()
  })
})
