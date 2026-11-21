import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { equipeDemo } from '../mocks/equipe'
import * as fonte from '../mocks/gestao'
import { filtrarEquipe, resumoEquipe, validarAcesso, validarConvite } from '../utils/equipe'

beforeEach(() =>
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
)
async function abrir() {
  render(<MemoryRouter initialEntries={['/configuracoes/usuarios']}><App /></MemoryRouter>)
  await screen.findByRole('heading', { level: 1 })
  return userEvent.setup()
}
const linhasEquipe = () => within(screen.getAllByRole('table')[0]).getAllByRole('row').length - 1
const edicao = () => screen.getByRole('region', { name: /Editar acesso/ })

describe('regras da equipe (#113)', () => {
  it('resume acessos, convites e suspensões como no protótipo', () => {
    expect(resumoEquipe(equipeDemo)).toEqual({ ativos: 4, admins: 1, naEquipe: 3, convites: 1, expira: '09/10/2026', suspensos: 1 })
  })
  it('filtra por papel, acesso e busca', () => {
    expect(filtrarEquipe(equipeDemo, { papel: 'Leitura' })).toHaveLength(2)
    expect(filtrarEquipe(equipeDemo, { acesso: 'Suspenso' })).toHaveLength(1)
    expect(filtrarEquipe(equipeDemo, { busca: 'PAULO@' })).toHaveLength(1)
  })
  it('protege a última administradora e o convite pendente', () => {
    const [ana, , , , luiza] = equipeDemo
    expect(validarAcesso({ papel: 'Operador', acesso: 'Ativo' }, ana, equipeDemo)).toMatch(/última administradora/)
    expect(validarAcesso({ papel: 'Administradora', acesso: 'Suspenso' }, ana, equipeDemo)).toMatch(/última administradora/)
    expect(validarAcesso({ papel: 'Administradora', acesso: 'Ativo' }, ana, equipeDemo)).toBe('')
    expect(validarAcesso({ papel: 'Leitura', acesso: 'Ativo' }, luiza, equipeDemo)).toMatch(/aceitar o convite/)
  })
  it('permite remover uma administradora quando há outra ativa', () => {
    const duas = equipeDemo.map((u) => (u.id === 2 ? { ...u, papel: 'Administradora' } : u))
    expect(validarAcesso({ papel: 'Operador', acesso: 'Ativo' }, duas[0], duas)).toBe('')
  })
  it('valida convites', () => {
    expect(validarConvite({ nome: ' ', email: 'a@b.c' }, equipeDemo)).toMatch(/nome/)
    expect(validarConvite({ nome: 'X', email: 'sem-arroba' }, equipeDemo)).toMatch(/e-mail/)
    expect(validarConvite({ nome: 'X', email: 'ANA@redeesperanca.org.br' }, equipeDemo)).toMatch(/Já existe/)
    expect(validarConvite({ nome: 'X', email: 'x@y.org' }, equipeDemo)).toBe('')
  })
})

describe('tela de usuários e permissões (#113)', () => {
  it('mostra indicadores e as 6 pessoas do protótipo', async () => {
    await abrir()
    expect(screen.getByText('4 pessoas')).toBeTruthy()
    expect(screen.getByText('1 convite')).toBeTruthy()
    expect(screen.getByText('1 pessoa')).toBeTruthy()
    expect(screen.getByText(/Expira em 09\/10\/2026/)).toBeTruthy()
    expect(linhasEquipe()).toBe(6)
  })
  it('filtra por papel e por busca', async () => {
    const user = await abrir()
    await user.selectOptions(screen.getAllByLabelText('Papel')[0], 'Leitura')
    expect(linhasEquipe()).toBe(2)
    await user.selectOptions(screen.getAllByLabelText('Papel')[0], '')
    await user.type(screen.getByLabelText('Buscar pessoa'), 'camila')
    expect(linhasEquipe()).toBe(1)
  })
  it('mostra a matriz de permissões por papel', async () => {
    await abrir()
    const linha = screen.getByText('Gerenciar usuários e permissões').closest('tr')
    expect(within(linha).getAllByLabelText('Permitido')).toHaveLength(1)
    expect(within(linha).getAllByLabelText('Não permitido')).toHaveLength(3)
  })
  it('suspende o acesso da pessoa selecionada', async () => {
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: 'Editar acesso de Paulo Souza' }))
    await user.click(within(edicao()).getByRole('button', { name: 'Suspender acesso' }))
    expect(screen.getByText('Paulo Souza').closest('tr').textContent).toContain('Suspenso')
    expect(screen.getByText('2 pessoas')).toBeTruthy()
  })
  it('não deixa alterar o próprio acesso de administradora', async () => {
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: /Ver permissões de Ana Silva/ }))
    expect(within(edicao()).getByRole('button', { name: 'Salvar permissões' }).disabled).toBe(true)
    expect(within(edicao()).getByRole('button', { name: 'Suspender acesso' }).disabled).toBe(true)
    expect(screen.getByText(/não pode ser alterado por aqui/)).toBeTruthy()
  })
  it('reativa o acesso suspenso', async () => {
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: 'Reativar acesso de Camila Ferreira' }))
    expect(screen.getByText('Camila Ferreira').closest('tr').textContent).toContain('Ativo')
    expect(screen.getByText('0 pessoas')).toBeTruthy()
  })
  it('reenvia convite sem enviar e-mail de verdade', async () => {
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: 'Reenviar convite de Luiza Martins' }))
    expect(screen.getByText(/Convite reenviado na demonstração/)).toBeTruthy()
  })
  it('convida uma pessoa e recusa e-mail repetido', async () => {
    const user = await abrir()
    await user.click(screen.getByRole('button', { name: /Convidar pessoa/ }))
    let dialogo = screen.getByRole('dialog')
    await user.type(within(dialogo).getByLabelText(/Nome/), 'Novo Membro')
    await user.type(within(dialogo).getByLabelText(/E-mail/), 'ana@redeesperanca.org.br')
    await user.click(within(dialogo).getByRole('button', { name: /Registrar convite/ }))
    expect(within(dialogo).getByRole('alert').textContent).toMatch(/Já existe/)
    await user.clear(within(dialogo).getByLabelText(/E-mail/))
    await user.type(within(dialogo).getByLabelText(/E-mail/), 'novo@redeesperanca.org.br')
    await user.click(within(dialogo).getByRole('button', { name: /Registrar convite/ }))
    expect(screen.queryByRole('dialog')).toBe(null)
    expect(screen.getByText('Novo Membro').closest('tr').textContent).toContain('Convite pendente')
    expect(screen.getByText('2 convites')).toBeTruthy()
  })
})
