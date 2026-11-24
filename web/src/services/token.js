// Guarda o JWT emitido por POST /auth/login. O acesso ao localStorage pode falhar
// (navegação privada, bloqueio de dados do site), por isso cada chamada é protegida.
const CHAVE = 'doasync.token'

export function obterToken() {
  try {
    return localStorage.getItem(CHAVE)
  } catch {
    return null
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE, token)
  } catch {
    // Sem armazenamento disponível: a sessão vale só até recarregar a página.
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Nada a limpar.
  }
}
