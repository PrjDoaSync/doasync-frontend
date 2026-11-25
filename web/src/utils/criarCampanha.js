// Regras do formulário de campanha (POST /campanhas e PATCH /campanhas/{id}). Funções puras.
// Espelham o backend: título ≤ 200, descrição ≤ 10.000, meta ≥ 0,01 com até 2 casas,
// dataFim ≥ dataInicio, categoria ≤ 200 e imagem só por URL http(s) ≤ 2.048.
import { validarPeriodo } from './gestao'

// Capas disponíveis no próprio site. A API guarda a imagem como URL: enviamos a URL absoluta.
export const IMAGENS_CAMPANHA = [
  { arquivo: '/images/alimentos.jpg', rotulo: 'Alimentos' },
  { arquivo: '/images/cestas.jpg', rotulo: 'Cestas básicas' },
  { arquivo: '/images/educacao.jpg', rotulo: 'Educação' },
  { arquivo: '/images/agasalhos.jpg', rotulo: 'Agasalhos' },
  { arquivo: '/images/higiene.jpg', rotulo: 'Higiene' },
  { arquivo: '/images/abrigo.jpg', rotulo: 'Abrigo' },
]

// Sugestões para o campo de categoria (a API aceita texto livre).
export const CATEGORIAS_SUGERIDAS = ['Alimentação', 'Assistência social', 'Educação', 'Higiene', 'Infraestrutura', 'Saúde', 'Vestuário']

export const CAMPANHA_VAZIA = { titulo: '', categoria: '', descricao: '', dataInicio: '', dataFim: '', metaValor: '', imagemUrl: '' }

const ehUrlHttp = (v) => {
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol)
  } catch {
    return false
  }
}

// Caminho local (/images/...) vira URL absoluta do site; URLs completas passam como estão.
export const urlDaImagem = (valor, origem = globalThis.location?.origin ?? '') =>
  valor && valor.startsWith('/') ? `${origem}${valor}` : valor

// Retorna { campo: mensagem }. `publicar` exige a confirmação e encerramento a partir de hoje.
export function validarCampanha(f, { publicar = false, confirmado = false, hoje } = {}) {
  const erros = {}
  if (!f.titulo.trim()) erros.titulo = 'Informe o título da campanha.'
  else if (f.titulo.trim().length > 200) erros.titulo = 'Use até 200 caracteres.'
  if (!f.descricao.trim()) erros.descricao = 'Informe a descrição da campanha.'
  else if (f.descricao.trim().length > 10000) erros.descricao = 'Use até 10.000 caracteres.'
  if (f.categoria.trim().length > 200) erros.categoria = 'Use até 200 caracteres.'
  const meta = String(f.metaValor).replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(meta) || Number(meta) < 0.01) erros.metaValor = 'Informe uma meta maior que zero, com até duas casas decimais.'
  if (!f.dataInicio) erros.dataInicio = 'Informe a data de início.'
  if (!f.dataFim) erros.dataFim = 'Informe a data de encerramento.'
  else if (validarPeriodo(f.dataInicio, f.dataFim)) erros.dataFim = 'O encerramento deve ser no mesmo dia ou depois do início.'
  else if (publicar && hoje && f.dataFim < hoje) erros.dataFim = 'Para publicar, o encerramento deve ser hoje ou depois.'
  const imagem = urlDaImagem(f.imagemUrl.trim())
  if (imagem && (!ehUrlHttp(imagem) || imagem.length > 2048)) erros.imagemUrl = 'Use um endereço de imagem começando com http:// ou https://.'
  if (publicar && !confirmado) erros.confirmado = 'Confirme que as informações estão corretas para publicar.'
  return erros
}

// Corpo de POST/PATCH /campanhas: omite os opcionais vazios.
export function corpoCampanha(f) {
  const imagem = urlDaImagem(f.imagemUrl.trim())
  return {
    titulo: f.titulo.trim(),
    descricao: f.descricao.trim(),
    metaValor: Number(String(f.metaValor).replace(',', '.')),
    dataInicio: f.dataInicio,
    dataFim: f.dataFim,
    ...(imagem && { imagemUrl: imagem }),
    ...(f.categoria.trim() && { categoria: f.categoria.trim() }),
  }
}
