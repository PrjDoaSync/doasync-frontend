// Perfis que usam a área de gestão (tipos do backend: PESSOA_FISICA, PESSOA_JURIDICA, ENTIDADE, ADMIN).
export const acessaGestao = (tipo) => tipo === 'ENTIDADE' || tipo === 'ADMIN'

// Perfis que podem doar (POST /doacoes).
export const ehDoador = (tipo) => tipo === 'PESSOA_FISICA' || tipo === 'PESSOA_JURIDICA'

// Para onde cada perfil vai depois do login, quando não veio de uma rota protegida.
export const destinoPorTipo = (tipo) => (acessaGestao(tipo) ? '/dashboard' : '/')
