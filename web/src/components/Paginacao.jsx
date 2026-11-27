import { Botao } from './Ui'

// Paginação local de listas já carregadas (a API limita `limit` a 50; as telas leem todas as
// páginas e paginam aqui). `pagina` começa em 1. Não renderiza nada com uma página só.
export default function Paginacao({ pagina, total, porPagina, onPagina, rotulo = 'Paginação' }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  if (paginas <= 1) return null
  return (
    <nav className="paginacao" aria-label={rotulo}>
      <Botao secundario disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)}>
        Anterior
      </Botao>
      <span aria-live="polite">
        Página {pagina} de {paginas}
      </span>
      <Botao secundario disabled={pagina >= paginas} onClick={() => onPagina(pagina + 1)}>
        Próxima
      </Botao>
    </nav>
  )
}

