import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import { campanhasApi } from './fixtures/apiCampanhas'

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

describe('campanhas públicas e navegação', () => {
  it('filtra por entidade; a vitrine pública da API não traz campanhas encerradas', async () => {
    const user = await abrir('/explorar')
    await user.selectOptions(screen.getByLabelText('Entidade'), 'Rede Esperança')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    await user.selectOptions(screen.getByLabelText('Status da campanha'), 'Encerrada')
    expect(screen.getByRole('heading', { name: 'Nenhum resultado encontrado' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })
  it('leva a busca da home para a listagem sem perder o filtro', async () => {
    const user = await abrir('/')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar uma campanha ou entidade' }), 'kits escolares')
    await user.click(screen.getByRole('button', { name: 'Explorar campanhas' }))
    expect(screen.getByRole('searchbox', { name: 'Buscar campanha' }).value).toBe('kits escolares')
    expect(screen.getAllByRole('article')).toHaveLength(1)
  })
  it('o detalhe não oferece doação de itens, que a API não suporta', async () => {
    await abrir(`/campanhas/${campanhasApi[0].id}`)
    expect(screen.getByRole('link', { name: /Quero doar/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Doar itens necessários' })).toBeNull()
  })
  it('busca, apresenta estado vazio e limpa os filtros', async () => {
    const user = await abrir('/explorar')
    expect(screen.getAllByRole('article')).toHaveLength(4)
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar campanha' }),
      'inexistente',
    )
    expect(
      screen.getByRole('heading', { name: 'Nenhum resultado encontrado' }),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })
  it('combina categoria e localização e não publica rascunhos', async () => {
    const user = await abrir('/explorar')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Educação')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.queryByText('Reforma do abrigo')).toBe(null)
  })
  it('abre o detalhe e navega entre as informações por teclado', async () => {
    const user = await abrir(`/campanhas/${campanhasApi[0].id}`)
    await user.click(screen.getByRole('tab', { name: 'Sobre a campanha' }))
    await user.keyboard('{ArrowRight}')
    expect(
      screen
        .getByRole('tab', { name: 'Itens necessários' })
        .getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain('ainda não informou as necessidades')
  })
  it('trata campanha inexistente e rota inválida', async () => {
    await abrir('/campanhas/inexistente')
    expect(
      screen.getByRole('heading', { name: 'Campanha não encontrada' }),
    ).toBeTruthy()
  })
})

describe('gestão e estados de dados', () => {
  it('bloqueia saída acima do saldo e atualiza quantidade válida', async () => {
    const user = await abrir('/itens')
    await user.click(
      screen.getByRole('button', { name: 'Registrar movimentação' }),
    )
    const dialog = screen.getByRole('dialog'),
      quantidade = within(dialog).getByLabelText(/Quantidade/)
    await user.type(quantidade, '9999')
    await user.type(
      within(dialog).getByLabelText(/Destino/),
      'Famílias atendidas',
    )
    fireEvent.change(within(dialog).getByLabelText(/Data/), {
      target: { value: '2026-10-29' },
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar na demonstração' }),
    )
    expect(screen.getByRole('alert').textContent).toContain('excede o saldo')
    await user.clear(quantidade)
    await user.type(quantidade, '2')
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar na demonstração' }),
    )
    expect(screen.queryByRole('dialog')).toBe(null)
    const tabela = screen.getAllByRole('table')[0]
    expect(within(tabela).getByText('118 unidades')).toBeTruthy()
  })
  it('edita o acesso local sem simular um convite enviado', async () => {
    const user = await abrir('/configuracoes/usuarios')
    await user.click(
      screen.getByRole('button', { name: 'Editar acesso de Paulo Souza' }),
    )
    const dialog = screen.getByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'Inativo')
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar na demonstração' }),
    )
    const linha = screen.getByText('Paulo Souza').closest('tr')
    expect(linha.textContent).toContain('Inativo')
    expect(screen.getByText(/Nenhum convite foi enviado/)).toBeTruthy()
  })
  it('mostra erro de carregamento e permite tentar novamente', async () => {
    vi.mocked(fonte.carregarDemo).mockRejectedValueOnce(
      new Error('Falha temporária'),
    )
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    )
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Falha temporária',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Visão geral da entidade' }),
      ).toBeTruthy(),
    )
  })
})
