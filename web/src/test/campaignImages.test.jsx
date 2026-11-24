import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampaignImages from '../components/CampaignImages'

function Editor() {
  const [imagem, setImagem] = useState('')
  const [galeria, setGaleria] = useState([])
  return <CampaignImages imagem={imagem} onImagem={setImagem} galeria={galeria} onGaleria={setGaleria} />
}

const png = (nome) => new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6ZCEAAAAASUVORK5CYII='), (c) => c.charCodeAt(0))], nome, { type: 'image/png' })

// jsdom does not decode images; control browser load/error events explicitly.
beforeEach(() => vi.stubGlobal('Image', class {
  set src(_valor) { queueMicrotask(() => this.onload()) }
}))
afterEach(() => vi.unstubAllGlobals())

describe('Imagens locais da campanha', () => {
  it('mostra a capa e permite adicionar e remover fotos da galeria', async () => {
    const user = userEvent.setup()
    render(<Editor />)
    await user.upload(screen.getByLabelText('Escolher capa do dispositivo'), png('capa.png'))
    expect((await screen.findByRole('img', { name: 'Prévia da capa escolhida' })).getAttribute('src')).toMatch(/^data:image\/png;base64,/)
    await user.upload(screen.getByLabelText('Adicionar fotos à galeria'), png('galeria.png'))
    expect(await screen.findByRole('img', { name: 'galeria.png' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remover foto galeria.png' }))
    expect(screen.getByText('Nenhuma foto na galeria.')).toBeTruthy()
  })
  it('recusa SVG e imagens acima do limite sem trocar a capa', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<Editor />)
    await user.upload(screen.getByLabelText('Escolher capa do dispositivo'), new File(['<svg/>'], 'vetor.svg', { type: 'image/svg+xml' }))
    expect(screen.getByRole('alert').textContent).toContain('até 2 MB')
    await user.upload(screen.getByLabelText('Escolher capa do dispositivo'), new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' }))
    expect(screen.queryByRole('img')).toBe(null)
  })
  it('recusa mais de três fotos de uma vez', async () => {
    const user = userEvent.setup()
    render(<Editor />)
    await user.upload(screen.getByLabelText('Adicionar fotos à galeria'), [png('1.png'), png('2.png'), png('3.png'), png('4.png')])
    expect(screen.getByRole('alert').textContent).toContain('até 3 imagens')
    expect(screen.getByText('Nenhuma foto na galeria.')).toBeTruthy()
  })
  it('mantém a capa anterior quando o navegador rejeita uma imagem corrompida', async () => {
    const user = userEvent.setup()
    render(<Editor />)
    await user.upload(screen.getByLabelText('Escolher capa do dispositivo'), png('boa.png'))
    const previa = await screen.findByRole('img', { name: 'Prévia da capa escolhida' })
    const anterior = previa.getAttribute('src')
    vi.stubGlobal('Image', class {
      set src(_valor) { queueMicrotask(() => this.onerror()) }
    })
    await user.upload(screen.getByLabelText('Escolher capa do dispositivo'), new File(['corrompida'], 'quebrada.png', { type: 'image/png' }))
    expect((await screen.findByRole('alert')).textContent).toContain('corrompida')
    expect(previa.getAttribute('src')).toBe(anterior)
  })
})
