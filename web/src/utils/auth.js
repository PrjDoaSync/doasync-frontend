// Perfis que usam a área de gestão (tipos do backend: PESSOA_FISICA, PESSOA_JURIDICA, ENTIDADE, ADMIN).
export const acessaGestao = (tipo) => tipo === 'ENTIDADE' || tipo === 'ADMIN'

// Para onde cada perfil vai depois do login, quando não veio de uma rota protegida.
export const destinoPorTipo = (tipo) => (acessaGestao(tipo) ? '/dashboard' : '/')
