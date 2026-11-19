// TEST-DOA-01 (#81): testes unitários do frontend de Doações.
// Complementa doacao.test.jsx (regras e fluxos de pagamento/agendamento):
// valorDoacao, componentes isolados (itens, PIX, agendamento), identificação
// do doador e a gestão de doações recebidas.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import Agendamento from '../components/doacao/Agendamento'
import PagamentoPix from '../components/doacao/PagamentoPix'
import SelecaoItens from '../components/doacao/SelecaoItens'
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

describe('SelecaoItens (DOA-06)', () => {
  const itens = [
    { nome: 'Cesta básica', especificacao: 'Alimentos não perecíveis', meta: 10, recebido: 4 },
    { nome: 'Leite em pó', especificacao: '', meta: 5, recebido: 5 },
  ]
  function montar(props = {}) {
    const acoes = { onChange: vi.fn(), onVoltar: vi.fn(), onContinuar: vi.fn() }
    render(
      <MemoryRouter>
        <SelecaoItens itens={itens} selecao={{}} campanhaId={3} erro="" {...acoes} {...props} />
      </MemoryRouter>,
    )
    return acoes
  }
  it('mostra o quanto falta de cada item e limita a quantidade ao restante', () => {
    montar()
    expect(screen.getByText('Ainda faltam 6 de 10 unidades')).toBeTruthy()
    expect(screen.getByLabelText('Quantidade de Cesta básica').getAttribute('max')).toBe('6')
    expect(screen.getByText('Alimentos não perecíveis')).toBeTruthy()
  })
  it('desabilita o item cuja meta já foi atingida', () => {
    montar()
    expect(screen.getByText('Meta deste item atingida')).toBeTruthy()
    expect(screen.getByLabelText('Quantidade de Leite em pó').disabled).toBe(true)
    expect(screen.getByLabelText('Quantidade de Cesta básica').disabled).toBe(false)
  })
  it('propaga a quantidade digitada e as ações de voltar e continuar', async () => {
    const { onChange, onVoltar, onContinuar } = montar({ selecao: { 'Cesta básica': '3' } })
    const campo = screen.getByLabelText('Quantidade de Cesta básica')
    expect(campo.value).toBe('3')
    fireEvent.change(campo, { target: { value: '4' } })
    expect(onChange).toHaveBeenCalledWith('Cesta básica', '4')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(onVoltar).toHaveBeenCalledTimes(1)
    expect(onContinuar).toHaveBeenCalledTimes(1)
  })
  it('anuncia a mensagem de erro como alerta', () => {
    montar({ erro: 'Escolha ao menos um item.' })
    expect(screen.getByRole('alert').textContent).toContain('Escolha ao menos um item.')
  })
  it('sem itens na campanha, mostra o estado vazio com saída para a campanha', () => {
    montar({ itens: [] })
    expect(screen.getByRole('heading', { name: 'Esta campanha ainda não lista itens' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver a campanha' }).getAttribute('href')).toBe('/campanhas/3')
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBe(null)
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeTruthy()
  })
})

describe('PagamentoPix (DOA-04)', () => {
  const campanha = { id: 1 }
  const montar = (props = {}) =>
    render(
      <PagamentoPix
        valor={100}
        campanha={campanha}
        enviando={false}
        erro=""
        onVoltar={() => {}}
        onConcluir={() => {}}
        {...props}
      />,
    )
  afterEach(() => {
    delete navigator.clipboard
  })

  it('bloqueia os botões e informa o andamento enquanto registra (evita duplo envio)', () => {
    montar({ enviando: true })
    const concluir = screen.getByRole('button', { name: 'Registrando…' })
    expect(concluir.disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Voltar' }).disabled).toBe(true)
  })
  it('conclui informando o método PIX', async () => {
    const onConcluir = vi.fn()
    montar({ onConcluir })
    await userEvent.setup().click(screen.getByRole('button', { name: /Já fiz o pagamento/ }))
    expect(onConcluir).toHaveBeenCalledWith({ metodo: 'PIX' })
  })
  it('mostra o erro de registro como alerta, sem esconder os botões', () => {
    montar({ erro: 'Não foi possível registrar a doação. Tente novamente.' })
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível registrar a doação')
    expect(screen.getByRole('button', { name: /Já fiz o pagamento/ }).disabled).toBe(false)
  })
  it('copia o código e avisa quando a cópia funciona ou falha', async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }))
    expect(await screen.findByText('Código copiado.')).toBeTruthy()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('DEMO'))
    writeText.mockRejectedValueOnce(new Error('negado'))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }))
    expect(await screen.findByText(/Não foi possível copiar/)).toBeTruthy()
  })
})

describe('Agendamento (DOA-07)', () => {
  const campanha = { entidade: 'Rede Esperança', cidade: 'São Paulo, SP', encerraEm: '2026-11-15' }
  const inicial = { modo: 'entrega', data: '', janela: '', endereco: '' }
  const montar = (props = {}) => {
    const onConcluir = vi.fn()
    render(
      <Agendamento
        campanha={campanha}
        hoje="2026-10-06"
        valorInicial={inicial}
        enviando={false}
        erro=""
        onVoltar={() => {}}
        onConcluir={onConcluir}
        {...props}
      />,
    )
    return onConcluir
  }

  it('não conclui sem data e período, e mostra os dois erros', async () => {
    const onConcluir = montar()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(onConcluir).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toEqual(
      expect.arrayContaining(['Escolha uma data.']),
    )
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })
  it('limita a data entre hoje e o encerramento da campanha', () => {
    montar()
    const data = screen.getByLabelText(/Data/)
    expect(data.getAttribute('min')).toBe('2026-10-06')
    expect(data.getAttribute('max')).toBe('2026-11-15')
  })
  it('na entrega, não pede endereço e envia endereço vazio', async () => {
    const onConcluir = montar()
    const user = userEvent.setup()
    expect(screen.queryByLabelText(/Endereço para retirada/)).toBe(null)
    fireEvent.change(screen.getByLabelText(/Data/), { target: { value: '2026-10-20' } })
    await user.selectOptions(screen.getByLabelText(/Período/), 'Manhã (9h às 12h)')
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(onConcluir).toHaveBeenCalledWith({
      modo: 'entrega',
      data: '2026-10-20',
      janela: 'Manhã (9h às 12h)',
      endereco: '',
    })
  })
  it('na retirada, exige o endereço e remove espaços nas pontas', async () => {
    const onConcluir = montar({ valorInicial: { ...inicial, modo: 'retirada', data: '2026-10-20', janela: 'Tarde (13h às 17h)' } })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(screen.getByText('Informe o endereço para a retirada.')).toBeTruthy()
    expect(onConcluir).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText(/Endereço para retirada/), '  Rua A, 100  ')
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(onConcluir).toHaveBeenCalledWith(expect.objectContaining({ modo: 'retirada', endereco: 'Rua A, 100' }))
  })
  it('desabilita os botões e mostra o andamento enquanto envia', () => {
    montar({ enviando: true })
    expect(screen.getByRole('button', { name: 'Registrando…' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Voltar' }).disabled).toBe(true)
  })
  it('exibe o erro de registro e informa o ponto de entrega da entidade', () => {
    montar({ erro: 'Falha ao registrar.' })
    expect(screen.getByText('Falha ao registrar.')).toBeTruthy()
    expect(screen.getByText(/Ponto de entrega: sede da Rede Esperança, São Paulo, SP/)).toBeTruthy()
  })
})

describe('fluxo de doação: identificação do doador', () => {
  async function ateIdentificacao(user, rota = '/doar/1') {
    await abrirDoacao(rota)
    await user.click(screen.getByRole('button', { name: /Continuar com doação financeira/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
  }
  async function abrirDoacao(rota) {
    render(
      <MemoryRouter initialEntries={[rota]}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { level: 1 })
  }

  it('o cadastro rápido exige nome e e-mail e mantém o doador ao navegar', async () => {
    const user = userEvent.setup()
    await ateIdentificacao(user)
    expect(screen.getByRole('radio', { name: 'Cadastro rápido' }).checked).toBe(true)
    await user.type(screen.getByLabelText(/Nome completo/), '   ')
    await user.type(screen.getByLabelText(/E-mail/), 'maria@example.com')
    await user.click(screen.getByRole('button', { name: 'Continuar para o pagamento' }))
    expect(screen.getByRole('alert').textContent).toContain('Informe seu nome e e-mail.')
    expect(screen.getByRole('heading', { level: 1, name: 'Como você prefere se identificar?' })).toBeTruthy()
  })
  it('trocar a forma de identificação limpa o erro e a opção anônima dispensa os dados', async () => {
    const user = userEvent.setup()
    await ateIdentificacao(user)
    // O atributo `required` já barra campos vazios; espaços passam e caem na validação da tela.
    await user.type(screen.getByLabelText(/Nome completo/), '   ')
    await user.type(screen.getByLabelText(/E-mail/), 'maria@example.com')
    await user.click(screen.getByRole('button', { name: 'Continuar para o pagamento' }))
    expect(screen.getByRole('alert')).toBeTruthy()
    await user.click(screen.getByLabelText('Doação anônima'))
    expect(screen.queryByRole('alert')).toBe(null)
    expect(screen.queryByLabelText(/Nome completo/)).toBe(null)
    expect(screen.getByText(/Seu nome não será exibido/)).toBeTruthy()
  })
  it('a opção "Já tenho uma conta" avisa que a autenticação não está integrada', async () => {
    const user = userEvent.setup()
    await ateIdentificacao(user)
    await user.click(screen.getByLabelText('Já tenho uma conta'))
    expect(screen.getByText(/A autenticação ainda não está integrada/)).toBeTruthy()
    expect(screen.getByLabelText(/Nome completo/)).toBeTruthy()
  })
  it('a doação registrada aparece como pendente na gestão de doações da entidade', async () => {
    const base = fonte.criarDadosDemo()
    const pendentesAntes = base.doacoes.filter(
      (d) => d.entidadeId === base.entidade.id && d.status === 'Pendente',
    ).length
    const user = userEvent.setup()
    await ateIdentificacao(user)
    await user.type(screen.getByLabelText(/Nome completo/), 'Maria Teste')
    await user.type(screen.getByLabelText(/E-mail/), 'maria@example.com')
    await user.click(screen.getByRole('button', { name: 'Continuar para o pagamento' }))
    await user.click(screen.getByRole('button', { name: /Já fiz o pagamento/ }))
    await screen.findByRole('heading', { level: 1, name: 'Doação registrada na demonstração' })
    expect(screen.getByText('Maria Teste')).toBeTruthy()
    expect(screen.getByText('PIX')).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Entrar' }))
    await user.click(screen.getByRole('link', { name: 'Acessar demonstração' }))
    await user.click(within(await screen.findByRole('navigation', { name: 'Principal' })).getByRole('link', { name: 'Doações' }))
    const linha = (await screen.findByText('Maria Teste')).closest('tr')
    expect(linha.textContent).toContain('Pendente')
    expect(kpi('Aguardando confirmação').textContent).toContain(String(pendentesAntes + 1))
  })
  it('campanha sem itens cadastrados mostra o estado vazio na doação de itens', async () => {
    await abrirDoacao('/doar/2')
    const user = userEvent.setup()
    await user.click(screen.getByRole('radio', { name: /Doação de itens/ }))
    await user.click(screen.getByRole('button', { name: /Continuar com doação de itens/ }))
    expect(screen.getByRole('heading', { name: 'Esta campanha ainda não lista itens' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Como você quer ajudar?' })).toBeTruthy()
  })
  it('doação em campanha inexistente ou rascunho informa indisponibilidade', async () => {
    await abrirDoacao('/doar/5')
    expect(screen.getByRole('heading', { level: 1, name: 'Campanha indisponível para doação' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Explorar campanhas ativas' }).getAttribute('href')).toBe('/explorar')
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
