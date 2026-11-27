import { describe, expect, it } from 'vitest'
import { IMAGEM_PADRAO, mapCampanha, mapDoacao, mapPaginado, mapStatusCampanha } from '../services/mappers'

// Exemplo real devolvido por GET /api/v1/campanhas/{id} (doasync-backend, perfil dev).
const campanhaApi = {
  id: 'd070d076-f9e3-49b9-933c-4e5fce8e1765',
  titulo: 'Campanha Teste',
  descricao: 'Desc',
  categoria: 'Saude',
  metaValor: 1000.0,
  valorArrecadado: 250.0,
  percentualAtingido: 25.0,
  dataInicio: '2026-11-01',
  dataFim: '2026-12-31',
  status: 'ATIVA',
  recebendoDoacoes: true,
  imagemUrl: null,
  motivoDesativacao: null,
  entidade: { id: 'a36230be-7e8d-4b59-b3ed-2fede3a384d0', razaoSocial: 'APAE Teste', nomeFantasia: null },
  createdAt: '2026-11-23T22:08:45.123Z',
  updatedAt: '2026-11-23T22:08:45.123Z',
  ultimasDoacoes: [
    { valor: 250.0, dataDoacao: '2026-11-23T22:08:59.653Z', anonima: false, nomeDoador: 'Joao' },
  ],
}

describe('mapCampanha', () => {
  it('converte os campos da API para o formato das telas', () => {
    expect(mapCampanha(campanhaApi)).toMatchObject({
      id: campanhaApi.id,
      nome: 'Campanha Teste',
      categoria: 'Saude',
      entidade: 'APAE Teste',
      entidadeId: campanhaApi.entidade.id,
      meta: 1000,
      arrecadado: 250,
      percentual: 25,
      status: 'Ativa',
      recebendoDoacoes: true,
      iniciaEm: '2026-11-01',
      encerraEm: '2026-12-31',
      criadaEm: '2026-11-23',
      imagem: IMAGEM_PADRAO,
      ultimasDoacoes: [{ valor: 250, data: '2026-11-23', anonima: false, doador: 'Joao' }],
    })
  })

  it('prefere o nome fantasia e a imagem enviada pela API', () => {
    const c = mapCampanha({
      ...campanhaApi,
      imagemUrl: 'https://cdn.exemplo.com/capa.jpg',
      entidade: { id: 'x', razaoSocial: 'Associação', nomeFantasia: 'APAE SP' },
    })
    expect(c.entidade).toBe('APAE SP')
    expect(c.imagem).toBe('https://cdn.exemplo.com/capa.jpg')
  })

  it('tolera campos ausentes sem quebrar as telas', () => {
    expect(mapCampanha({ id: '1' })).toMatchObject({
      nome: '',
      entidade: '',
      entidadeId: null,
      meta: 0,
      arrecadado: 0,
      status: '',
      necessidades: [],
      ultimasDoacoes: [],
    })
  })
})

describe('mapStatusCampanha', () => {
  it.each([
    ['RASCUNHO', 'Rascunho'],
    ['AGENDADA', 'Agendada'],
    ['ATIVA', 'Ativa'],
    ['ENCERRADA', 'Encerrada'],
    ['DESATIVADA', 'Desativada'],
  ])('%s → %s', (api, tela) => {
    expect(mapStatusCampanha(api)).toBe(tela)
  })
})

describe('mapDoacao', () => {
  it('converte DoacaoResponse e trata doador omitido (LGPD)', () => {
    const api = {
      id: 'd1', codigoComprovante: 'DS-ABC', valor: 50.0, formaPagamento: 'PIX', status: 'CONFIRMADA',
      anonima: true, dataDoacao: '2026-11-23T22:08:59Z', campanha: { id: 'c1', titulo: 'Campanha' },
      entidade: { id: 'e1', razaoSocial: 'APAE Teste', nomeFantasia: null }, doador: { nome: 'Doador anônimo' },
    }
    expect(mapDoacao(api)).toEqual({
      id: 'd1', comprovante: 'DS-ABC', valor: 50, formaPagamento: 'PIX', status: 'Confirmada', anonima: true,
      observacao: '', data: '2026-11-23T22:08:59Z', campanhaId: 'c1', campanha: 'Campanha',
      entidadeId: 'e1', entidade: 'APAE Teste', doador: 'Doador anônimo', doadorId: null,
    })
  })
})

describe('mapPaginado', () => {
  it('converte o envelope { data, meta }', () => {
    const r = mapPaginado(
      { data: [campanhaApi], meta: { total: 11, page: 2, limit: 10, totalPages: 2 } },
      mapCampanha,
    )
    expect(r).toMatchObject({ total: 11, pagina: 2, limite: 10, totalPaginas: 2 })
    expect(r.itens[0].nome).toBe('Campanha Teste')
  })
  it('aceita resposta sem meta', () => {
    expect(mapPaginado({ data: [] }, mapCampanha)).toEqual({
      itens: [],
      total: 0,
      pagina: 1,
      limite: 0,
      totalPaginas: 1,
    })
  })
})
