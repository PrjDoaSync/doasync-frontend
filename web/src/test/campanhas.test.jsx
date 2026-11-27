import { describe, expect, it } from 'vitest'
import { validarEdicao } from '../utils/campanhas'

describe('validarEdicao (#92)', () => {
  const campanha = { arrecadado: 18400, criadaEm: '2026-10-01' }
  const ok = { nome: 'A', descricao: 'B', encerraEm: '2026-10-20', meta: '30000' }
  it('aceita dados válidos', () => expect(validarEdicao(ok, campanha)).toEqual({}))
  it('recusa meta menor que o recebido e término anterior ao início', () => {
    const erros = validarEdicao({ ...ok, meta: '1000', encerraEm: '2026-09-01' }, campanha)
    expect(erros.meta).toMatch(/menor que o total recebido/)
    expect(erros.encerraEm).toMatch(/posterior à data de início/)
  })
  it('recusa campos obrigatórios vazios', () => {
    expect(Object.keys(validarEdicao({ ...ok, nome: ' ', descricao: '' }, campanha))).toEqual(['nome', 'descricao'])
  })
})

