// Regras do assistente "Criar campanha" (#89 e #90). Funções puras para facilitar os testes.
import { validarPeriodo } from './gestao'

export const MAX_ITENS = 10

// Imagens locais de demonstração; o envio de arquivos depende da integração.
export const IMAGENS_CAMPANHA = [
  { arquivo: '/images/alimentos.jpg', rotulo: 'Alimentos' },
  { arquivo: '/images/cestas.jpg', rotulo: 'Cestas básicas' },
  { arquivo: '/images/educacao.jpg', rotulo: 'Educação' },
  { arquivo: '/images/agasalhos.jpg', rotulo: 'Agasalhos' },
  { arquivo: '/images/higiene.jpg', rotulo: 'Higiene' },
  { arquivo: '/images/abrigo.jpg', rotulo: 'Abrigo' },
]

// Etapa 1: dados básicos. Devolve a mensagem de erro, ou '' se estiver tudo certo.
export function validarBasicos(f) {
  const periodo = validarPeriodo(f.inicio, f.encerraEm)
  if (periodo) return periodo
  if (!String(f.nome ?? '').trim() || !String(f.descricao ?? '').trim()) {
    return 'Informe o nome e a descrição da campanha.'
  }
  return ''
}

// Etapa 2: meta financeira e itens necessários (os itens são opcionais).
export function validarMetas({ meta, itens }) {
  const valor = Number(meta)
  if (!Number.isFinite(valor) || valor <= 0) {
    return 'Informe uma meta financeira maior que zero.'
  }
  if (itens.length > MAX_ITENS) return `Informe no máximo ${MAX_ITENS} itens.`
  return ''
}

// Valida um item novo contra a lista atual. Devolve a mensagem de erro, ou ''.
export function validarNovoItem({ nome, quantidade }, itens) {
  const limpo = String(nome ?? '').trim()
  if (!limpo) return 'Informe o nome do item.'
  const q = Number(quantidade)
  if (!Number.isInteger(q) || q <= 0) return 'Informe uma quantidade inteira maior que zero.'
  if (itens.some((i) => i.nome.toLowerCase() === limpo.toLowerCase())) {
    return 'Esse item já está na lista.'
  }
  if (itens.length >= MAX_ITENS) return `Informe no máximo ${MAX_ITENS} itens.`
  return ''
}

// Etapa 3: só publica com encerramento a partir de hoje e a confirmação marcada.
export function validarPublicacao({ encerraEm, confirmado }, hoje) {
  if (encerraEm < hoje) return 'Para publicar, a data de encerramento deve ser hoje ou posterior.'
  if (!confirmado) return 'Confirme que as informações estão corretas para publicar.'
  return ''
}

export function montarCampanha({ id, basicos, meta, itens, imagem, entidade, status }) {
  return {
    id,
    nome: basicos.nome.trim(),
    descricao: basicos.descricao.trim(),
    categoria: basicos.categoria,
    meta: Number(meta),
    arrecadado: 0,
    entidade: entidade.nome,
    entidadeId: entidade.id,
    cidade: basicos.cidade,
    criadaEm: basicos.inicio,
    encerraEm: basicos.encerraEm,
    status,
    imagem,
    necessidades: itens.map(({ nome, meta: m }) => ({ nome, meta: m })),
    itensMeta: itens.reduce((soma, i) => soma + i.meta, 0),
    itensRecebidos: 0,
  }
}
