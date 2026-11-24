// TEST-DOA-01 (#81): testes unitários do frontend de Doações.
// Complementa doacao.test.jsx (fluxo PIX integrado à API): valorDoacao e a
// gestão de doações recebidas (ainda em demonstração, Fase 4).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { valorDoacao } from '../utils/gestao'

beforeEach(() =>
  vi
    .spyOn(fonte, 'carregarDemo')
    .mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
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
const kpi = (rotulo) => screen.getByText(rotulo).closest('.kpi')
const linhasDaTabela = () => screen.getAllByRole('row').slice(1)

describe('valorDoacao', () => {
  it('aceita valores positivos com até duas casas, com vírgula ou ponto', () => {
    expect(valorDoacao('50')).toBe(50)
    expect(valorDoacao('50,5')).toBe(50.5)
    expect(valorDoacao('12.34')).toBe(12.34)
    expect(valorDoacao(' R$ 25 ')).toBe(25)
    expect(valorDoacao(100)).toBe(100)
  })
  it('recusa zero, negativos, texto e mais de duas casas decimais', () => {
    for (const invalido of ['0', '0,00', '-5', 'abc', '', '12,345', '1,2,3', '1e3'])
      expect(valorDoacao(invalido)).toBe(null)
  })
})

describe('gestão de doações recebidas (DEV-DOA)', () => {
  const dados = fonte.criarDadosDemo()
  const minhas = dados.doacoes.filter((d) => d.entidadeId === dados.entidade.id)
  const contar = (campo, valor) => minhas.filter((d) => d[campo] === valor).length

  it('resume as doações por situação e lista todas as da entidade', async () => {
    await abrir('/doacoes')
    expect(kpi('Doações confirmadas').textContent).toContain(String(contar('status', 'Confirmada')))
    expect(kpi('Aguardando confirmação').textContent).toContain(String(contar('status', 'Pendente')))
    expect(kpi('Canceladas').textContent).toContain(String(contar('status', 'Cancelada')))
    expect(linhasDaTabela()).toHaveLength(minhas.length)
  })
  it('filtra por tipo, status e texto', async () => {
    const user = await abrir('/doacoes')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os tipos' }), 'Itens')
    expect(linhasDaTabela()).toHaveLength(contar('tipo', 'Itens'))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os tipos' }), '')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), 'Cancelada')
    expect(linhasDaTabela()).toHaveLength(1)
    expect(within(linhasDaTabela()[0]).getByText('Studio ambiente')).toBeTruthy()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), '')
    await user.type(screen.getByRole('searchbox', { name: /Buscar doador/ }), 'MERCADO')
    expect(linhasDaTabela()).toHaveLength(1)
    expect(screen.getByText('Mercado São José')).toBeTruthy()
  })
  it('sem resultados, mostra mensagem em vez de tabela vazia', async () => {
    const user = await abrir('/doacoes')
    await user.type(screen.getByRole('searchbox', { name: /Buscar doador/ }), 'inexistente')
    expect(screen.getByText('Nenhum registro encontrado.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBe(null)
  })
  it('confirma o recebimento de itens pendentes e avisa que é só demonstração', async () => {
    const user = await abrir('/doacoes')
    await user.click(screen.getByRole('button', { name: 'Ver doação 1 de Mariana Lima' }))
    const dialog = document.querySelector('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Detalhes da doação' })).toBeTruthy()
    expect(within(dialog).getByText('2 cestas + 3 kits')).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar recebimento na demonstração' }))
    expect(document.querySelector('dialog')).toBe(null)
    expect(
      screen.getByText('Recebimento confirmado na demonstração. Nenhuma doação real foi alterada.'),
    ).toBeTruthy()
    expect(kpi('Aguardando confirmação').textContent).toContain(String(contar('status', 'Pendente') - 1))
    expect(kpi('Doações confirmadas').textContent).toContain(String(contar('status', 'Confirmada') + 1))
    expect(screen.getByText('Mariana Lima').closest('tr').textContent).not.toContain('Pendente')
  })
  it('doação financeira pendente depende do provedor e não pode ser confirmada aqui', async () => {
    const user = await abrir('/doacoes')
    await user.click(screen.getByRole('button', { name: 'Ver doação 2 de Studio ambiente' }))
    const dialog = document.querySelector('dialog')
    expect(
      within(dialog).getByText('O status financeiro será recebido do provedor de pagamento após integração.'),
    ).toBeTruthy()
    expect(within(dialog).queryByRole('button', { name: /Confirmar recebimento/ })).toBe(null)
  })
  it('itens já confirmados informam que o recebimento foi processado; o modal fecha pelo botão', async () => {
    const user = await abrir('/doacoes')
    await user.click(screen.getByRole('button', { name: 'Ver doação 5 de Mercado São José' }))
    expect(within(document.querySelector('dialog')).getByText('Recebimento já processado nesta amostra.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(document.querySelector('dialog')).toBe(null)
  })
})
