// TEST-GES-01 (#82): testes unitários do frontend de Gestão e Dashboard.
// Complementa gestao.test.js e fluxos.test.jsx (indicadores, filtros, CNPJ,
// estoque e fluxos principais): Login, Entidades, Doadores, Usuários, Itens,
// Relatórios, Dashboard e o gráfico.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import Grafico from '../components/Grafico'
import * as mocks from '../mocks'
import * as fonte from '../mocks/gestao'
import { movimentarEstoque } from '../utils/estoque'
import { formatarMoeda } from '../utils/format'
import { calcularIndicadores } from '../utils/gestao'

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
// O rótulo do card pode repetir texto de menu/badge, então procura só nos cards de KPI.
const kpi = (rotulo) => {
  const card = [...document.querySelectorAll('.kpi')].find(
    (k) => k.querySelector('.kpi__rotulo')?.textContent === rotulo,
  )
  if (!card) throw new Error(`KPI "${rotulo}" não encontrado`)
  return card
}
const linhasDe = (escopo = screen) => escopo.getAllByRole('row').slice(1)
const secao = (titulo) => within(screen.getByRole('heading', { name: titulo }).closest('section'))
const celulas = (linha) => within(linha).getAllByRole('cell').map((c) => c.textContent)

describe('Login e recuperação de senha (GES-01)', () => {
  it('apresenta o acesso com campos obrigatórios e os caminhos alternativos', async () => {
    await abrir('/login')
    expect(screen.getByRole('heading', { level: 1, name: 'Bem-vindo ao DoaSync' })).toBeTruthy()
    const email = screen.getByLabelText(/E-mail/)
    expect(email.type).toBe('email')
    expect(email.required).toBe(true)
    expect(screen.getByLabelText(/Senha/).type).toBe('password')
    expect(screen.getByRole('link', { name: 'Acessar demonstração' }).getAttribute('href')).toBe('/dashboard')
    expect(screen.getByRole('link', { name: 'Cadastrar entidade' }).getAttribute('href')).toBe('/cadastro-entidade')
    expect(screen.getByText('Dados fictícios · nenhum acesso autenticado.')).toBeTruthy()
  })
  it('não envia com campos vazios e informa que a autenticação não está integrada', async () => {
    const user = await abrir('/login')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.queryByText(/autenticação ainda não está integrada/)).toBe(null)
    await user.type(screen.getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.type(screen.getByLabelText(/Senha/), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('status').textContent).toContain('A autenticação ainda não está integrada')
  })
  it('alterna para a recuperação, avisa que nenhum e-mail foi enviado e volta ao acesso', async () => {
    const user = await abrir('/login')
    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Esqueceu sua senha?' })).toBeTruthy()
    expect(screen.queryByLabelText(/Senha/)).toBe(null)
    await user.type(screen.getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.click(screen.getByRole('button', { name: 'Solicitar recuperação' }))
    expect(screen.getByRole('status').textContent).toContain('Nenhum e-mail foi enviado')
    await user.click(screen.getByRole('button', { name: 'Voltar para o acesso' }))
    expect(screen.queryByText(/Nenhum e-mail foi enviado/)).toBe(null)
    expect(screen.getByRole('heading', { level: 2, name: 'Entre na sua conta' })).toBeTruthy()
    expect(screen.getByLabelText(/Senha/)).toBeTruthy()
  })
})

describe('Entidades (carregamento assíncrono)', () => {
  it('mostra o carregamento e depois os indicadores e a tabela', async () => {
    await abrir('/entidades')
    expect(screen.getByRole('status').textContent).toBe('Carregando...')
    await screen.findByRole('table')
    expect(screen.queryByText('Carregando...')).toBe(null)
    expect(kpi('Entidades ativas').textContent).toContain('3')
    expect(kpi('Em análise').textContent).toContain('1')
    expect(kpi('Total de entidades').textContent).toContain('5')
    expect(linhasDe()).toHaveLength(5)
  })
  it('filtra por status e texto e informa quando não há resultado', async () => {
    const user = await abrir('/entidades')
    await screen.findByRole('table')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), 'Inativa')
    expect(linhasDe()).toHaveLength(1)
    expect(screen.getByText('Instituto Semear')).toBeTruthy()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), '')
    await user.type(screen.getByRole('searchbox', { name: /Busque por entidade/ }), 'CAMPINAS')
    expect(linhasDe()).toHaveLength(1)
    expect(screen.getByText('Amor Inclusivo')).toBeTruthy()
    await user.clear(screen.getByRole('searchbox', { name: /Busque por entidade/ }))
    await user.type(screen.getByRole('searchbox', { name: /Busque por entidade/ }), 'zzz')
    expect(screen.getByText('Nenhuma entidade encontrada.')).toBeTruthy()
  })
  it('mostra o erro da requisição e recupera com "Tentar novamente"', async () => {
    vi.spyOn(mocks.entidadesService, 'listar').mockRejectedValueOnce({ message: 'Falha ao listar entidades' })
    const user = await abrir('/entidades')
    expect((await screen.findByRole('alert')).textContent).toContain('Falha ao listar entidades')
    expect(screen.queryByRole('table')).toBe(null)
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await screen.findByRole('table')
    expect(screen.queryByRole('alert')).toBe(null)
  })
})

describe('Doadores e histórico (GES-06)', () => {
  it('agrupa por doador somando só o financeiro confirmado', async () => {
    await abrir('/doadores')
    expect(celulas(screen.getByText('Ana Oliveira').closest('tr'))).toEqual([
      'Ana Oliveira',
      '1',
      formatarMoeda(250),
      '07/10/2026',
      'Ver histórico',
    ])
    expect(celulas(screen.getByText('Studio ambiente').closest('tr'))).toEqual([
      'Studio ambiente',
      '2',
      formatarMoeda(0),
      '08/10/2026',
      'Ver histórico',
    ])
  })
  it('busca por nome sem diferenciar maiúsculas e avisa quando nada é encontrado', async () => {
    const user = await abrir('/doadores')
    const busca = screen.getByRole('searchbox', { name: 'Buscar doador pelo nome' })
    await user.type(busca, 'MERCADO')
    expect(linhasDe()).toHaveLength(1)
    expect(screen.getByText('Mercado São José')).toBeTruthy()
    await user.clear(busca)
    await user.type(busca, 'zzz')
    expect(screen.getByText('Nenhum registro encontrado.')).toBeTruthy()
  })
  it('abre o perfil com todas as contribuições do doador e permite fechar', async () => {
    const user = await abrir('/doadores')
    await user.click(screen.getByRole('button', { name: 'Ver histórico de Studio ambiente' }))
    expect(screen.getByRole('heading', { name: 'Perfil do doador' })).toBeTruthy()
    const historico = [...document.querySelectorAll('.historico-item')].map((i) => i.textContent)
    expect(historico).toHaveLength(2)
    expect(historico.join('|')).toMatch(/Pendente/)
    expect(historico.join('|')).toMatch(/Cancelada/)
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('heading', { name: 'Perfil do doador' })).toBe(null)
  })
})

describe('Usuários e permissões (GES-09)', () => {
  const abrirConvite = async (user) => {
    await user.click(screen.getByRole('button', { name: /Convidar pessoa/ }))
    return within(document.querySelector('dialog'))
  }
  // A tela tem duas tabelas (equipe e matriz de permissões); as linhas da equipe são as da primeira.
  const equipe = () => linhasDe(within(screen.getAllByRole('table')[0]))
  const filtrosDaEquipe = () => within(screen.getByRole('region', { name: /Equipe da/ }))

  it('resume os acessos por situação', async () => {
    await abrir('/configuracoes/usuarios')
    expect(kpi('Acessos ativos').textContent).toContain('4 pessoas')
    expect(kpi('Convites pendentes').textContent).toContain('1 convite')
    expect(kpi('Acesso suspenso').textContent).toContain('1 pessoa')
  })
  it('filtra por papel e por nome ou e-mail', async () => {
    const user = await abrir('/configuracoes/usuarios')
    await user.selectOptions(filtrosDaEquipe().getByLabelText('Papel'), 'Financeiro')
    expect(equipe()).toHaveLength(1)
    expect(screen.getByText('Beatriz Rocha')).toBeTruthy()
    await user.selectOptions(filtrosDaEquipe().getByLabelText('Papel'), '')
    await user.type(filtrosDaEquipe().getByLabelText('Buscar pessoa'), 'camila@')
    expect(equipe()).toHaveLength(1)
    expect(screen.getByText('Camila Ferreira')).toBeTruthy()
  })
  it('convida uma pessoa como "Convite pendente" e avisa que nada foi enviado', async () => {
    const user = await abrir('/configuracoes/usuarios')
    const dialog = await abrirConvite(user)
    expect(dialog.getByRole('heading', { name: 'Convidar pessoa' })).toBeTruthy()
    await user.type(dialog.getByLabelText(/Nome/), 'Carlos Dias')
    await user.type(dialog.getByLabelText(/E-mail/), 'carlos@redeesperanca.org.br')
    await user.click(dialog.getByRole('button', { name: 'Adicionar convite de demonstração' }))
    expect(document.querySelector('dialog')).toBe(null)
    expect(screen.getByText(/Nenhum convite foi enviado ou acesso real alterado/)).toBeTruthy()
    expect(screen.getByText('Carlos Dias').closest('tr').textContent).toContain('Convite pendente')
    expect(kpi('Convites pendentes').textContent).toContain('2 convites')
    expect(kpi('Acessos ativos').textContent).toContain('4 pessoas')
  })
  it('recusa e-mail já existente, sem diferenciar maiúsculas', async () => {
    const user = await abrir('/configuracoes/usuarios')
    const dialog = await abrirConvite(user)
    await user.type(dialog.getByLabelText(/Nome/), 'Outra Ana')
    await user.type(dialog.getByLabelText(/E-mail/), 'ANA@redeesperanca.org.br')
    await user.click(dialog.getByRole('button', { name: 'Adicionar convite de demonstração' }))
    expect(dialog.getByRole('alert').textContent).toContain('Já existe uma pessoa com este e-mail na amostra.')
    expect(equipe()).toHaveLength(6)
  })
  it('recusa nome formado só por espaços', async () => {
    const user = await abrir('/configuracoes/usuarios')
    const dialog = await abrirConvite(user)
    await user.type(dialog.getByLabelText(/Nome/), '   ')
    await user.type(dialog.getByLabelText(/E-mail/), 'novo@redeesperanca.org.br')
    await user.click(dialog.getByRole('button', { name: 'Adicionar convite de demonstração' }))
    expect(dialog.getByRole('alert').textContent).toContain('Informe o nome da pessoa.')
    expect(equipe()).toHaveLength(6)
  })
  it('fechar o convite descarta os dados sem alterar a equipe', async () => {
    const user = await abrir('/configuracoes/usuarios')
    const dialog = await abrirConvite(user)
    await user.type(dialog.getByLabelText(/Nome/), 'Pessoa Descartada')
    await user.click(dialog.getByRole('button', { name: 'Fechar' }))
    expect(document.querySelector('dialog')).toBe(null)
    expect(screen.queryByText('Pessoa Descartada')).toBe(null)
    expect(equipe()).toHaveLength(6)
  })
})

describe('Controle de itens doados (GES-07)', () => {
  const dados = fonte.criarDadosDemo()
  const recebido = dados.itens.reduce((s, i) => s + i.recebido, 0)
  const destinado = dados.itens.reduce((s, i) => s + i.destinado, 0)
  const formSaida = () => within(screen.getByRole('region', { name: /Registrar saída e destinação/ }))

  async function abrirEntrada(user) {
    await user.click(screen.getByRole('button', { name: /Registrar entrada/ }))
    return within(document.querySelector('dialog'))
  }

  it('totaliza entradas, saídas destinadas e o saldo em estoque', async () => {
    await abrir('/itens')
    expect(kpi('Entradas confirmadas').textContent).toContain(`${recebido} unidades`)
    expect(kpi('Saídas destinadas').textContent).toContain(`${destinado} unidades`)
    expect(kpi('Saldo em estoque').textContent).toContain(`${recebido - destinado} unidades`)
    const linha = celulas(secao('Saldo por item').getByText(/Cesta básica/).closest('tr'))
    expect(linha.slice(1, 5)).toEqual(['0', '200', '80', '120'])
  })
  it('o formulário de entrada pede a origem e some o erro ao fechar e reabrir', async () => {
    const user = await abrir('/itens')
    let dialog = await abrirEntrada(user)
    expect(dialog.getByLabelText(/Origem/)).toBeTruthy()
    await user.type(dialog.getByLabelText(/Quantidade/), '10')
    fireEvent.change(dialog.getByLabelText(/Data/), { target: { value: '2026-10-10' } })
    await user.click(dialog.getByRole('button', { name: 'Confirmar na demonstração' }))
    expect(dialog.getByRole('alert').textContent).toContain('Informe a origem ou o destino da movimentação.')
    await user.click(dialog.getByRole('button', { name: 'Fechar' }))
    dialog = await abrirEntrada(user)
    expect(dialog.queryByRole('alert')).toBe(null)
  })
  it('registra uma entrada e atualiza saldos, totais e histórico', async () => {
    const user = await abrir('/itens')
    const dialog = await abrirEntrada(user)
    await user.type(dialog.getByLabelText(/Quantidade/), '10')
    await user.type(dialog.getByLabelText(/Origem/), 'Doação de vizinhos')
    fireEvent.change(dialog.getByLabelText(/Data/), { target: { value: '2026-10-10' } })
    await user.click(dialog.getByRole('button', { name: 'Confirmar na demonstração' }))
    expect(document.querySelector('dialog')).toBe(null)
    expect(screen.getByText('Movimentação registrada na demonstração.')).toBeTruthy()
    expect(kpi('Entradas confirmadas').textContent).toContain(`${recebido + 10} unidades`)
    expect(celulas(secao('Saldo por item').getByText(/Cesta básica/).closest('tr')).slice(1, 5)).toEqual(['0', '210', '80', '130'])
    const registro = celulas(secao('Registro de movimentações').getByText('Doação de vizinhos').closest('tr'))
    expect(registro[0]).toContain('10/10/2026')
    expect(registro[1]).toBe('Entrada conferida')
    expect(registro[2]).toContain('10')
    expect(registro[2]).toContain('Cesta básica')
    expect(registro[4]).toBe('Ana Silva')
  })
  it('registra uma saída pelo formulário de destinação', async () => {
    const user = await abrir('/itens')
    const form = formSaida()
    await user.type(form.getByLabelText(/Quantidade/), '20')
    await user.type(form.getByLabelText(/Destino/), 'Núcleo Vila Mariana')
    fireEvent.change(form.getByLabelText(/Data prevista/), { target: { value: '2026-10-10' } })
    await user.click(form.getByRole('button', { name: 'Confirmar saída' }))
    expect(screen.getByText('Movimentação registrada na demonstração.')).toBeTruthy()
    expect(kpi('Saídas destinadas').textContent).toContain(`${destinado + 20} unidades`)
    expect(celulas(secao('Saldo por item').getByText(/Cesta básica/).closest('tr')).slice(1, 5)).toEqual(['0', '200', '100', '100'])
  })
  it('mostra o erro da saída acima do saldo sem alterar os totais', async () => {
    const user = await abrir('/itens')
    const form = formSaida()
    await user.type(form.getByLabelText(/Quantidade/), '999')
    await user.type(form.getByLabelText(/Destino/), 'Famílias')
    fireEvent.change(form.getByLabelText(/Data prevista/), { target: { value: '2026-10-10' } })
    await user.click(form.getByRole('button', { name: 'Confirmar saída' }))
    expect(form.getByRole('alert').textContent).toContain('A quantidade excede o saldo disponível.')
    expect(kpi('Saídas destinadas').textContent).toContain(`${destinado} unidades`)
  })
  it('filtra o registro de movimentações por tipo', async () => {
    const user = await abrir('/itens')
    const todas = linhasDe(within(secao('Registro de movimentações').getByRole('table'))).length
    await user.selectOptions(screen.getByLabelText('Tipo de movimentação'), 'Saída')
    const saidas = dados.movimentos.filter((m) => m.tipo === 'Saída').length
    expect(linhasDe(within(secao('Registro de movimentações').getByRole('table')))).toHaveLength(saidas)
    expect(saidas).toBeLessThan(todas)
  })

  describe('movimentarEstoque', () => {
    const movimento = { itemId: 1, tipo: 'Entrada', quantidade: '10', destino: ' Doação ', data: '2026-10-10' }
    it('entrada aumenta o recebido; saída aumenta o destinado; a origem não muda', () => {
      const base = fonte.criarDadosDemo()
      const entrada = movimentarEstoque(base, movimento)
      expect(entrada.itens[0]).toMatchObject({ recebido: 210, destinado: 80 })
      expect(entrada.movimento).toMatchObject({ itemId: 1, item: 'Cesta básica', tipo: 'Entrada', quantidade: 10, destino: 'Doação', data: '2026-10-10' })
      const saida = movimentarEstoque(base, { ...movimento, tipo: 'Saída', quantidade: 120 })
      expect(saida.itens[0]).toMatchObject({ recebido: 200, destinado: 200 })
      expect(base.itens[0]).toMatchObject({ recebido: 200, destinado: 80 })
    })
    it('aceita sair exatamente o saldo e entrada de qualquer tamanho', () => {
      const base = fonte.criarDadosDemo()
      expect(() => movimentarEstoque(base, { ...movimento, tipo: 'Saída', quantidade: 120 })).not.toThrow()
      expect(() => movimentarEstoque(base, { ...movimento, quantidade: 5000 })).not.toThrow()
    })
    it.each([
      [{ itemId: 99 }, 'Selecione um item válido.'],
      [{ tipo: 'Outro' }, 'Selecione um tipo de movimentação válido.'],
      [{ quantidade: '1.5' }, 'Informe uma quantidade inteira maior que zero.'],
      [{ quantidade: '0' }, 'Informe uma quantidade inteira maior que zero.'],
      [{ quantidade: '-2' }, 'Informe uma quantidade inteira maior que zero.'],
      [{ quantidade: 'abc' }, 'Informe uma quantidade inteira maior que zero.'],
      [{ tipo: 'Saída', quantidade: '121' }, 'A quantidade excede o saldo disponível.'],
      [{ destino: '   ' }, 'Informe a origem ou o destino da movimentação.'],
    ])('recusa dados inválidos %j', (alteracao, mensagem) => {
      expect(() => movimentarEstoque(fonte.criarDadosDemo(), { ...movimento, ...alteracao })).toThrow(mensagem)
    })
  })
})

describe('Relatórios e exportação (GES-08)', () => {
  const dados = fonte.criarDadosDemo()
  const minhas = dados.doacoes.filter((d) => d.entidadeId === dados.entidade.id)
  const tabelaCampanhas = () => linhasDe(within(secao('Prévia do relatório').getAllByRole('table')[0]))

  it('mostra os totais confirmados e a linha de total por campanha', async () => {
    await abrir('/relatorios')
    const ind = calcularIndicadores(dados.campanhas, minhas)
    expect(kpi('Financeiro confirmado').textContent).toContain(formatarMoeda(ind.arrecadado))
    expect(kpi('Itens recebidos').textContent).toContain(`${ind.itens} unidades`)
    const total = celulas(tabelaCampanhas().at(-1))
    expect(total[0]).toBe('Total confirmado')
    expect(total[1]).toBe(formatarMoeda(ind.arrecadado))
    expect(total[2]).toBe(`${ind.itens} un.`)
  })
  it('gera a prévia para a campanha escolhida', async () => {
    const user = await abrir('/relatorios')
    const campanha = dados.campanhas.find((c) => c.entidadeId === dados.entidade.id)
    const dela = minhas.filter((d) => d.campanhaId === campanha.id)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Campanha' }), String(campanha.id))
    await user.click(screen.getByRole('button', { name: /Gerar prévia/ }))
    expect(screen.getByText('Prévia atualizada para os filtros selecionados.')).toBeTruthy()
    expect(kpi('Financeiro confirmado').textContent).toContain(formatarMoeda(calcularIndicadores([], dela).arrecadado))
    expect(tabelaCampanhas()).toHaveLength(2) // a campanha escolhida + o total
  })
  it('o navegador barra o período invertido antes de gerar a prévia', async () => {
    const user = await abrir('/relatorios')
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-10' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-01' } })
    expect(screen.getByLabelText('Data final').validity.rangeUnderflow).toBe(true)
    await user.click(screen.getByRole('button', { name: /Gerar prévia/ }))
    expect(screen.queryByText(/Prévia atualizada/)).toBe(null)
  })
  it('mantém a exportação indisponível e explica o motivo', async () => {
    await abrir('/relatorios')
    for (const nome of ['Baixar PDF', 'Baixar CSV']) {
      const botao = screen.getByRole('button', { name: nome })
      expect(botao.disabled).toBe(true)
      expect(botao.getAttribute('aria-describedby')).toBe('exportacao-pendente')
    }
    expect(document.getElementById('exportacao-pendente').textContent).toMatch(/serviço de geração de arquivos ainda não foi integrado/)
  })
})

describe('Dashboard (GES-03 e GES-04)', () => {
  const dados = fonte.criarDadosDemo()
  const minhasCampanhas = dados.campanhas.filter((c) => c.entidadeId === dados.entidade.id)
  const minhasDoacoes = dados.doacoes.filter((d) => d.entidadeId === dados.entidade.id)
  const geral = calcularIndicadores(minhasCampanhas, minhasDoacoes)

  it('visão geral: indicadores calculados só com dados confirmados da entidade', async () => {
    await abrir('/dashboard')
    expect(kpi('Arrecadação financeira').textContent).toContain(formatarMoeda(geral.arrecadado))
    expect(kpi('Doadores').textContent).toContain(String(geral.doadores))
    expect(kpi('Campanhas ativas').textContent).toContain(String(geral.ativas))
    expect(kpi('Taxa de conclusão').textContent).toContain(`${geral.concluidas}%`)
    expect(screen.getByRole('link', { name: /Ver relatórios/ }).getAttribute('href')).toBe('/relatorios')
  })
  it('período invertido mostra alerta e zera os indicadores até voltar a todo o período', async () => {
    const user = await abrir('/dashboard')
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-10' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-01' } })
    expect(screen.getByRole('alert').textContent).toContain('A data inicial deve ser anterior ou igual à data final.')
    expect(kpi('Arrecadação financeira').textContent).toContain(formatarMoeda(0))
    expect(screen.getByText(/Período selecionado/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Todo o período' }))
    expect(screen.queryByRole('alert')).toBe(null)
    expect(kpi('Arrecadação financeira').textContent).toContain(formatarMoeda(geral.arrecadado))
    expect(screen.getByLabelText('Data inicial').value).toBe('')
  })
  it('análise por campanha: situação, progresso e troca de campanha', async () => {
    const user = await abrir('/dashboard/campanha?campanha=2')
    expect(kpi('Situação da campanha').textContent).toContain('Ativa')
    expect(kpi('Situação da campanha').textContent).toContain('Educação')
    const progresso = () => secao('Progresso da campanha').getByRole('progressbar')
    expect(progresso().getAttribute('aria-valuenow')).toBe('80')
    await user.selectOptions(screen.getByRole('combobox', { name: /^Campanha/ }), '1')
    expect(progresso().getAttribute('aria-valuenow')).toBe('61')
    expect(screen.getByRole('link', { name: /Ver campanha/ }).getAttribute('href')).toBe('/campanhas/1')
  })
  it('análise por campanha de outra entidade ou inexistente informa que não foi encontrada', async () => {
    await abrir('/dashboard/campanha?campanha=999')
    expect(screen.getByRole('heading', { name: 'Campanha não encontrada' })).toBeTruthy()
    expect(kpi('Situação da campanha').textContent).toContain('—')
    expect(screen.queryByRole('progressbar')).toBe(null)
  })
})

describe('Grafico', () => {
  const pagamento = (data, valor, status = 'Confirmada') => ({ tipo: 'Financeira', status, data, valor })
  const recebimento = (data, quantidade) => ({ tipo: 'Itens', status: 'Confirmada', data, quantidade })

  it('sem pagamentos confirmados, mostra o estado vazio financeiro', () => {
    render(<Grafico doacoes={[pagamento('2026-10-01', 100, 'Pendente')]} />)
    expect(screen.getByRole('heading', { name: 'Sem arrecadação neste período' })).toBeTruthy()
    expect(screen.getByText('Não há pagamentos confirmados para os filtros selecionados.')).toBeTruthy()
    expect(screen.queryByRole('img')).toBe(null)
  })
  it('sem recebimentos de itens, mostra o estado vazio de itens', () => {
    render(<Grafico doacoes={[]} medida="itens" />)
    expect(screen.getByRole('heading', { name: 'Sem recebimentos neste período' })).toBeTruthy()
    expect(screen.getByText('Não há doações de itens confirmadas para os filtros selecionados.')).toBeTruthy()
  })
  it('acumula só pagamentos confirmados e descreve o gráfico para leitores de tela', () => {
    const { container } = render(
      <Grafico doacoes={[pagamento('2026-10-03', 50), pagamento('2026-10-01', 100), pagamento('2026-10-04', 999, 'Pendente')]} />,
    )
    expect(screen.getByRole('img', { name: `Arrecadação acumulada: ${formatarMoeda(150)} em 2 datas` })).toBeTruthy()
    expect(screen.getByText('Pagamentos confirmados · valores acumulados')).toBeTruthy()
    const linhas = [...container.querySelectorAll('details tbody tr')].map((l) => [...l.cells].map((c) => c.textContent))
    expect(linhas).toEqual([
      ['2026-10-01', formatarMoeda(100)],
      ['2026-10-03', formatarMoeda(150)],
    ])
    expect(container.querySelector('polygon')).toBeTruthy()
  })
  it('em modo itens, acumula unidades e usa a legenda de recebimentos', () => {
    render(<Grafico doacoes={[recebimento('2026-10-01', 5), recebimento('2026-10-02', 10)]} medida="itens" id="itens" />)
    expect(screen.getByRole('img', { name: 'Itens recebidos: 15 un. em 2 datas' })).toBeTruthy()
    expect(screen.getByText('Recebimentos confirmados · unidades acumuladas')).toBeTruthy()
    expect(screen.getByText('Itens acumulados')).toBeTruthy()
  })
  it('com um único ponto desenha a linha sem a área preenchida', () => {
    const { container } = render(<Grafico doacoes={[pagamento('2026-10-01', 100)]} />)
    expect(screen.getByRole('img', { name: /em 1 datas/ })).toBeTruthy()
    expect(container.querySelector('polygon')).toBe(null)
    expect(container.querySelector('polyline')).toBeTruthy()
  })
})
