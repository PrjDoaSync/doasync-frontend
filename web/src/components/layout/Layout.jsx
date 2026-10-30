import { NavLink, Outlet } from 'react-router-dom'

const ITENS_MENU = [
  { rotulo: 'Dashboard', para: null },
  { rotulo: 'Campanhas', para: '/campanhas' },
  { rotulo: 'Doações', para: '/doacoes' },
  { rotulo: 'Entidades', para: '/entidades' },
  { rotulo: 'Relatórios', para: null },
  { rotulo: 'Configurações', para: null },
]

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__marca">
          <span className="sidebar__logo" aria-hidden="true">♥</span>
          DoaSync
        </div>
        <p className="sidebar__entidade">Rede Esperança</p>
        <nav aria-label="Principal">
          {ITENS_MENU.map((item) =>
            item.para ? (
              <NavLink key={item.rotulo} to={item.para} className="sidebar__link">
                {item.rotulo}
              </NavLink>
            ) : (
              // Telas de outras issues (Dashboard, Relatórios, Configurações).
              <span key={item.rotulo} className="sidebar__link sidebar__link--desativado" aria-disabled="true">
                {item.rotulo}
              </span>
            ),
          )}
        </nav>
      </aside>

      <div className="layout__principal">
        <header className="topo">
          <span className="topo__usuario">
            <span className="topo__avatar" aria-hidden="true">AS</span>
            <span>
              <strong>Ana Silva</strong>
              <small>Administradora</small>
            </span>
          </span>
        </header>
        <main className="conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
