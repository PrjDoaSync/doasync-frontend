import { Link, NavLink, useLocation } from 'react-router-dom'
import { Marca, Botao } from '../Ui'
import { useAuth } from '../../hooks/useAuth'
import { acessaGestao } from '../../utils/auth'

export default function PublicHeader() {
  const { pathname } = useLocation()
  const { usuario, autenticado, sair } = useAuth()

  // Ativação da navegação pública de acordo com a rota
  const isCampanhasActive =
    pathname === '/explorar' ||
    (pathname.startsWith('/campanhas/') &&
      !pathname.includes('/editar') &&
      !pathname.includes('/acompanhamento') &&
      !pathname.includes('/prestacao-de-contas')) ||
    pathname.startsWith('/doar/')

  const isEntidadesActive = pathname === '/cadastro-entidade'

  return (
    <header className="public-header" role="banner">
      <div className="public-header__inner">
        <div className="public-header__marca">
          <Marca />
        </div>

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
            to="/cadastro-entidade"
            className={`public-header__link ${isEntidadesActive ? 'active' : ''}`}
          >
            Entidades
          </NavLink>
          <NavLink to="/minhas-doacoes" className={({ isActive }) => `public-header__link ${isActive ? 'active' : ''}`}>
            Meu histórico
          </NavLink>
        </nav>

        <div className="public-header__actions">
          {autenticado ? (
            <>
              {acessaGestao(usuario.tipo) && (
                <Link to="/dashboard" className="public-header__link-entidade">
                  Área de gestão
                </Link>
              )}
              <span className="public-header__usuario">Olá, {usuario.nome.split(' ')[0]}</span>
              <Botao secundario className="public-header__btn-entrar" onClick={sair}>
                Sair
              </Botao>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  )
}
