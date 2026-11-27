// Busca e filtro da lista pública de entidades (GET /entidades não filtra nem pagina).
const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')

export function filtrarEntidadesPublicas(entidades, { busca = '', area = '' } = {}) {
  const termo = normalizar(busca.trim())
  return entidades
    .filter((e) => !area || e.areaAtuacao === area)
    .filter(
      (e) =>
        !termo ||
        normalizar([e.nome, e.razaoSocial, e.areaAtuacao, e.descricao, e.endereco?.cidade].join(' ')).includes(termo),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
