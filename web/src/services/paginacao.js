// Mantém a busca e os filtros locais das telas sobre todos os registros da API.
export async function carregarPaginas(carregar, mapear) {
  const primeira = await carregar(1)
  const itens = primeira.data.map(mapear)
  for (let page = 2; page <= (primeira.meta?.totalPages ?? 1); page++) {
    const resposta = await carregar(page)
    itens.push(...resposta.data.map(mapear))
  }
  return { itens, total: primeira.meta?.total ?? itens.length }
}
