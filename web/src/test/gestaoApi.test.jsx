import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { csvArrecadacao } from '../utils/exportarArrecadacao'
import { adaptadorApiPadrao, campanhasApi, campanhasPrivadasApi, DOACAO_EXISTENTE_ID } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

const abrir = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
const resposta = (config, data) => Promise.resolve({ config, status: 200, statusText: 'OK', headers: {}, data })
const erro = (config, status, message) => Promise.reject({ config, response: { status, data: { error: message } } })
const ativa = campanhasApi[0]
const encerrada = campanhasPrivadasApi[0]
const entidade = SESSAO_ENTIDADE_TESTE.usuario.entidadeId
const paginado = (data, page = 1, totalPages = 1) => ({ data, meta: { total: data.length, page, limit: 10, totalPages } })

function interceptar(regra) {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return regra(config) ?? adaptadorApiPadrao(config)
  }
  return chamadas
}

function admin() {
  salvarSessao({ ...SESSAO_ENTIDADE_TESTE, usuario: { ...SESSAO_ENTIDADE_TESTE.usuario, tipo: 'ADMIN', entidadeId: null } })
}

describe('campanhas pela API', () => {
  it('edita com versão zero e usa a versão seguinte na segunda alteração', async () => {
    const chamadas = interceptar(() => {})
    const user = userEvent.setup()
    abrir(`/campanhas/${ativa.id}/editar`)
    const titulo = await screen.findByRole('textbox', { name: /Título da campanha/ })
    await user.clear(titulo)
    await user.type(titulo, 'Meta comunitária')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Campanha atualizada.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await screen.findByText('Campanha atualizada.')
    expect(chamadas.filter((c) => c.method === 'patch').map((c) => JSON.parse(c.data).versao)).toEqual([0, 1])
  })

  it('retém os dados digitados e impede nova gravação após conflito de versão', async () => {
    const chamadas = interceptar((c) => c.method === 'patch' ? erro(c, 409, 'Campanha alterada por outra operação.') : undefined)
    const user = userEvent.setup()
    abrir(`/campanhas/${ativa.id}/editar`)
    const titulo = await screen.findByRole('textbox', { name: /Título da campanha/ })
    await user.clear(titulo)
    await user.type(titulo, 'Novo título')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(titulo.value).toBe('Novo título')
    expect(screen.getByRole('button', { name: 'Salvar alterações' }).closest('fieldset').disabled).toBe(true)
    expect(chamadas.filter((c) => c.method === 'patch')).toHaveLength(1)
  })

  it('recupera a edição após conflito usando a versão confirmada na nova consulta', async () => {
    let conflito = false
    const chamadas = interceptar((config) => {
      if (config.method === 'get' && conflito) {
        return resposta(config, { data: { ...ativa, versao: 2, titulo: 'Título de outra sessão' } })
      }
      if (config.method !== 'patch') return undefined
      if (conflito) return resposta(config, { data: { ...ativa, versao: 3 } })
      conflito = true
      return erro(config, 409, 'Campanha alterada por outra operação.')
    })
    const user = userEvent.setup()
    abrir(`/campanhas/${ativa.id}/editar`)
    const titulo = await screen.findByRole('textbox', { name: /Título da campanha/ })
    await user.clear(titulo)
    await user.type(titulo, 'Rascunho local')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    const recarregar = await screen.findByRole('button', { name: 'Descartar rascunho e carregar versão atual' })
    expect(titulo.value).toBe('Rascunho local')
    await user.click(recarregar)
    expect(await screen.findByDisplayValue('Título de outra sessão')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await screen.findByText('Campanha atualizada.')
    expect(chamadas.map((c) => c.method)).toEqual(['get', 'patch', 'get', 'patch'])
    expect(chamadas.filter((c) => c.method === 'patch').map((c) => JSON.parse(c.data).versao)).toEqual([0, 2])
  })

  it('impede edição quando a API não expõe a versão', async () => {
    const chamadas = interceptar((c) => c.url === `/campanhas/${ativa.id}` && resposta(c, { data: ativa }))
    abrir(`/campanhas/${ativa.id}/editar`)
    expect(await screen.findByText(/consulta precisa informar a versão/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Salvar alterações' })).toBeNull()
    expect(chamadas.map((c) => c.method)).toEqual(['get'])
  })

  it('bloqueia campanha encerrada ou de outra entidade', async () => {
    const { unmount } = abrir(`/campanhas/${encerrada.id}/editar`)
    expect(await screen.findByText(/não podem ser editadas/)).toBeTruthy()
    unmount()
    abrir(`/campanhas/${campanhasApi[2].id}/editar`)
    expect(await screen.findByRole('heading', { name: 'Campanha indisponível para edição' })).toBeTruthy()
  })

  it('valida a meta sem enviar ao backend', async () => {
    const chamadas = interceptar(() => {})
    const user = userEvent.setup()
    abrir(`/campanhas/${ativa.id}/editar`)
    const meta = await screen.findByRole('textbox', { name: /Meta financeira/ })
    await user.clear(meta)
    await user.type(meta, '100')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText(/meta não pode ser menor/)).toBeTruthy()
    expect(chamadas.some((c) => c.method === 'patch')).toBe(false)
  })

  it('acompanha doações e encerra a campanha pelo endpoint de status', async () => {
    const chamadas = interceptar(() => {})
    const user = userEvent.setup()
    abrir(`/campanhas/${ativa.id}/acompanhamento`)
    expect(await screen.findByRole('heading', { name: 'Doações recentes' })).toBeTruthy()
    expect(screen.getByText('Doador anônimo')).toBeTruthy()
    await user.selectOptions(screen.getByRole('combobox'), 'ENCERRADA')
    await user.click(screen.getByRole('button', { name: 'Confirmar mudança' }))
    expect(await screen.findByText('Status atualizado.')).toBeTruthy()
    expect(await screen.findByText('Encerrada')).toBeTruthy()
    const patch = chamadas.find((c) => c.method === 'patch')
    expect(patch.url).toBe(`/campanhas/${ativa.id}/status`)
    expect(JSON.parse(patch.data)).toEqual({ status: 'ENCERRADA' })
  })
})

describe('gestão pela API', () => {
  it('paginha doações da entidade e mantém o caminho do comprovante', async () => {
    const chamadas = interceptar((c) => c.url === `/entidades/${entidade}/doacoes` && resposta(c, paginado([
      { id: DOACAO_EXISTENTE_ID, codigoComprovante: 'DS-QA', campanha: { titulo: 'Campanha QA' }, valor: 90, dataDoacao: '2026-10-01', status: 'CONFIRMADA' },
    ], c.params.page, 2)))
    const user = userEvent.setup()
    abrir('/doacoes')
    expect((await screen.findByRole('link', { name: 'DS-QA' })).getAttribute('href')).toBe(`/minhas-doacoes/${DOACAO_EXISTENTE_ID}`)
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(await screen.findByText('Página 2 de 2')).toBeTruthy()
    expect(chamadas.at(-1).params.page).toBe(2)
  })

  it('mantém homônimos em registros distintos e exclui doações anônimas da consulta nominal', async () => {
    const base = { campanha: { titulo: 'Campanha QA' }, valor: 90, dataDoacao: '2026-10-01', status: 'CONFIRMADA' }
    interceptar((c) => c.url === `/entidades/${entidade}/doacoes` && resposta(c, paginado([
      { ...base, id: '1', codigoComprovante: 'Registro identificado', doador: { nome: 'Pessoa QA' } },
      { ...base, id: '2', codigoComprovante: 'Registro anônimo', anonima: true, doador: { nome: 'Pessoa QA' } },
      { ...base, id: '3', codigoComprovante: 'Outro registro', doador: { nome: 'Pessoa QA' } },
    ])))
    abrir('/doadores')
    expect(await screen.findByRole('link', { name: 'Registro identificado' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Outro registro' })).toBeTruthy()
    expect(screen.getAllByText('Pessoa QA')).toHaveLength(2)
    expect(screen.queryByText('Registro anônimo')).toBeNull()
  })

  it('valida o período e usa as datas do contrato no relatório', async () => {
    const chamadas = interceptar((c) => c.url === `/entidades/${entidade}/arrecadacao` && resposta(c, { data: {
      inicio: '2026-10-01', fim: '2026-10-31', totalArrecadado: 90, quantidadeDoacoes: 1,
      porCampanha: [{ campanhaId: ativa.id, titulo: 'Campanha QA', total: 90, quantidade: 1 }],
    } }))
    const user = userEvent.setup()
    abrir('/relatorios')
    expect(await screen.findByRole('button', { name: 'Baixar CSV' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-11-01' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-31' } })
    await user.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(chamadas).toHaveLength(1)
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-01' } })
    await user.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(chamadas.at(-1).params).toEqual({ dataInicio: '2026-10-01', dataFim: '2026-10-31' })
  })

  it('restringe contas e aprovação a administradores', async () => {
    const chamadas = interceptar(() => {})
    abrir('/configuracoes/usuarios')
    expect(await screen.findByRole('heading', { name: 'Acesso restrito' })).toBeTruthy()
    expect(chamadas).toHaveLength(0)
  })

  it('aguarda o status atualizado da conta antes de permitir outra alteração', async () => {
    admin()
    const conta = { id: 'conta-doador', nome: 'Conta QA', email: 'qa@example.test', tipo: 'PESSOA_FISICA', status: 'ATIVO' }
    const recarga = Promise.withResolvers()
    const chamadas = interceptar((c) => {
      if (c.method === 'patch') return resposta(c, { data: { ...conta, status: 'INATIVO' } })
      if (c.url !== '/usuarios') return
      return chamadas.length === 1
        ? resposta(c, paginado([conta]))
        : recarga.promise.then(() => resposta(c, paginado([{ ...conta, status: 'INATIVO' }])))
    })
    const user = userEvent.setup()
    const acao = { name: 'Alterar status de Conta QA' }
    abrir('/configuracoes/usuarios')
    await user.click(await screen.findByRole('button', acao))
    await user.click(screen.getByRole('button', { name: 'Confirmar mudança' }))
    await screen.findByText('Status atualizado.')
    expect(screen.getByRole('button', acao).disabled).toBe(true)

    recarga.resolve()
    await screen.findByText('Inativo')
    await user.click(screen.getByRole('button', acao))
    expect(screen.getByRole('dialog').textContent).toContain('voltará a ter acesso')
  })

  it('reprova entidade com motivo e consulta a lista administrativa novamente', async () => {
    admin()
    const conta = { id: 'conta-entidade', entidadeId: entidade, nome: 'Conta QA', email: 'qa@example.test', statusEntidade: 'PENDENTE' }
    const chamadas = interceptar((c) => c.url === '/usuarios'
      ? resposta(c, paginado([conta]))
      : resposta(c, { data: { id: entidade, statusAprovacao: 'REPROVADA' } }))
    const user = userEvent.setup()
    abrir('/entidades')
    await user.click(await screen.findByRole('button', { name: 'Alterar status de Conta QA' }))
    const dialog = screen.getByRole('dialog')
    await user.selectOptions(within(dialog).getByRole('combobox'), 'REPROVADA')
    await user.type(within(dialog).getByLabelText(/Motivo da reprovação/), 'Dados cadastrais incompletos')
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar mudança' }))
    expect(await screen.findByText('Status atualizado.')).toBeTruthy()
    expect(chamadas[0].params.tipo).toBe('ENTIDADE')
    expect(chamadas[1].url).toBe(`/entidades/${entidade}/status`)
    expect(JSON.parse(chamadas[1].data)).toEqual({ status: 'REPROVADA', motivo: 'Dados cadastrais incompletos' })
    expect(chamadas[2].url).toBe('/usuarios')
  })

  it.each(['/itens', '/campanhas/1/prestacao-de-contas'])('expõe a dependência real de %s, sem carregar registros fictícios', async (path) => {
    const chamadas = interceptar(() => {})
    abrir(path)
    expect(await screen.findByRole('heading', { name: 'Funcionalidade indisponível' })).toBeTruthy()
    expect(chamadas).toHaveLength(0)
  })

  it('escapa texto que uma planilha pode interpretar como fórmula', () => {
    const csv = csvArrecadacao({ inicio: '2026-10-01', fim: '2026-10-31', porCampanha: [{ titulo: ' = SOMA("x")', quantidade: 1, total: 90 }] })
    expect(csv).toContain(`"' = SOMA(""x"")"`)
  })
})
