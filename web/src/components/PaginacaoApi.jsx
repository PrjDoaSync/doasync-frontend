import { Botao } from './Ui'

export default function PaginacaoApi({ dados, ocupado, selecionar }) {
  if (dados.totalPaginas < 2) return null
  return (
    <nav className="camp-acoes" aria-label="Paginação">
      <Botao secundario disabled={ocupado || dados.pagina <= 1} onClick={() => selecionar(dados.pagina - 1)}>Anterior</Botao>
      <span role="status">Página {dados.pagina} de {dados.totalPaginas}</span>
      <Botao secundario disabled={ocupado || dados.pagina >= dados.totalPaginas} onClick={() => selecionar(dados.pagina + 1)}>Próxima</Botao>
    </nav>
  )
}
