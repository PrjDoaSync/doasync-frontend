import { describe, expect, it } from 'vitest'
import { checklist, prestacaoInicial, totalAplicado, validarDespesa } from '../utils/prestacao'

describe('regras da prestação de contas (#94)', () => {
  const campanha = { arrecadado: 8000 }
  it('soma as despesas e valida valor e descrição', () => {
    expect(totalAplicado([{ valor: 100 }, { valor: 50.5 }])).toBe(150.5)
    expect(Object.keys(validarDespesa({ descricao: ' ', valor: '0' }, campanha, []))).toEqual(['descricao', 'valor'])
  })
  it('recusa despesa que ultrapassa o arrecadado', () => {
    const erros = validarDespesa({ descricao: 'X', valor: '500' }, campanha, [{ valor: 7800 }])
    expect(erros.valor).toMatch(/não pode passar do arrecadado/)
  })
  it('exige despesa, relato, anexo e declaração para publicar', () => {
    expect(checklist(prestacaoInicial(), false).every((i) => i.ok)).toBe(false)
    const completa = { despesas: [{}], relato: 'ok', anexos: [{}], publicada: false }
    expect(checklist(completa, true).every((i) => i.ok)).toBe(true)
  })
})
