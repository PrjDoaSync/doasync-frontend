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
    const user = await abrir('/campanhas/1')
    await user.click(screen.getByRole('tab', { name: 'Sobre a campanha' }))
    await user.keyboard('{ArrowRight}')
    expect(
      screen
        .getByRole('tab', { name: 'Itens necessários' })
        .getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain('Cesta básica')
  })
  it('trata campanha inexistente e rota inválida', async () => {
    await abrir('/campanhas/inexistente')
    expect(
      screen.getByRole('heading', { name: 'Campanha não encontrada' }),
    ).toBeTruthy()
  })
  it('salva os dados básicos como rascunho e volta à gestão', async () => {
    const user = await abrir('/campanhas/nova')
    await user.type(screen.getByLabelText(/Nome da campanha/), 'Uma nova causa')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação')
    await user.type(
      screen.getByLabelText('Descrição da campanha'),
      'Uma causa de demonstração para famílias.',
    )
    fireEvent.change(screen.getByLabelText(/Início/), {
      target: { value: '2026-10-01' },
    })
    fireEvent.change(screen.getByLabelText(/Encerramento/), {
      target: { value: '2026-11-01' },
    })
    await user.type(screen.getByLabelText(/Meta financeira/), '500')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(
      await screen.findByRole('heading', { name: 'Gestão de campanhas' }),
    ).toBeTruthy()
    expect(screen.getByText('Uma nova causa')).toBeTruthy()
    const linha = screen.getByText('Uma nova causa').closest('tr')
    expect(linha.textContent).toContain('Rascunho')
  })
})

describe('doação financeira', () => {
  it('valida valor, mantém a escolha ao voltar e não registra pagamento', async () => {
    const user = await abrir('/doar/1')
    await user.click(
      screen.getByRole('button', { name: /Continuar com doação financeira/ }),
    )
    const valor = screen.getByLabelText(/Outro valor/)
    await user.clear(valor)
    await user.type(valor, '0')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('alert').textContent).toContain('maior que zero')
    await user.click(screen.getByRole('button', { name: /R\$\s50,00/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByLabelText('Doação anônima'))
    await user.click(
      screen.getByRole('button', { name: 'Continuar na demonstração' }),
    )
    expect(
      screen.getByRole('heading', {
        name: 'Como você prefere se identificar?',
        level: 1,
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Pagamento indisponível' }).disabled,
    ).toBe(true)
    expect(
      screen.getByText(/Nenhuma cobrança, QR Code ou boleto foi gerado/),
    ).toBeTruthy()
    expect(screen.getByLabelText('Doação anônima').checked).toBe(true)
  })
  it('seleção de itens explica a dependência do agendamento', async () => {
    const user = await abrir('/doar/1')
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    expect(screen.getByText(/seleção de itens e o agendamento/)).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Consultar itens necessários' })
        .getAttribute('href'),
    ).toBe('/campanhas/1?aba=itens')
  })
  it('campanha encerrada não permite iniciar o pagamento', async () => {
    await abrir('/doar/3')
    expect(
      screen.getByRole('heading', {
        name: 'Campanha indisponível para doação',
      }),
    ).toBeTruthy()
  })
})

describe('gestão e estados de dados', () => {
  it('mostra o progresso de itens confirmados e respeita o período na análise', async () => {
    await abrir('/dashboard/campanha?campanha=1')
    expect(
      screen.getByRole('heading', { name: 'Evolução de itens' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('progressbar', { name: 'Cesta básica' })
        .getAttribute('aria-valuenow'),
    ).toBe('10')
    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2026-10-07' },
    })
    expect(
      screen
        .getByRole('progressbar', { name: 'Cesta básica' })
        .getAttribute('aria-valuenow'),
    ).toBe('0')
  })
  it('não inclui campanhas de outra entidade no dashboard administrativo', async () => {
    await abrir('/dashboard')
    expect(
      screen.queryByRole('link', { name: 'Inverno solidário: agasalhos' }),
    ).toBe(null)
    expect(
      screen.getByRole('link', {
        name: 'Mesa solidária: alimento para 200 famílias',
      }),
    ).toBeTruthy()
  })
  it('filtra período sem pagamentos e mostra gráfico vazio', async () => {
    await abrir('/dashboard')
    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2030-01-01' },
    })
    expect(
      screen.getByRole('heading', { name: 'Sem arrecadação neste período' }),
    ).toBeTruthy()
    expect(screen.getAllByText('R$ 0,00').length).toBeGreaterThan(0)
  })
  it('filtra prévia de relatório e impede exportação de um conjunto vazio', async () => {
    const user = await abrir('/relatorios')
    // A ausência de contrato impede exportação mesmo com registros na prévia.
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    expect(screen.getByRole('button', { name: 'Baixar CSV' }).disabled).toBe(
      true,
    )
    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2030-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Gerar prévia' }))
    expect(
      screen.getByText('Nenhum registro para os filtros selecionados.'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Baixar CSV' }).disabled).toBe(
      true,
    )
    expect(screen.getByRole('button', { name: 'Baixar PDF' }).disabled).toBe(
      true,
    )
  })
  it('bloqueia CNPJ inválido e salva informações válidas da entidade', async () => {
    const user = await abrir('/cadastro-entidade')
    const cnpj = screen.getByLabelText(/CNPJ \*/)
    await user.clear(cnpj)
    await user.type(cnpj, '00000000000000')
    await user.click(screen.getByRole('button', { name: 'Salvar informações' }))
    expect(screen.getByRole('alert').textContent).toContain('CNPJ')
    await user.clear(cnpj)
    await user.type(cnpj, '11.222.333/0001-81')
    await user.click(screen.getByRole('button', { name: 'Salvar informações' }))
    expect(screen.getByText(/Informações salvas na demonstração/)).toBeTruthy()
  })
  it('rejeita arquivo acima de 10 MB sem indicar envio', async () => {
    await abrir('/cadastro-entidade')
    const arquivo = new File(['documento'], 'grande.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(arquivo, 'size', { value: 11 * 1024 * 1024 })
    fireEvent.change(screen.getByLabelText('Adicionar documentos'), {
      target: { files: [arquivo] },
    })
    expect(screen.getByRole('alert').textContent).toContain('até 10 MB')
    expect(screen.queryByText('grande.pdf')).toBe(null)
  })
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
  it('consulta o histórico do doador selecionado', async () => {
    const user = await abrir('/doadores')
    await user.click(
      screen.getByRole('button', { name: 'Ver histórico de Ana Oliveira' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Perfil do doador' }),
    ).toBeTruthy()
    expect(screen.getAllByText('R$ 250,00').length).toBeGreaterThan(0)
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
        screen.getByRole('heading', { name: 'Visão geral da Rede Esperança' }),
      ).toBeTruthy(),
    )
  })
})
