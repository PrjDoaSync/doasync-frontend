import { describe, expect, it } from 'vitest'
import { valorDoacao } from '../utils/gestao'

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
