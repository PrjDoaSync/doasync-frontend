import api from './api'
import { limparSessao, salvarSessao } from './token'

export const authService = {
  // POST /auth/login → { token, tipoToken, expiraEm, usuario }; guarda a sessão para as próximas chamadas.
  entrar: (email, senha) =>
    api.post('/auth/login', { email: email.trim(), senha }).then((r) => {
      const { token, expiraEm, usuario } = r.data.data
      const sessao = { token, expiraEm, usuario }
      salvarSessao(sessao)
      return sessao
    }),
  // O backend é stateless: sair é só descartar o token.
  sair: () => limparSessao(),
}
