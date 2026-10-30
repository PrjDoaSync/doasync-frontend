import { describe, expect, it } from 'vitest'
import {
  calcularIndicadores,
  filtrarRegistros,
  serieFinanceira,
  validarCnpj,
  validarPeriodo,
  valorDoacao,
} from '../utils/gestao'
import { movimentarEstoque } from '../utils/estoque'
import { carregarDemo, criarDadosDemo } from '../mocks/gestao'

describe('indicadores e filtros', () => {
  const registros = [
    {
      id: 1,
      doador: 'Ana',
      tipo: 'Financeira',
      valor: 50,
      status: 'Confirmada',
      data: '2026-10-01',
      campanhaId: 1,
      campanha: 'Mesa solidária',
    },
    {
      id: 2,
      doador: 'Ana',
      tipo: 'Financeira',
      valor: 30,
      status: 'Confirmada',
      data: '2026-10-02',
      campanhaId: 1,
    },
    {
      id: 3,
      doador: 'Beto',
      tipo: 'Itens',
      quantidade: 4,
      status: 'Confirmada',
      data: '2026-10-03',
      campanhaId: 2,
    },
    {
      id: 4,
      doador: 'Caio',
      tipo: 'Financeira',
      valor: 900,
      status: 'Pendente',
      data: '2026-10-03',
      campanhaId: 1,
    },
    {
      id: 5,
      doador: 'Dani',
      tipo: 'Financeira',
      valor: 800,
      status: 'Cancelada',
      data: '2026-10-04',
      campanhaId: 2,
    },
  ]
  it('exclui pagamentos pendentes e cancelados e conta doadores distintos', () => {
    expect(
      calcularIndicadores(
        [{ status: 'Ativa' }, { status: 'Encerrada' }],
        registros,
      ),
    ).toEqual({
      arrecadado: 80,
      doadores: 2,
      ativas: 1,
      concluidas: 50,
      itens: 4,
    })
  })
  it('trata um conjunto vazio sem NaN ou divisão por zero', () => {
    expect(calcularIndicadores([], [])).toEqual({
      arrecadado: 0,
      doadores: 0,
      ativas: 0,
      concluidas: 0,
      itens: 0,
    })
  })
  it('combina campanha, datas inclusivas, status e tipo', () => {
    expect(
      filtrarRegistros(registros, {
        campanhaId: '1',
        inicio: '2026-10-01',
        fim: '2026-10-02',
        status: 'Confirmada',
        tipo: 'Financeira',
      }).map((d) => d.id),
    ).toEqual([1, 2])
  })
  it('busca pelo nome da campanha sem diferenciar maiúsculas', () => {
    expect(
      filtrarRegistros(registros, { busca: ' MESA SOLIDÁRIA ' }).map(
        (d) => d.id,
      ),
    ).toEqual([1])
  })
  it('não inventa resultados para filtros sem correspondência', () => {
    expect(filtrarRegistros(registros, { inicio: '2027-01-01' })).toEqual([])
  })
  it('agrupa e ordena datas, acumulando somente pagamentos confirmados', () => {
    expect(serieFinanceira([...registros].reverse())).toEqual([
      { data: '2026-10-01', valor: 50, acumulado: 50 },
      { data: '2026-10-02', valor: 30, acumulado: 80 },
    ])
  })
  it('reconcilia as campanhas da amostra com os registros financeiros', () => {
    const dados = criarDadosDemo()
    for (const campanha of dados.campanhas) {
      expect(
        calcularIndicadores(
          [campanha],
          dados.doacoes.filter((d) => d.campanhaId === campanha.id),
        ).arrecadado,
      ).toBe(campanha.arrecadado)
    }
  })
})

describe('validação de entrada', () => {
  it.each(['0', '-10', 'abc', '10,999', '1.000,00', 'Infinity', ''])(
    'rejeita valor inválido %s',
    (valor) => expect(valorDoacao(valor)).toBe(null),
  )
  it.each([
    ['0,01', 0.01],
    ['100', 100],
    ['25.50', 25.5],
    ['R$ 30,50', 30.5],
  ])('interpreta %s sem perder centavos', (texto, numero) =>
    expect(valorDoacao(texto)).toBe(numero),
  )
  it('valida datas invertidas e permite um único dia', () => {
    expect(validarPeriodo('2026-10-10', '2026-10-01')).toBeTruthy()
    expect(validarPeriodo('2026-10-10', '2026-10-10')).toBe('')
  })
  it.each(['00000000000000', '11222333000180', '123', ''])(
    'rejeita CNPJ inválido %s',
    (numero) => expect(validarCnpj(numero)).toBe(false),
  )
  it('valida dígitos verificadores de CNPJ formatado', () =>
    expect(validarCnpj('11.222.333/0001-81')).toBe(true))
})

describe('estoque de demonstração', () => {
  const dados = {
    itens: [{ id: 1, nome: 'Cesta básica', recebido: 10, destinado: 3 }],
  }
  it('registra saída e mantém a amostra de origem intacta', () => {
    const resultado = movimentarEstoque(dados, {
      itemId: '1',
      tipo: 'Saída',
      quantidade: '4',
      destino: 'Famílias',
      data: '2026-10-29',
    })
    expect(resultado.itens[0].destinado).toBe(7)
    expect(dados.itens[0].destinado).toBe(3)
    expect(resultado.movimento.item).toBe('Cesta básica')
  })
  it.each([
    ['8', 'excede'],
    ['-2', 'inteira'],
    ['1.5', 'inteira'],
  ])('bloqueia saída inválida %s', (quantidade, mensagem) => {
    expect(() =>
      movimentarEstoque(dados, {
        itemId: 1,
        tipo: 'Saída',
        quantidade,
        destino: 'Famílias',
        data: '2026-10-29',
      }),
    ).toThrow(mensagem)
  })
})

describe('fonte de demonstração', () => {
  it('cancela carregamento ao desmontar sem devolver dados', async () => {
    const controller = new AbortController(),
      promise = carregarDemo({ signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toEqual({ cancelled: true })
  })
  it('devolve cópias independentes dos dados', async () => {
    const primeira = await carregarDemo(),
      segunda = criarDadosDemo()
    primeira.entidade.nome = 'Outra entidade'
    expect(segunda.entidade.nome).toBe('Rede Esperança')
  })
})
