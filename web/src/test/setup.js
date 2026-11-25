import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import api from '../services/api'
import { limparSessao, salvarSessao } from '../services/token'
import { adaptadorApiPadrao, resetarEntidadesApi } from './fixtures/apiCampanhas'
import { SESSAO_ENTIDADE_TESTE } from './fixtures/sessao'

// Telas integradas leem a API: nos testes ela é simulada com fixtures do contrato.
// Testes que precisam de outra resposta trocam api.defaults.adapter e ela volta aqui.
beforeEach(() => {
  api.defaults.adapter = adaptadorApiPadrao
  resetarEntidadesApi()
  // As rotas de gestão exigem login: por padrão os testes rodam com uma entidade aprovada.
  // Testes de visitante chamam limparSessao() antes de renderizar.
  salvarSessao(SESSAO_ENTIDADE_TESTE)
})
afterEach(() => {
  cleanup()
  limparSessao()
})
window.scrollTo = vi.fn()
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}
