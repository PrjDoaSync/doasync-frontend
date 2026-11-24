// Sessão emitida por POST /auth/login: { token, expiraEm, usuario }.
// O acesso ao localStorage pode falhar (navegação privada, bloqueio de dados do site),
// por isso cada chamada é protegida; sem armazenamento a sessão vale até recarregar a página.
const CHAVE = 'doasync.sessao'

// Disparado quando a sessão é encerrada fora do AuthProvider (ex.: 401 da API).
export const EVENTO_SESSAO_ENCERRADA = 'doasync:sessao-encerrada'

let emMemoria = null

export function salvarSessao(sessao) {
  emMemoria = sessao
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    // Fica só em memória.
  }
}

export function limparSessao() {
  emMemoria = null
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Nada a limpar.
  }
}

function ler() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : emMemoria
  } catch {
    return emMemoria
  }
}

// Sessão válida ou null; uma sessão expirada é descartada.
export function obterSessao() {
  const sessao = ler()
  if (!sessao?.token) return null
  if (sessao.expiraEm && Date.parse(sessao.expiraEm) <= Date.now()) {
    limparSessao()
    return null
  }
  return sessao
}

export function obterToken() {
  return obterSessao()?.token ?? null
}
