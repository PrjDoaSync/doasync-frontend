import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './authContextValue'
import { authService } from '../services/authService'
import { EVENTO_SESSAO_ENCERRADA, obterSessao, salvarSessao } from '../services/token'

// Sessão do usuário autenticado (POST /auth/login). `usuario` segue o contrato:
// { id, nome, email, tipo, entidadeId, statusEntidade }.
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(obterSessao)

  const sair = useCallback(() => {
    authService.sair()
    setSessao(null)
  }, [])

  async function entrar(email, senha) {
    const nova = await authService.entrar(email, senha)
    setSessao(nova)
    return nova.usuario
  }

  // Reflete na sessão os dados editados em Minha conta (PATCH /usuarios/me), como o nome.
  const atualizarUsuario = useCallback((parcial) => {
    setSessao((atual) => {
      if (!atual) return atual
      const nova = { ...atual, usuario: { ...atual.usuario, ...parcial } }
      salvarSessao(nova)
      return nova
    })
  }, [])

  // 401 da API com token encerra a sessão (interceptor em services/api.js).
  useEffect(() => {
    const encerrar = () => setSessao(null)
    window.addEventListener(EVENTO_SESSAO_ENCERRADA, encerrar)
    return () => window.removeEventListener(EVENTO_SESSAO_ENCERRADA, encerrar)
  }, [])

  // Encerra a sessão quando o token expira (padrão do backend: 8 horas).
  useEffect(() => {
    if (!sessao?.expiraEm) return undefined
    const restante = Date.parse(sessao.expiraEm) - Date.now()
    // setTimeout dispara na hora acima de 2^31-1 ms (~24,8 dias); limita o atraso.
    const timer = setTimeout(sair, Math.min(Math.max(restante, 0), 2 ** 31 - 1))
    return () => clearTimeout(timer)
  }, [sessao, sair])

  return (
    <AuthContext.Provider
      value={{ usuario: sessao?.usuario ?? null, autenticado: Boolean(sessao), entrar, sair, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}
