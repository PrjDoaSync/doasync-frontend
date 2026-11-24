import {
  campanhas as campanhasBase,
  doacoes as doacoesBase,
  entidades,
} from './dados'

const imagens = [
  '/images/alimentos.jpg',
  '/images/educacao.jpg',
  '/images/agasalhos.jpg',
  '/images/cestas.jpg',
  '/images/abrigo.jpg',
  '/images/higiene.jpg',
]
export const categorias = [
  'Alimentação',
  'Educação',
  'Vestuário',
  'Infraestrutura',
  'Higiene',
]

export function criarDadosDemo() {
  const campanhas = campanhasBase.map((c, i) => ({
    ...c,
    entidadeId: entidades.find((e) => e.nome === c.entidade)?.id,
    imagem: imagens[i],
    cidade: c.id === 3 ? 'Campinas, SP' : 'São Paulo, SP',
    criadaEm: '2026-10-01',
    descricao:
      'Juntos, podemos transformar a realidade de famílias que precisam de apoio. Sua contribuição ajuda a levar cuidado, dignidade e novas oportunidades para a nossa comunidade.',
    itensMeta: 480,
    necessidades:
      c.id === 1
        ? [
            { nome: 'Cesta básica', meta: 200 },
            { nome: 'Kit de higiene', meta: 160 },
            { nome: 'Leite em pó', meta: 120 },
          ]
        : [],
    itensRecebidos: c.id === 1 ? 260 : c.id === 3 ? 200 : 80,
  }))
  const doacoes = doacoesBase.map((d, i) => ({
    ...d,
    campanhaId: i === 5 ? 2 : 1,
    entidadeId: campanhas[i === 5 ? 1 : 0].entidadeId,
    campanha: campanhas[i === 5 ? 1 : 0].nome,
    itens:
      i === 0
        ? [
            { nome: 'Cesta básica', quantidade: 2 },
            { nome: 'Kit de higiene', quantidade: 3 },
          ]
        : i === 4
          ? [{ nome: 'Cesta básica', quantidade: 10 }]
          : i === 6
            ? [{ nome: 'Kit de higiene', quantidade: 5 }]
            : [],
    doadorId: d.doador,
    valor:
      d.tipo === 'Financeira'
        ? Number(d.detalhe.replace(/[^\d,]/g, '').replace(',', '.'))
        : 0,
    quantidade: d.tipo === 'Itens' ? [5, 0, 0, 0, 10, 0, 5][i] : 0,
  }))
  // Lançamentos históricos mantêm os totais das campanhas reconciliados
  // com os indicadores financeiros, sem transformar pendências em receita.
  for (const campanha of campanhas) {
    const confirmado = doacoes
      .filter((d) => d.campanhaId === campanha.id && d.status === 'Confirmada')
      .reduce((s, d) => s + d.valor, 0)
    const valor = campanha.arrecadado - confirmado
    if (valor > 0)
      doacoes.push({
        id: `historico-${campanha.id}`,
        doador: `Apoiador de demonstração ${campanha.id}`,
        doadorId: `apoio-${campanha.id}`,
        tipo: 'Financeira',
        valor,
        quantidade: 0,
        detalhe: valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        pagamento: 'Confirmado',
        recebimento: 'Confirmado',
        destinacao: 'Não destinado',
        status: 'Confirmada',
        data:
          campanha.status === 'Encerrada'
            ? '2026-08-20'
            : `2026-10-0${campanha.id}`,
        campanhaId: campanha.id,
        entidadeId: campanha.entidadeId,
        campanha: campanha.nome,
      })
  }
  return {
    campanhas,
    doacoes,
    entidades,
    entidade: {
      id: 1,
      nome: 'Rede Esperança',
      cnpj: '11.222.333/0001-81',
      email: 'contato@redeesperanca.org.br',
      telefone: '(11) 3456-7890',
      area: 'Assistência social e alimentação',
      cidade: 'São Paulo, SP',
      responsavel: 'Ana Silva',
      descricao:
        'Conectamos solidariedade e transformação para cuidar de quem mais precisa.',
      site: '',
      documentos: [],
    },
    usuarios: [
      {
        id: 1,
        nome: 'Ana Silva',
        email: 'ana@redeesperanca.org.br',
        papel: 'Administradora',
        status: 'Ativo',
      },
      {
        id: 2,
        nome: 'Paulo Souza',
        email: 'paulo@redeesperanca.org.br',
        papel: 'Operador',
        status: 'Ativo',
      },
      {
        id: 3,
        nome: 'Mariana Lima',
        email: 'mariana@redeesperanca.org.br',
        papel: 'Consulta',
        status: 'Inativo',
      },
    ],
    itens: [
      {
        id: 1,
        nome: 'Cesta básica',
        recebido: 200,
        destinado: 80,
        unidade: 'unidades',
      },
      {
        id: 2,
        nome: 'Kit de higiene',
        recebido: 80,
        destinado: 20,
        unidade: 'unidades',
      },
      {
        id: 3,
        nome: 'Leite em pó',
        recebido: 120,
        destinado: 45,
        unidade: 'unidades',
      },
    ],
    movimentos: [
      {
        id: 1,
        itemId: 1,
        item: 'Cesta básica',
        tipo: 'Entrada',
        quantidade: 200,
        destino: 'Campanha Mesa solidária',
        data: '2026-10-06',
      },
      {
        id: 2,
        itemId: 1,
        item: 'Cesta básica',
        tipo: 'Saída',
        quantidade: 80,
        destino: 'Famílias atendidas',
        data: '2026-10-08',
      },
    ],
  }
}

export function carregarDemo({ signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject({ cancelled: true })
      return
    }
    const cancelar = () => {
      clearTimeout(timer)
      reject({ cancelled: true })
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', cancelar)
      resolve(criarDadosDemo())
    }, 220)
    signal?.addEventListener('abort', cancelar, { once: true })
  })
}
