import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import api from '../services/api'
import { adaptadorApiPadrao } from './fixtures/apiCampanhas'

// Telas integradas leem a API: nos testes ela é simulada com fixtures do contrato.
// Testes que precisam de outra resposta trocam api.defaults.adapter e ela volta aqui.
beforeEach(() => {
  api.defaults.adapter = adaptadorApiPadrao
})
afterEach(() => cleanup())
window.scrollTo = vi.fn()
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}
