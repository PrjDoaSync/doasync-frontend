import { useState } from 'react'
import { Aviso, Botao, Campo } from './Ui'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const lerImagem = (arquivo) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const imagem = new Image()
    imagem.onload = () => resolve({ nome: arquivo.name, url: reader.result })
    imagem.onerror = () => reject(new Error('A imagem está corrompida ou não pode ser aberta. Escolha outro arquivo.'))
    imagem.src = reader.result
  }
  reader.onerror = () => reject(new Error('Não foi possível ler a imagem. Tente outro arquivo.'))
  reader.readAsDataURL(arquivo)
})

// Local previews only: bounded data URLs survive navigation in the demo session.
export default function CampaignImages({ imagem, onImagem, galeria, onGaleria, disabled = false, onBusy }) {
  const [erro, setErro] = useState('')
  const [lendo, setLendo] = useState(false)
  async function selecionar(event, capa) {
    const arquivos = [...event.target.files]
    event.target.value = ''
    if (!arquivos.length) return
    setErro('')
    if (arquivos.some((arquivo) => !TIPOS.includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024)) {
      setErro('Escolha imagens JPG, PNG ou WebP de até 2 MB cada.')
      return
    }
    if (!capa && galeria.length + arquivos.length > 3) {
      setErro('A galeria pode ter até 3 imagens nesta demonstração.')
      return
    }
    setLendo(true)
    onBusy?.(true)
    try {
      const imagens = await Promise.all(arquivos.map(lerImagem))
      if (capa) onImagem(imagens[0].url)
      else onGaleria([...galeria, ...imagens])
    } catch (error) {
      setErro(error.message)
    } finally {
      setLendo(false)
      onBusy?.(false)
    }
  }
  return (
    <div className="pilha" aria-busy={lendo}>
      <Campo rotulo="Escolher capa do dispositivo" ajuda="JPG, PNG ou WebP, até 2 MB. A imagem fica somente nesta sessão.">
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || lendo} onChange={(event) => selecionar(event, true)} />
      </Campo>
      {imagem && <img className="imagem-previa" src={imagem} alt="Prévia da capa escolhida" />}
      <Campo rotulo="Adicionar fotos à galeria" ajuda="Até 3 imagens, de 2 MB cada; nenhum arquivo é enviado.">
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled || lendo || galeria.length >= 3} onChange={(event) => selecionar(event, false)} />
      </Campo>
      {lendo && <p role="status">Preparando imagens locais…</p>}
      {erro && <Aviso erro>{erro}</Aviso>}
      {galeria.length ? <div className="galeria-campanha">{galeria.map((foto, indice) => (
        <figure key={`${foto.nome}-${indice}`}>
          <img src={foto.url} alt={foto.nome} />
          <figcaption>{foto.nome}</figcaption>
          <Botao secundario disabled={disabled || lendo} onClick={() => onGaleria(galeria.filter((_, i) => i !== indice))} aria-label={`Remover foto ${foto.nome}`}>Remover</Botao>
        </figure>
      ))}</div> : <p role="status">Nenhuma foto na galeria.</p>}
    </div>
  )
}
