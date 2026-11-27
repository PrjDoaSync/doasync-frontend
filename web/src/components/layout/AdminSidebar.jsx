import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Icon, Marca } from '../Ui'

const menu = [
  ['dashboard', 'Dashboard', '/dashboard'],
  ['campanhas', 'Campanhas', '/campanhas'],
  ['doacoes', 'Doações', '/doacoes'],
  ['doadores', 'Doadores', '/doadores'],
  ['itens', 'Itens doados', '/itens'],
  ['relatorios', 'Relatórios', '/relatorios'],
  ['configuracoes', 'Configurações', '/configuracoes'],
]

export default function AdminSidebar() {
  const { usuario, sair } = useAuth()
  const admin = usuario?.tipo === 'ADMIN'
  const [aberto, setAberto] = useState(false)

  return (
    <aside className={`sidebar ${aberto ? 'sidebar--aberta' : ''}`} aria-label="Menu lateral administrativo">
      <Marca />
      <button type="button" className="sidebar__alternar botao botao--secundario" aria-expanded={aberto} aria-controls="menu-administrativo" onClick={() => setAberto(!aberto)}>
        {aberto ? 'Fechar menu' : 'Abrir menu'}
      </button>
      <div className="sidebar__entidade">
        <small>{admin ? 'ADMINISTRAÇÃO' : 'ÁREA DA ENTIDADE'}</small>
        <strong>{usuario?.nome}</strong>
      </div>
      <nav id="menu-administrativo" aria-label="Navegação administrativa" onClick={() => setAberto(false)}>
        {menu.map(([icone, nome, para]) => (
          <NavLink
            to={para}
            key={para}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <Icon nome={icone} />
            <span>{nome}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__rodape">
        {admin && (
          <NavLink className="sidebar__link" to="/entidades">
            <Icon nome="doadores" />
            <span>Entidades</span>
          </NavLink>
        )}
        {admin && (
          <NavLink className="sidebar__link" to="/usuarios">
            <Icon nome="configuracoes" />
            <span>Usuários</span>
          </NavLink>
        )}
        <NavLink className="sidebar__link" to="/">
          <Icon nome="externo" />
          <span>Ver vitrine pública</span>
        </NavLink>
        <NavLink className="sidebar__link" to="/login" onClick={sair}>
          <Icon nome="sair" />
          <span>Sair</span>
        </NavLink>
      </div>
    </aside>
  )
}
