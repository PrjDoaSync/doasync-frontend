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
  // POST /doadores (público) → { id, nome, email, tipo, dataCadastro }. Não autentica: entrar depois.
  cadastrarDoador: (corpo) => api.post('/doadores', corpo).then((r) => r.data.data),
  // POST /entidades (público) → EntidadeResposta com statusAprovacao PENDENTE. Não autentica.
  cadastrarEntidade: (corpo) => api.post('/entidades', corpo).then((r) => r.data.data),
  // O backend é stateless: sair é só descartar o token.
  sair: () => limparSessao(),
}
