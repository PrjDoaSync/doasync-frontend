import api from './api'
import { mapPaginado } from './mappers'

const STATUS_USUARIO = { ATIVO: 'Ativo', INATIVO: 'Inativo' }
const TIPO_USUARIO = { PESSOA_FISICA: 'Pessoa física', PESSOA_JURIDICA: 'Pessoa jurídica', ENTIDADE: 'Entidade', ADMIN: 'Administrador' }

// UsuarioResposta de GET /usuarios (contrato, rota 21) → formato das telas.
export function mapUsuario(u) {
  return {
    id: u.id,
    nome: u.nome ?? '',
    email: u.email ?? '',
    tipoApi: u.tipo,
    tipo: TIPO_USUARIO[u.tipo] ?? u.tipo ?? '',
    statusApi: u.status,
    status: STATUS_USUARIO[u.status] ?? u.status ?? '',
    dataCadastro: u.dataCadastro ?? '',
    documento: u.cnpj || u.cpf || '',
    razaoSocial: u.razaoSocial ?? '',
    entidadeId: u.entidadeId ?? null,
    statusEntidadeApi: u.statusEntidade ?? null,
  }
}

// Lê todas as páginas (limit máximo 50); busca e filtros adicionais ficam na tela.
async function todasAsPaginas(params, config) {
  const pagina = (page) =>
    api.get('/usuarios', { ...config, params: { ...params, page, limit: 50 } }).then((r) => mapPaginado(r.data, mapUsuario))
  const primeira = await pagina(1)
  const itens = [...primeira.itens]
  for (let page = 2; page <= primeira.totalPaginas; page++) itens.push(...(await pagina(page)).itens)
  return itens
}

export const usuariosService = {
  // GET /usuarios (ADMIN), com filtro opcional por tipo (ex.: ENTIDADE para a aprovação).
  listar: ({ tipo } = {}, config) => todasAsPaginas(tipo ? { tipo } : {}, config),
  // PATCH /usuarios/{id}/status (ADMIN): ATIVO | INATIVO. O admin não desativa a própria conta (409).
  alterarStatus: (id, status) => api.patch(`/usuarios/${id}/status`, { status }).then((r) => r.data),
}
