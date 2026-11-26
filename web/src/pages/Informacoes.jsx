import { Link } from 'react-router-dom'
import { Secao } from '../components/Ui'

const titulos = { ajuda: 'Ajuda', privacidade: 'Privacidade', termos: 'Termos de uso' }

export default function Informacoes({ pagina }) {
  return (
    <section className="public-section">
      <div className="public-page-title"><h1>{titulos[pagina]}</h1></div>
      {pagina === 'ajuda' ? (
        <Secao titulo="Perguntas frequentes">
          <details open><summary>Como encontro uma campanha?</summary><p>Abra <Link to="/explorar">Campanhas</Link> e use a busca para localizar uma causa.</p></details>
          <details><summary>Onde consulto meus registros?</summary><p>Entre na sua conta e abra <Link to="/minhas-doacoes">Minhas doações</Link> para consultar os registros feitos com ela.</p></details>
          <details><summary>Como acesso a gestão?</summary><p>Entre com uma conta de entidade ou de administrador.</p></details>
        </Secao>
      ) : (
        <Secao titulo="Documento indisponível"><p>A versão oficial deste documento ainda não foi publicada.</p></Secao>
      )}
    </section>
  )
}
