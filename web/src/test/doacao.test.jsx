import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import {
  gerarBoleto,
  gerarCodigoPix,
  itensEscolhidos,
  luhn,
  montarDoacao,
  validarAgendamento,
  validarCartao,
  validarItens,
} from '../utils/doacao'

const HOJE = '2026-10-06'

beforeEach(() =>
  vi
    .spyOn(fonte, 'carregarDemo')
    .mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)

describe('regras da doação (#98 a #101)', () => {
  it('valida o número do cartão pelo algoritmo de Luhn', () => {
    expect(luhn('4242 4242 4242 4242')).toBe(true)
    expect(luhn('4242 4242 4242 4241')).toBe(false)
    expect(luhn('123')).toBe(false)
  })
  it('recusa cartão vencido, validade fora do formato e CVV inválido', () => {
    const ok = { nome: 'Ana Silva', numero: '4242424242424242', validade: '12/30', cvv: '123' }
    expect(validarCartao(ok, HOJE)).toEqual({})
    expect(validarCartao({ ...ok, validade: '09/26' }, HOJE).validade).toMatch(/vencido/)
    expect(validarCartao({ ...ok, validade: '13/30' }, HOJE).validade).toMatch(/MM\/AA/)
    expect(validarCartao({ ...ok, cvv: '12' }, HOJE).cvv).toBeTruthy()
    expect(validarCartao({ ...ok, nome: ' ' }, HOJE).nome).toBeTruthy()
  })
  it('aceita o cartão que vence no mês corrente', () => {
    const cartao = { nome: 'Ana Silva', numero: '4242424242424242', validade: '10/26', cvv: '123' }
    expect(validarCartao(cartao, HOJE)).toEqual({})
  })
  it('gera PIX e boleto de demonstração com vencimento em 3 dias', () => {
    expect(gerarCodigoPix(100, 1)).toContain('DEMO')
    expect(gerarBoleto(100, 1, HOJE).vencimento).toBe('2026-10-09')
    expect(gerarBoleto(100, 1, '2026-10-30').vencimento).toBe('2026-11-02')
  })
  it('valida quantidade de itens contra o que a campanha ainda precisa', () => {
    const limites = { 'Cesta básica': 80 }
    expect(validarItens({}, limites)).toMatch(/ao menos um item/)
    expect(validarItens({ 'Cesta básica': '0' }, limites)).toMatch(/ao menos um item/)
    expect(validarItens({ 'Cesta básica': '81' }, limites)).toMatch(/no máximo 80/)
    expect(validarItens({ 'Cesta básica': '1.5' }, limites)).toMatch(/inteiro/)
    expect(validarItens({ 'Cesta básica': '5' }, limites)).toBe('')
    expect(itensEscolhidos({ 'Cesta básica': '5', 'Kit de higiene': '0' })).toEqual([
      { nome: 'Cesta básica', quantidade: 5 },
    ])
  })
  it('valida data, período e endereço do agendamento', () => {
    const ctx = { hoje: HOJE, limite: '2026-11-15' }
    const ok = { modo: 'entrega', data: '2026-10-20', janela: 'Manhã (9h às 12h)', endereco: '' }
    expect(validarAgendamento(ok, ctx)).toEqual({})
    expect(validarAgendamento({ ...ok, data: '' }, ctx).data).toBeTruthy()
    expect(validarAgendamento({ ...ok, data: '2026-10-01' }, ctx).data).toMatch(/a partir de hoje/)
    expect(validarAgendamento({ ...ok, data: '2026-12-01' }, ctx).data).toMatch(/encerramento/)
    expect(validarAgendamento({ ...ok, janela: '' }, ctx).janela).toBeTruthy()
    expect(validarAgendamento({ ...ok, modo: 'retirada' }, ctx).endereco).toBeTruthy()
    expect(validarAgendamento({ ...ok, modo: 'retirada', endereco: 'Rua A, 100' }, ctx)).toEqual({})
  })
  it('monta o registro sem dados de cartão e sem tratar pendência como receita', () => {
    const campanha = { id: 1, nome: 'Mesa', entidadeId: 1 }
    const fin = montarDoacao({ id: 'x', campanha, doador: 'Ana', tipo: 'Financeira', valor: 50, metodo: 'Cartão', itens: [], agendamento: null, hoje: HOJE })
    expect(fin).toMatchObject({ valor: 50, pagamento: 'Pendente', status: 'Pendente', metodo: 'Cartão', itens: [] })
    expect(JSON.stringify(fin)).not.toMatch(/4242|cvv/i)
    const itens = montarDoacao({ id: 'y', campanha, doador: 'Ana', tipo: 'Itens', valor: null, metodo: 'PIX', itens: [{ nome: 'Cesta básica', quantidade: 5 }], agendamento: { modo: 'entrega' }, hoje: HOJE })
    expect(itens).toMatchObject({ valor: 0, quantidade: 5, pagamento: 'Não se aplica', metodo: null, detalhe: '5 Cesta básica' })
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

// Avança de "Tipo de doação" até a identificação anônima.
async function ate_identificacao(user, { itens = false, metodo } = {}) {
  if (itens) {
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    await user.click(screen.getByRole('button', { name: /Continuar com doação de itens/ }))
    await user.type(screen.getByLabelText('Quantidade de Cesta básica'), '5')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
  } else {
    await user.click(screen.getByRole('button', { name: /Continuar com doação financeira/ }))
    if (metodo) await user.click(screen.getByRole('radio', { name: new RegExp(metodo) }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
  }
  await user.click(screen.getByLabelText('Doação anônima'))
  await user.click(screen.getByRole('button', { name: /Continuar para o/ }))
}

describe('pagamento via PIX (#98)', () => {
  it('mostra o código de demonstração e registra a doação como pendente', async () => {
    const user = await abrir('/doar/1')
    await ate_identificacao(user)
    expect(screen.getByRole('heading', { name: 'Pague com PIX', level: 1 })).toBeTruthy()
    expect(screen.getByLabelText(/Código PIX/).value).toContain('DEMO')
    await user.click(screen.getByRole('button', { name: /Já fiz o pagamento/ }))
    expect(await screen.findByRole('heading', { name: 'Doação registrada na demonstração', level: 1 })).toBeTruthy()
    expect(screen.getByText('Aguardando confirmação do pagamento')).toBeTruthy()
  })
})

describe('pagamento com cartão ou boleto (#99)', () => {
  it('cartão: valida os campos antes de concluir', async () => {
    const user = await abrir('/doar/1')
    await ate_identificacao(user, { metodo: 'Cartão' })
    expect(screen.getByRole('heading', { name: 'Pague com cartão', level: 1 })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByText('Número de cartão inválido.')).toBeTruthy()
    await user.type(screen.getByLabelText(/Nome no cartão/), 'Ana Silva')
    await user.type(screen.getByLabelText(/Número do cartão/), '4242424242424242')
    await user.type(screen.getByLabelText(/Validade/), '12/30')
    await user.type(screen.getByLabelText(/CVV/), '123')
    await user.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(await screen.findByRole('heading', { name: 'Doação registrada na demonstração', level: 1 })).toBeTruthy()
    expect(screen.queryByText(/4242/)).toBe(null)
  })
  it('boleto: mostra vencimento em 3 dias e conclui', async () => {
    const user = await abrir('/doar/1')
    await ate_identificacao(user, { metodo: 'Boleto' })
    expect(screen.getByRole('heading', { name: 'Pague com boleto', level: 1 })).toBeTruthy()
    expect(screen.getByText('09/10/2026')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Concluir doação/ }))
    expect(await screen.findByRole('heading', { name: 'Doação registrada na demonstração', level: 1 })).toBeTruthy()
  })
})

describe('doação de itens e agendamento (#100, #101)', () => {
  it('recusa quantidade acima da necessidade da campanha', async () => {
    const user = await abrir('/doar/1')
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    await user.click(screen.getByRole('button', { name: /Continuar com doação de itens/ }))
    await user.type(screen.getByLabelText('Quantidade de Cesta básica'), '999')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('no máximo 80')
  })
  it('exige ao menos um item', async () => {
    const user = await abrir('/doar/1')
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    await user.click(screen.getByRole('button', { name: /Continuar com doação de itens/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('ao menos um item')
  })
  it('agenda a entrega e registra a doação de itens', async () => {
    const user = await abrir('/doar/1')
    await ate_identificacao(user, { itens: true })
    expect(screen.getByRole('heading', { name: 'Agende a entrega ou a retirada', level: 1 })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(screen.getByText('Escolha uma data.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Data/), { target: { value: '2026-10-20' } })
    await user.selectOptions(screen.getByLabelText(/Período/), 'Manhã (9h às 12h)')
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(await screen.findByRole('heading', { name: 'Doação registrada na demonstração', level: 1 })).toBeTruthy()
    expect(screen.getByText('Aguardando recebimento dos itens')).toBeTruthy()
    expect(screen.getByText('5 Cesta básica')).toBeTruthy()
  })
  it('retirada exige o endereço', async () => {
    const user = await abrir('/doar/1')
    await ate_identificacao(user, { itens: true })
    await user.click(screen.getByRole('radio', { name: /Quero que retirem comigo/ }))
    fireEvent.change(screen.getByLabelText(/Data/), { target: { value: '2026-10-20' } })
    await user.selectOptions(screen.getByLabelText(/Período/), 'Tarde (13h às 17h)')
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(screen.getByText('Informe o endereço para a retirada.')).toBeTruthy()
  })
})
