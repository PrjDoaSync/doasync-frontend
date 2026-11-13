import { Link, NavLink, useLocation } from 'react-router-dom'
import { Marca, Botao, Icon } from '../Ui'

export default function PublicHeader() {
  const { pathname } = useLocation()
  const isLogin = pathname === '/login'

  // Ativação da navegação pública de acordo com a rota
  const isCampanhasActive =
    pathname === '/explorar' ||
    (pathname.startsWith('/campanhas/') &&
      !pathname.includes('/editar') &&
      !pathname.includes('/acompanhamento') &&
      !pathname.includes('/prestacao-de-contas')) ||
    pathname.startsWith('/doar/')

  const isEntidadesActive =
    pathname === '/entidades-publicas' || pathname === '/entidades'

  return (
    <header className="public-header" role="banner">
      <div className="public-header__inner">
        <div className="public-header__marca">
          <Marca />
        </div>

        {isLogin ? (
          <div className="public-header__ajuda">
            <Link
              to="/ajuda"
              className="public-header__link-ajuda"
              aria-label="Precisa de ajuda?"
            >
              <Icon nome="ajuda" size={18} />
              <span>Precisa de ajuda?</span>
            </Link>
          </div>
        ) : (
          <>
            <nav className="public-header__nav" aria-label="Navegação pública">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `public-header__link ${isActive ? 'active' : ''}`
                }
              >
                Início
              </NavLink>

              <NavLink
                to="/explorar"
                className={`public-header__link ${isCampanhasActive ? 'active' : ''}`}
              >
                Campanhas
              </NavLink>

              <NavLink
                to="/entidades-publicas"
                className={`public-header__link ${isEntidadesActive ? 'active' : ''}`}
              >
                Entidades
              </NavLink>
            </nav>

            <div className="public-header__actions">
              <Link
                to="/login"
                className="public-header__link-entidade"
                aria-label="Ir para área da entidade"
              >
                Área da entidade
              </Link>
              <Botao
                para="/login"
                secundario
                className="public-header__btn-entrar"
              >
                Entrar
              </Botao>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
