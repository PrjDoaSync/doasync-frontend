import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="public-footer" role="contentinfo">
      <div className="public-footer__inner">
        <div className="public-footer__left">
          <span>DoaSync · Conectando pessoas a causas</span>
        </div>
        <nav className="public-footer__links" aria-label="Links institucionais e suporte">
          <Link to="/ajuda" className="public-footer__link">
            Ajuda
          </Link>
          <Link to="/privacidade" className="public-footer__link">
            Privacidade
          </Link>
          <Link to="/termos" className="public-footer__link">
            Termos de uso
          </Link>
        </nav>
      </div>
    </footer>
  )
}
