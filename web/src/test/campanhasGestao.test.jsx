// TEST-CAM-01 (#80): testes unitários do frontend de Campanhas.
// Complementa campanhas.test.jsx, criarCampanha.test.jsx e prestacao.test.jsx:
// lista/filtros da gestão, card público, edição (erros e salvamento) e
// acompanhamento (indicadores, filtro, publicação de atualização).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import CampanhaCard, { Progresso } from '../components/CampanhaCard'
import * as fonte from '../mocks/gestao'
import { diasRestantes } from '../utils/campanhas'
import { formatarMoeda } from '../utils/format'

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

describe('diasRestantes', () => {
  it('conta os dias até o término a partir do relógio de demonstração', () => {
    expect(diasRestantes('2026-11-15')).toBe(40)
    expect(diasRestantes('2026-10-16', '2026-10-06')).toBe(10)
    expect(diasRestantes('2026-10-06', '2026-10-06')).toBe(0)
  })
  it('nunca devolve valor negativo para campanhas já encerradas', () => {
    expect(diasRestantes('2026-08-31')).toBe(0)
  })
})

describe('Progresso e CampanhaCard', () => {
  it('Progresso expõe a barra com valores acessíveis e limita a 100%', () => {
    const { rerender } = render(<Progresso atual={50} meta={200} />)
    const barra = screen.getByRole('progressbar', { name: 'Meta arrecadada' })
    expect(barra.getAttribute('aria-valuenow')).toBe('25')
    expect(barra.getAttribute('aria-valuemin')).toBe('0')
    expect(barra.getAttribute('aria-valuemax')).toBe('100')
    expect(screen.getByText('25%')).toBeTruthy()
    expect(screen.getByText(/Meta de R\$\s200,00/)).toBeTruthy()
    rerender(<Progresso atual={300} meta={200} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    rerender(<Progresso atual={10} meta={0} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })
  it('CampanhaCard mostra os dados e leva todos os links ao detalhe', () => {
    const campanha = {
      id: 9,
      nome: 'Natal solidário',
      entidade: 'Casa Acolher',
      cidade: 'Sorocaba, SP',
      categoria: 'Alimentação',
      imagem: '/images/cestas.jpg',
      arrecadado: 50,
      meta: 200,
    }
    const { container } = render(
      <MemoryRouter>
        <CampanhaCard campanha={campanha} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('article')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Natal solidário' })).toBeTruthy()
    expect(screen.getByText('Casa Acolher · Sorocaba, SP')).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links.every((l) => l.getAttribute('href') === '/campanhas/9')).toBe(true)
    expect(screen.getByRole('link', { name: /Conhecer campanha/ })).toBeTruthy()
    const imagem = container.querySelector('img')
    expect(imagem.getAttribute('alt')).toBe('')
    expect(imagem.getAttribute('loading')).toBe('lazy')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25')
  })
})

describe('Editar campanha (DEV-CAM-08)', () => {
  it('aponta os campos obrigatórios vazios e os marca como inválidos', async () => {
    const user = await abrir('/campanhas/1/editar')
    await user.clear(screen.getByLabelText(/Título da campanha/))
    await user.clear(screen.getByLabelText(/Descrição/))
    fireEvent.change(screen.getByLabelText(/Data de término/), { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(screen.getByText('Título não pode ser vazio.')).toBeTruthy()
    expect(screen.getByText('Descrição não pode ser vazia.')).toBeTruthy()
    expect(screen.getByText('Data de término é obrigatória.')).toBeTruthy()
    expect(screen.getByLabelText(/Título da campanha/).getAttribute('aria-invalid')).toBe('true')
    expect(screen.queryByText(/Campanha atualizada/)).toBe(null)
  })
  it('recusa meta de item menor que a quantidade já recebida', async () => {
    const user = await abrir('/campanhas/1/editar')
    const meta = screen.getByLabelText('Meta de Cesta básica')
    await user.clear(meta)
    await user.type(meta, '50')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect((await screen.findByRole('alert')).textContent).toBe(
      'A meta de Cesta básica não pode ser menor que o recebido (120).',
    )
    expect(meta.getAttribute('aria-invalid')).toBe('true')
  })
  it('bloqueia o formulário durante o salvamento e reflete a alteração depois', async () => {
    const user = await abrir('/campanhas/1/editar')
    const titulo = screen.getByLabelText(/Título da campanha/)
    await user.clear(titulo)
    await user.type(titulo, 'Mesa solidária ampliada')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    const salvando = screen.getByRole('button', { name: 'Salvando…' })
    expect(salvando.disabled).toBe(true)
    expect(titulo.disabled).toBe(true)
    expect(
      (await screen.findByText('Campanha atualizada nesta sessão de demonstração.')).closest('[role]')
        .getAttribute('role'),
    ).toBe('status')
    expect(screen.getByRole('button', { name: /Salvar alterações/ }).disabled).toBe(false)
    expect(titulo.disabled).toBe(false)
    expect(screen.getByRole('heading', { level: 2, name: 'Mesa solidária ampliada' })).toBeTruthy()
  })
  it('campanha encerrada: explica o motivo e mantém os campos desabilitados', async () => {
    await abrir('/campanhas/3/editar')
    expect(
      screen.getByText('Somente campanhas ativas podem ser editadas. Status atual: Encerrada.'),
    ).toBeTruthy()
    expect(screen.getByLabelText(/Título da campanha/).disabled).toBe(true)
    expect(screen.getByRole('button', { name: /Salvar alterações/ }).disabled).toBe(true)
    expect(screen.queryByText(/dias restantes/)).toBe(null)
  })
  it('campanha inexistente oferece caminho de volta; cancelar volta para a lista', async () => {
    await abrir('/campanhas/999/editar')
    expect(screen.getByRole('heading', { level: 1, name: 'Campanha não encontrada' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Voltar para campanhas' }).getAttribute('href'),
    ).toBe('/campanhas')
  })
  it('mostra o link de cancelar e o resumo lateral da campanha', async () => {
    await abrir('/campanhas/1/editar')
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/campanhas')
    expect(screen.getByText('40 dias restantes')).toBeTruthy()
    expect(screen.getByText('260 de 480 itens recebidos')).toBeTruthy()
  })
})

describe('Acompanhamento da campanha (DEV-CAM-09)', () => {
  it('apresenta prazo, indicadores financeiros, de itens e de famílias', async () => {
    await abrir('/campanhas/1/acompanhamento')
    expect(screen.getByText('40 dias restantes')).toBeTruthy()
    const financeiro = kpi('Arrecadação financeira')
    expect(financeiro.textContent).toContain(formatarMoeda(18400))
    expect(financeiro.textContent).toMatch(/61% da meta de R\$\s30\.000,00 · 86 doações/)
    expect(kpi('Itens recebidos').textContent).toContain('260 de 480')
    expect(kpi('Famílias beneficiadas').textContent).toContain('40 de 200')
    expect(screen.getByRole('link', { name: /Editar/ }).getAttribute('href')).toBe(
      '/campanhas/1/editar',
    )
  })
  it('filtra as doações por modalidade e informa o total exibido', async () => {
    const user = await abrir('/campanhas/1/acompanhamento')
    expect(linhasDaTabela()).toHaveLength(5)
    const modalidade = screen.getByRole('combobox', { name: 'Modalidade' })
    await user.selectOptions(modalidade, 'Itens')
    expect(linhasDaTabela()).toHaveLength(2)
    expect(screen.getByText('2 de 128 doações · Página 1')).toBeTruthy()
    await user.selectOptions(modalidade, 'Cartão')
    expect(linhasDaTabela()).toHaveLength(1)
    expect(screen.getByText('Doador anônimo')).toBeTruthy()
    await user.selectOptions(modalidade, '')
    expect(linhasDaTabela()).toHaveLength(5)
  })
  it('mantém desabilitadas as ações sem contrato de API (exportar, período e paginação)', async () => {
    await abrir('/campanhas/1/acompanhamento')
    expect(screen.getByRole('button', { name: /Exportar/ }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: /Próxima/ }).disabled).toBe(true)
    expect(screen.getByRole('combobox', { name: 'Período' }).disabled).toBe(true)
  })
  it('exige mensagem antes de publicar e acrescenta a atualização à timeline', async () => {
    const user = await abrir('/campanhas/1/acompanhamento')
    await user.click(screen.getByRole('button', { name: /Publicar atualização/ }))
    expect(screen.getByText('Escreva a mensagem antes de publicar.')).toBeTruthy()
    expect(screen.getByLabelText(/Mensagem aos doadores/).getAttribute('aria-invalid')).toBe('true')
    const antes = document.querySelectorAll('.camp-tl li').length
    await user.type(
      screen.getByLabelText(/Mensagem aos doadores/),
      'Entrega concluída. Obrigado a todos!',
    )
    await user.click(screen.getByRole('button', { name: /Publicar atualização/ }))
    expect(screen.getByText('Atualização publicada nesta sessão de demonstração.')).toBeTruthy()
    expect(screen.getByLabelText(/Mensagem aos doadores/).value).toBe('')
    expect(document.querySelectorAll('.camp-tl li')).toHaveLength(antes + 1)
    expect(document.querySelector('.camp-tl li strong').textContent).toBe('Entrega concluída')
  })
  it('campanha sem detalhamento mostra os estados vazios em vez de tabelas e listas', async () => {
    await abrir('/campanhas/2/acompanhamento')
    expect(screen.getByText('Nenhuma doação confirmada ainda.')).toBeTruthy()
    expect(screen.getByText('Nenhuma atualização publicada ainda.')).toBeTruthy()
    expect(kpi('Doações confirmadas').textContent).toContain('0')
    expect(kpi('Itens recebidos').textContent).toContain('80 de 480')
    expect(screen.queryByRole('heading', { name: 'Progresso dos itens' })).toBe(null)
  })
  it('campanha encerrada não oferece edição nem contagem regressiva', async () => {
    await abrir('/campanhas/3/acompanhamento')
    expect(screen.queryByRole('link', { name: /Editar/ })).toBe(null)
    expect(screen.queryByText(/dias restantes/)).toBe(null)
    expect(screen.getByRole('link', { name: /Ver campanha/ }).getAttribute('href')).toBe(
      '/campanhas/3',
    )
  })
})
