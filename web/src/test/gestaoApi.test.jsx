// Telas de gestão integradas à API (passos 20 a 25 de docs/integracao-api.md): editar e
// acompanhar campanha, doações recebidas, dashboards, doadores, entidades e usuários (ADMIN).
// A API é o simulador de contrato de fixtures/apiCampanhas.js (instalado no setup.js).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'
import api from '../services/api'
import { salvarSessao } from '../services/token'
import { formatarMoeda } from '../utils/format'
import { acoesDeStatus } from '../utils/campanhas'
import { agruparDoadores } from '../utils/gestao'
import { adaptadorApiPadrao, campanhasApi, campanhasPrivadasApi, detalheCampanhaApi } from './fixtures/apiCampanhas'

const SESSAO_ADMIN = {
  token: 'token-admin',
  expiraEm: '2999-01-01T00:00:00Z',
  usuario: { id: 'u9000000-0000-4000-8000-000000000001', nome: 'Admin DoaSync', email: 'admin@doasync.local', tipo: 'ADMIN', entidadeId: null, statusEntidade: null },
}
const ATIVA = campanhasApi[0] // Rede Esperança, ATIVA
const ENCERRADA = campanhasPrivadasApi[0]
const RASCUNHO = campanhasPrivadasApi[1]

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
// Registra as chamadas feitas à API simulada.
function espionarApi() {
  const chamadas = []
  api.defaults.adapter = (config) => {
    chamadas.push(config)
    return adaptadorApiPadrao(config)
  }
  return chamadas
}
const kpi = (rotulo) => {
  const card = [...document.querySelectorAll('.kpi')].find((k) => k.querySelector('.kpi__rotulo')?.textContent === rotulo)
  if (!card) throw new Error(`KPI "${rotulo}" não encontrado`)
  return card
}
const linhas = () => screen.getAllByRole('row').slice(1)

describe('Editar campanha (DEV-CAM-08, passo 20)', () => {
  it('carrega a campanha da API e salva com PATCH enviando a versão lida', async () => {
    const chamadas = espionarApi()
    const user = await abrir(`/campanhas/${ATIVA.id}/editar`)
    const titulo = await screen.findByLabelText(/Título da campanha/)
    expect(titulo.value).toBe(ATIVA.titulo)
    await user.clear(titulo)
    await user.type(titulo, 'Mesa solidária ampliada')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(await screen.findByText('Campanha atualizada com sucesso.')).toBeTruthy()
    const patch = chamadas.find((c) => c.method === 'patch')
    expect(patch.url).toBe(`/campanhas/${ATIVA.id}`)
    expect(JSON.parse(patch.data)).toMatchObject({ titulo: 'Mesa solidária ampliada', versao: 0 })
  })
  it('valida antes de enviar: campos obrigatórios e meta menor que o arrecadado', async () => {
    const chamadas = espionarApi()
    const user = await abrir(`/campanhas/${ATIVA.id}/editar`)
    await user.clear(await screen.findByLabelText(/Título da campanha/))
    const meta = screen.getByLabelText(/Meta financeira/)
    await user.clear(meta)
    await user.type(meta, '100')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(screen.getByText('Informe o título da campanha.')).toBeTruthy()
    expect(screen.getByText(/A meta não pode ser menor que o total recebido/)).toBeTruthy()
    expect(chamadas.some((c) => c.method === 'patch')).toBe(false)
  })
  it('conflito de versão (409) mantém o formulário e oferece carregar a versão atual', async () => {
    api.defaults.adapter = (config) =>
      config.method === 'patch'
        ? Promise.reject({ response: { status: 409, data: { error: 'Campanha alterada por outra operação.' } }, config })
        : adaptadorApiPadrao(config)
    const user = await abrir(`/campanhas/${ATIVA.id}/editar`)
    const titulo = await screen.findByLabelText(/Título da campanha/)
    await user.type(titulo, ' editado')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/Campanha alterada por outra operação/)
    expect(titulo.value).toBe(`${ATIVA.titulo} editado`)
    await user.click(screen.getByRole('button', { name: 'Carregar versão atual' }))
    expect(await screen.findByDisplayValue(ATIVA.titulo)).toBeTruthy()
  })
  it('campanha encerrada fica bloqueada para edição', async () => {
    await abrir(`/campanhas/${ENCERRADA.id}/editar`)
    expect(await screen.findByText('Esta campanha não pode mais ser editada. Status atual: Encerrada.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Salvar alterações/ }).disabled).toBe(true)
  })
  it('sem `versao` no detalhe, a edição fica indisponível', async () => {
    api.defaults.adapter = (config) => {
      if (config.method === 'get' && config.url === `/campanhas/${ATIVA.id}`) {
        const semVersao = detalheCampanhaApi(ATIVA.id)
        delete semVersao.versao
        return Promise.resolve({ data: { data: semVersao }, status: 200, statusText: 'OK', headers: {}, config })
      }
      return adaptadorApiPadrao(config)
    }
    await abrir(`/campanhas/${ATIVA.id}/editar`)
    expect(await screen.findByText(/o servidor não informou a versão da campanha/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Salvar alterações/ }).disabled).toBe(true)
  })
  it('campanha inexistente oferece o caminho de volta', async () => {
    await abrir('/campanhas/inexistente/editar')
    expect(await screen.findByRole('heading', { level: 1, name: 'Campanha não encontrada' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar para campanhas' }).getAttribute('href')).toBe('/campanhas')
  })
})

describe('Acompanhamento e status da campanha (DEV-CAM-09/10, passo 21)', () => {
  it('mostra arrecadação e as doações da campanha vindas da API', async () => {
    await abrir(`/campanhas/${ATIVA.id}/acompanhamento`)
    await screen.findByRole('table', { name: 'Doações da campanha' })
    expect(kpi('Arrecadação financeira').textContent).toContain(formatarMoeda(ATIVA.valorArrecadado))
    expect(kpi('Doações confirmadas').textContent).toContain('3')
    expect(linhas()).toHaveLength(3)
    expect(screen.getByText('Doador anônimo')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Editar/ }).getAttribute('href')).toBe(`/campanhas/${ATIVA.id}/editar`)
  })
  it('a dona encerra a campanha ativa depois de confirmar', async () => {
    const chamadas = espionarApi()
    const user = await abrir(`/campanhas/${ATIVA.id}/acompanhamento`)
    await user.click(await screen.findByRole('button', { name: 'Encerrar campanha' }))
    const dialogo = screen.getByRole('dialog', { name: 'Encerrar campanha' })
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar: encerrar campanha' }))
    expect(await screen.findByText('Status da campanha atualizado.')).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data)).toEqual({ status: 'ENCERRADA' })
    expect(await screen.findByText('Encerrada')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Editar/ })).toBe(null)
  })
  it('a dona publica um rascunho', async () => {
    const chamadas = espionarApi()
    const user = await abrir(`/campanhas/${RASCUNHO.id}/acompanhamento`)
    await user.click(await screen.findByRole('button', { name: 'Publicar campanha' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar: publicar campanha' }))
    expect(await screen.findByText('Status da campanha atualizado.')).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data)).toEqual({ status: 'ATIVA' })
  })
  it('o ADMIN só desativa com motivo', async () => {
    salvarSessao(SESSAO_ADMIN)
    const chamadas = espionarApi()
    const user = await abrir(`/campanhas/${ATIVA.id}/acompanhamento`)
    await user.click(await screen.findByRole('button', { name: 'Desativar campanha' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar: desativar campanha' }))
    expect(screen.getByText('Informe o motivo da desativação.')).toBeTruthy()
    await user.type(screen.getByLabelText(/Motivo/), 'Conteúdo impróprio')
    await user.click(screen.getByRole('button', { name: 'Confirmar: desativar campanha' }))
    expect(await screen.findByText('Status da campanha atualizado.')).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data)).toEqual({ status: 'DESATIVADA', motivo: 'Conteúdo impróprio' })
  })
  it('acoesDeStatus segue o perfil e o status', () => {
    const dona = { tipo: 'ENTIDADE', entidadeId: 'e1' }
    const admin = { tipo: 'ADMIN' }
    const c = (status, extra = {}) => ({ status, entidadeId: 'e1', iniciaEm: '2026-10-01', ...extra })
    expect(acoesDeStatus(c('Ativa'), dona).map((a) => a.status)).toEqual(['ENCERRADA'])
    expect(acoesDeStatus(c('Ativa'), admin).map((a) => a.status)).toEqual(['ENCERRADA', 'DESATIVADA'])
    expect(acoesDeStatus(c('Desativada'), admin).map((a) => a.status)).toEqual(['ATIVA'])
    expect(acoesDeStatus(c('Rascunho', { iniciaEm: '2999-01-01' }), dona, '2026-11-26')[0].status).toBe('AGENDADA')
    expect(acoesDeStatus(c('Ativa'), { tipo: 'ENTIDADE', entidadeId: 'outra' })).toEqual([])
    expect(acoesDeStatus(c('Encerrada'), admin)).toEqual([])
  })
})

describe('Doações recebidas (DEV-GES-05, passo 22)', () => {
  it('lista as doações da entidade da sessão, com totais e filtros', async () => {
    const chamadas = espionarApi()
    const user = await abrir('/doacoes')
    await screen.findByRole('table', { name: 'Doações recebidas' })
    expect(chamadas.find((c) => c.url.endsWith('/doacoes')).url).toBe('/entidades/e0000000-0000-4000-8000-000000000001/doacoes')
    expect(linhas()).toHaveLength(5)
    expect(kpi('Total confirmado').textContent).toContain(formatarMoeda(580))
    expect(kpi('Outros status').textContent).toContain('1')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), 'Pendente')
    expect(linhas()).toHaveLength(1)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Todos os status' }), '')
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText('Nenhuma doação encontrada com esses filtros.')).toBeTruthy()
  })
  it('o detalhe de uma doação anônima não identifica o doador', async () => {
    const user = await abrir('/doacoes')
    await screen.findByRole('table', { name: 'Doações recebidas' })
    await user.click(screen.getByRole('button', { name: 'Ver doação DS-RECEBIDA0002 de Doador anônimo' }))
    expect(screen.getByText(/Doação anônima: a identificação do doador não é exibida/)).toBeTruthy()
  })
  it('o ADMIN escolhe a entidade antes de ver as doações', async () => {
    salvarSessao(SESSAO_ADMIN)
    const user = await abrir('/doacoes')
    expect(screen.getByText('Escolha uma entidade para ver as doações recebidas.')).toBeTruthy()
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Entidade' }), 'e0000000-0000-4000-8000-000000000001')
    await screen.findByRole('table', { name: 'Doações recebidas' })
    expect(linhas()).toHaveLength(5)
  })
})

describe('Dashboard (DEV-GES-03/04, passos 22 e 23)', () => {
  it('visão da entidade: arrecadação confirmada e campanhas', async () => {
    await abrir('/dashboard')
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    expect(kpi('Arrecadação no período').textContent).toContain(formatarMoeda(580))
    expect(kpi('Doações confirmadas').textContent).toContain('4')
    expect(kpi('Campanhas ativas').textContent).toContain('2')
    expect(kpi('Campanhas ativas').textContent).toContain('5 campanhas no total')
  })
  it('período invertido mostra o alerta e não consulta a arrecadação', async () => {
    await abrir('/dashboard')
    await screen.findByRole('table', { name: 'Arrecadação por campanha' })
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-10' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-10-01' } })
    expect(screen.getByRole('alert').textContent).toContain('A data inicial deve ser anterior ou igual à data final.')
    expect(screen.queryByRole('table', { name: 'Arrecadação por campanha' })).toBe(null)
  })
  it('ADMIN vê os indicadores da plataforma', async () => {
    salvarSessao(SESSAO_ADMIN)
    await abrir('/dashboard')
    await screen.findByText('Total arrecadado')
    expect(kpi('Total arrecadado').textContent).toContain(formatarMoeda(125430.5))
    expect(kpi('Campanhas recebendo doações').textContent).toContain('6')
  })
  it('análise por campanha usa a arrecadação do período daquela campanha', async () => {
    const segunda = campanhasApi[1]
    await abrir(`/dashboard/campanha?campanha=${segunda.id}`)
    await screen.findByText('Arrecadado no período')
    expect(kpi('Arrecadado no período').textContent).toContain(formatarMoeda(300))
    expect(kpi('Arrecadado no período').textContent).toContain('1 doações confirmadas')
  })
  it('análise de campanha de outra entidade informa que não foi encontrada', async () => {
    await abrir('/dashboard/campanha?campanha=c0000000-0000-4000-8000-000000000003')
    expect(await screen.findByRole('heading', { name: 'Campanha não encontrada' })).toBeTruthy()
  })
})

describe('Doadores e histórico (DEV-GES-06)', () => {
  it('agrupa por doador identificado e mantém anônimas só no total', async () => {
    const user = await abrir('/doadores')
    await screen.findByRole('table', { name: 'Doadores da entidade' })
    expect(linhas().map((l) => within(l).getAllByRole('cell')[0].textContent)).toEqual(['Bruno Lima', 'Ana Oliveira'])
    expect(kpi('Doações anônimas').textContent).toContain('2')
    await user.click(screen.getByRole('button', { name: 'Ver histórico de Ana Oliveira' }))
    expect(document.querySelectorAll('.historico-item')).toHaveLength(2)
  })
  it('agruparDoadores soma só o confirmado e ignora anônimas', () => {
    const d = (id, doadorId, valor, status = 'Confirmada') => ({ id, doadorId, doador: doadorId, anonima: !doadorId, valor, status, data: '2026-10-01T00:00:00Z' })
    const grupos = agruparDoadores([d(1, 'a', 10), d(2, 'a', 5, 'Pendente'), d(3, null, 99), d(4, 'b', 20)])
    expect(grupos.map((g) => [g.id, g.quantidade, g.total])).toEqual([['b', 1, 20], ['a', 2, 10]])
  })
})

describe('Entidades (ADMIN, passo 25)', () => {
  it('aprova uma entidade pendente', async () => {
    salvarSessao(SESSAO_ADMIN)
    const user = await abrir('/entidades')
    await screen.findByRole('table', { name: 'Entidades cadastradas' })
    expect(kpi('Aguardando análise').textContent).toContain('1')
    await user.click(screen.getByRole('button', { name: 'Aprovar Casa Nova' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar: aprovar' }))
    expect(await screen.findByText('Casa Nova: Entidade aprovada com sucesso.')).toBeTruthy()
    await vi.waitFor(() => expect(kpi('Aguardando análise').textContent).toContain('0'))
  })
  it('reprovação exige motivo', async () => {
    salvarSessao(SESSAO_ADMIN)
    const user = await abrir('/entidades')
    await user.click(await screen.findByRole('button', { name: 'Reprovar Casa Nova' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar: reprovar' }))
    expect(screen.getByText('Informe o motivo da reprovação.')).toBeTruthy()
  })
  it('a entidade não acessa a aprovação', async () => {
    await abrir('/entidades')
    expect(screen.getByText('A aprovação de entidades é feita pela administração da plataforma.')).toBeTruthy()
  })
})

describe('Usuários da plataforma (ADMIN, passo 24)', () => {
  it('lista as contas e desativa uma delas', async () => {
    salvarSessao(SESSAO_ADMIN)
    const chamadas = espionarApi()
    const user = await abrir('/usuarios')
    await screen.findByRole('table', { name: 'Usuários da plataforma' })
    expect(linhas()).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Desativar Maria Souza' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar desativação' }))
    expect(await screen.findByText('Maria Souza: Usuário desativado.')).toBeTruthy()
    expect(JSON.parse(chamadas.find((c) => c.method === 'patch').data)).toEqual({ status: 'INATIVO' })
  })
})
