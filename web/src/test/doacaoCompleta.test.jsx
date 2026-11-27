// Telas do protótipo que dependem de rotas ainda inexistentes (DOA-01, DOA-05 a DOA-07) e
// funcionalidades integradas novas: doação direta à entidade, entidades públicas e Minha conta.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { RecursoIndisponivelError, recursoIndisponivel } from '../services/indisponivel'
import { limparSessao, salvarSessao } from '../services/token'
import { luhn, somarDias, validarAgendamento, validarCartao, validarItens } from '../utils/doacao'
import { filtrarEntidadesPublicas } from '../utils/entidadesPublicas'
import { validarPerfilUsuario } from '../utils/perfilUsuario'
import { ENTIDADE_SESSAO_ID, SENHA_ATUAL_TESTE, adaptadorApiPadrao, campanhasApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

const CAMPANHA = campanhasApi[0]
const DOADORA = {
  ...SESSAO_ENTIDADE_TESTE,
  usuario: { id: 'u2', nome: 'Maria Souza', email: 'maria@doasync.local', tipo: 'PESSOA_FISICA', entidadeId: null, statusEntidade: null },
}

beforeEach(() => vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())))

async function abrir(rota) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}
function espionarApi() {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}
const posts = (chamadas) => chamadas.filter((c) => c.method === 'post')

async function ateIdentificacaoFinanceira(user, metodo) {
  await user.click(screen.getByRole('button', { name: /Continuar com doação financeira/ }))
  await user.click(screen.getByRole('button', { name: /R\$\s50,00/ }))
  if (metodo) await user.click(screen.getByRole('radio', { name: new RegExp(metodo) }))
  await user.click(screen.getByRole('button', { name: /^Continuar/ }))
  await user.click(screen.getByRole('button', { name: /Revisar doação/ }))
}

describe('regras puras do fluxo de doação', () => {
  it('valida cartão por Luhn, validade e CVV', () => {
    expect(luhn('4111 1111 1111 1111')).toBe(true)
    expect(luhn('4111 1111 1111 1112')).toBe(false)
    expect(validarCartao({ nome: 'Maria Souza', numero: '4111111111111111', validade: '12/30', cvv: '123' }, '2026-11-27')).toEqual({})
    const erros = validarCartao({ nome: 'M', numero: '123', validade: '10/26', cvv: '1' }, '2026-11-27')
    expect(Object.keys(erros).sort()).toEqual(['cvv', 'nome', 'numero', 'validade'])
    expect(erros.validade).toBe('Cartão vencido.')
  })
  it('valida itens e agendamento', () => {
    expect(validarItens({}, { Cesta: 5 })).toMatch(/ao menos um item/)
    expect(validarItens({ Cesta: '6' }, { Cesta: 5 })).toMatch(/no máximo 5/)
    expect(validarItens({ Cesta: '2' }, { Cesta: 5 })).toBe('')
    const hoje = '2026-11-27'
    expect(validarAgendamento({ modo: 'retirada', data: '2026-11-26', janela: '', endereco: '' }, { hoje })).toEqual({
      data: 'Escolha uma data a partir de hoje.',
      janela: 'Escolha um período.',
      endereco: 'Informe o endereço para a retirada.',
    })
    expect(validarAgendamento({ modo: 'entrega', data: '2026-12-31', janela: 'Manhã (9h às 12h)' }, { hoje, limite: '2026-12-15' }).data).toMatch(/encerramento/)
    expect(somarDias('2026-12-30', 3)).toBe('2027-01-02')
  })
  it('serviço pendente rejeita com o motivo e não envia nada', async () => {
    await expect(recursoIndisponivel('cartao')).rejects.toBeInstanceOf(RecursoIndisponivelError)
    await expect(recursoIndisponivel('cartao')).rejects.toMatchObject({ indisponivel: true, recurso: 'cartao' })
  })
  it('valida Minha conta e filtra entidades públicas sem acentos', () => {
    expect(validarPerfilUsuario({ nome: 'Ana', telefone: '', senhaAtual: '', novaSenha: '', confirmacao: '' })).toEqual({})
    expect(validarPerfilUsuario({ nome: ' ', telefone: '12', senhaAtual: '', novaSenha: 'curta', confirmacao: 'x' })).toEqual({
      nome: 'Informe seu nome.',
      telefone: 'Informe o telefone com DDD.',
      senhaAtual: 'Informe a senha atual para trocar a senha.',
      novaSenha: 'A nova senha deve ter pelo menos 8 caracteres.',
      confirmacao: 'A confirmação não confere com a nova senha.',
    })
    const lista = [
      { nome: 'Mãos que Ajudam', areaAtuacao: 'Saúde' },
      { nome: 'Amor Inclusivo', areaAtuacao: 'Educação' },
    ]
    expect(filtrarEntidadesPublicas(lista, { busca: 'maos' }).map((e) => e.nome)).toEqual(['Mãos que Ajudam'])
    expect(filtrarEntidadesPublicas(lista, { area: 'Educação' }).map((e) => e.nome)).toEqual(['Amor Inclusivo'])
  })
})

describe('pagamento com cartão ou boleto (DOA-05)', () => {
  it('cartão valida os campos e, válido, mostra a pendência sem registrar nada', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await ateIdentificacaoFinanceira(user, 'Cartão')
    expect(screen.getByRole('heading', { level: 2, name: 'Pagamento com cartão' })).toBeTruthy()
    expect(screen.getByText(/Aguardando integração · Pagamento com cartão/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByText('Número de cartão inválido.')).toBeTruthy()
    await user.type(screen.getByLabelText(/Nome no cartão/), 'Maria Souza')
    await user.type(screen.getByLabelText(/Número do cartão/), '4111 1111 1111 1111')
    await user.type(screen.getByLabelText(/Validade/), '12/30')
    await user.type(screen.getByLabelText(/CVV/), '123')
    await user.click(screen.getByRole('button', { name: /Pagar/ }))
    expect((await screen.findByText(/Nenhum dado foi enviado e nada foi cobrado/)).textContent).toContain('somente PIX')
    expect(posts(chamadas)).toHaveLength(0)
    // O atalho volta para o PIX, que registra de verdade.
    await user.click(screen.getByRole('button', { name: 'Concluir com PIX' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Pagamento via PIX' })).toBeTruthy()
  })

  it('boleto mostra beneficiário e vencimento e não gera documento', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await ateIdentificacaoFinanceira(user, 'Boleto')
    expect(screen.getByRole('heading', { level: 2, name: 'Pagamento com boleto' })).toBeTruthy()
    expect(within(document.querySelector('.boleto')).getByText('Rede Esperança')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Gerar boleto' }))
    expect(await screen.findByText(/emissão de boletos depende/, { selector: '.aviso--erro div' })).toBeTruthy()
    expect(posts(chamadas)).toHaveLength(0)
  })
})

describe('doação de itens e agendamento (DOA-06 e DOA-07)', () => {
  it('escolhe itens, agenda a retirada e vê a pendência sem registrar nada', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir(`/doar/${CAMPANHA.id}`)
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    await user.click(screen.getByRole('button', { name: /Continuar com doação de itens/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Quais itens você vai doar?' })).toBeTruthy()
    expect(screen.getByText(/itens abaixo são exemplos de demonstração/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('ao menos um item')
    // Item com meta atingida fica bloqueado.
    expect(screen.getByLabelText('Quantidade de Leite em pó').disabled).toBe(true)
    await user.type(screen.getByLabelText('Quantidade de Cesta básica'), '3')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: /Revisar doação/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Quando os itens chegam?' })).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: /Quero que retirem comigo/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar doação de itens' }))
    expect(screen.getByText('Escolha uma data.')).toBeTruthy()
    expect(screen.getByText('Informe o endereço para a retirada.')).toBeTruthy()
    // Data até o encerramento da campanha (dataFim do simulador: 2027-01-15).
    await user.type(screen.getByLabelText(/Data/), '2027-01-10')
    await user.selectOptions(screen.getByLabelText(/Período/), 'Tarde (13h às 17h)')
    await user.type(screen.getByLabelText(/Endereço para retirada/), 'Rua das Flores, 100')
    await user.click(screen.getByRole('button', { name: 'Revisar doação de itens' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Confira sua doação de itens' })).toBeTruthy()
    const resumo = screen.getByRole('heading', { level: 2, name: 'Resumo da doação de itens' }).closest('section')
    expect(within(resumo).getByText('3 un.')).toBeTruthy()
    expect(within(resumo).getByText('Rua das Flores, 100')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Enviar doação de itens' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Nada foi registrado.')
    expect(posts(chamadas)).toHaveLength(0)
  })
})

describe('entidades públicas e doação direta (RF-009, POST /doacoes com entidadeId)', () => {
  it('lista as aprovadas, busca e abre o perfil com as campanhas ativas', async () => {
    limparSessao()
    const user = await abrir('/entidades-publicas')
    expect(screen.getByRole('heading', { level: 1, name: 'Entidades que transformam realidades' })).toBeTruthy()
    const contagem = (texto) => screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === texto)
    await screen.findByRole('link', { name: 'Ver perfil de Rede Esperança' })
    expect(contagem('3 entidades encontradas')).toBeTruthy()
    // A pendente não aparece na vitrine.
    expect(screen.queryByText('Casa Nova')).toBeNull()
    await user.type(screen.getByLabelText('Buscar entidade'), 'maos')
    expect(contagem('1 entidade encontrada')).toBeTruthy()
    await user.clear(screen.getByLabelText('Buscar entidade'))
    await user.click(screen.getByRole('link', { name: 'Ver perfil de Rede Esperança' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Rede Esperança' })).toBeTruthy()
    expect(screen.getByText('Sobre Rede Esperança.')).toBeTruthy()
    expect(await screen.findByRole('heading', { level: 2, name: CAMPANHA.titulo })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Apoiar Rede Esperança/ }).getAttribute('href')).toBe(`/doar/entidade/${ENTIDADE_SESSAO_ID}`)
  })

  it('entidade inexistente ou não aprovada informa que não foi encontrada', async () => {
    await abrir('/entidades-publicas/e0000000-0000-4000-8000-000000000009')
    expect(await screen.findByRole('heading', { level: 1, name: 'Entidade não encontrada' })).toBeTruthy()
  })

  it('doadora apoia a entidade diretamente: o POST leva entidadeId e não campanhaId', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir(`/doar/entidade/${ENTIDADE_SESSAO_ID}`)
    expect(await screen.findByText('Entidade aprovada')).toBeTruthy()
    await ateIdentificacaoFinanceira(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar doação' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sua doação foi registrada. Obrigado!' })).toBeTruthy()
    const post = posts(chamadas).find((c) => c.url === '/doacoes')
    expect(JSON.parse(post.data)).toEqual({ entidadeId: ENTIDADE_SESSAO_ID, valor: 50, formaPagamento: 'PIX', anonima: false })
  })
})

describe('Minha conta (GET e PATCH /usuarios/me)', () => {
  it('mostra os dados, salva nome e telefone e atualiza o cabeçalho', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir('/perfil-usuario')
    expect(await screen.findByText('maria@doasync.local')).toBeTruthy()
    expect(screen.getByText('529.982.247-25')).toBeTruthy()
    const nome = screen.getByLabelText(/^Nome/)
    await user.clear(nome)
    await user.type(nome, 'Mariana Souza')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Seus dados foram atualizados.')).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data)).toEqual({ nome: 'Mariana Souza', telefone: '15999990000' })
    expect(screen.getByText('Olá, Mariana')).toBeTruthy()
  })

  it('troca a senha só com a senha atual e mostra o erro do servidor no campo', async () => {
    salvarSessao(DOADORA)
    const chamadas = espionarApi()
    const user = await abrir('/perfil-usuario')
    await screen.findByText('maria@doasync.local')
    await user.type(screen.getByLabelText(/Nova senha/), 'nova-senha-1')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(screen.getByText('Informe a senha atual para trocar a senha.')).toBeTruthy()
    expect(chamadas.some((c) => c.method === 'patch')).toBe(false)
    await user.type(screen.getByLabelText(/Senha atual/), 'errada')
    await user.type(screen.getByLabelText(/Confirme a nova senha/), 'nova-senha-1')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Senha atual incorreta.')).toBeTruthy()
    await user.clear(screen.getByLabelText(/Senha atual/))
    await user.type(screen.getByLabelText(/Senha atual/), SENHA_ATUAL_TESTE)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Seus dados foram atualizados.')).toBeTruthy()
    expect(screen.getByLabelText(/Senha atual/).value).toBe('')
  })

  it('visitante é convidado a entrar', async () => {
    limparSessao()
    await abrir('/perfil-usuario')
    expect(screen.getByRole('heading', { level: 1, name: 'Entre para acessar sua conta' })).toBeTruthy()
  })
})
