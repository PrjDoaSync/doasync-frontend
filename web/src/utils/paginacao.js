// Fatia da lista exibida na página atual (paginação local, `pagina` começa em 1).
export const fatiar = (lista, pagina, porPagina) => lista.slice((pagina - 1) * porPagina, pagina * porPagina)

export const totalPaginas = (total, porPagina) => Math.max(1, Math.ceil(total / porPagina))
