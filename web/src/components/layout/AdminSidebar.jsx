import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Icon, Marca } from '../Ui'

const menu = [
  ['dashboard', 'Dashboard', '/dashboard'],
  ['campanhas', 'Campanhas', '/campanhas'],
  ['doacoes', 'Doações', '/doacoes'],
  ['doadores', 'Doadores', '/doadores'],
  ['relatorios', 'Relatórios', '/relatorios'],
  ['configuracoes', 'Configurações', '/configuracoes'],
]

export default function AdminSidebar() {
  const { usuario } = useAuth()
  const admin = usuario.tipo === 'ADMIN'
  const itens = admin
    ? [...menu.slice(0, 2), ['doadores', 'Usuários', '/configuracoes/usuarios'], ['configuracoes', 'Entidades', '/entidades']]
    : menu
  const [aberto, setAberto] = useState(false)

  return (
    <aside className={`sidebar ${aberto ? 'sidebar--aberta' : ''}`} aria-label="Menu lateral administrativo">
      <Marca />
      <button type="button" className="sidebar__alternar botao botao--secundario" aria-expanded={aberto} aria-controls="menu-administrativo" onClick={() => setAberto(!aberto)}>
        {aberto ? 'Fechar menu' : 'Abrir menu'}
      </button>
      <div className="sidebar__entidade">
        <small>{admin ? 'ADMINISTRAÇÃO' : 'ÁREA DA ENTIDADE'}</small>
        <strong>{usuario.nome}</strong>
      </div>
      <nav id="menu-administrativo" aria-label="Navegação administrativa" onClick={() => setAberto(false)}>
        {itens.map(([icone, nome, para]) => (
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
        <NavLink className="sidebar__link" to="/">
          <Icon nome="externo" />
          <span>Ver vitrine pública</span>
        </NavLink>
        <NavLink className="sidebar__link" to="/login">
          <Icon nome="sair" />
          <span>Acesso da entidade</span>
        </NavLink>
      </div>
    </aside>
  )
}
