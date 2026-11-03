import { NavLink } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
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
  const { dados } = useDemo()

  return (
    <aside className="sidebar" aria-label="Menu lateral administrativo">
      <Marca />
      <div className="sidebar__entidade">
        <small>ÁREA DA ENTIDADE</small>
        <strong>{dados.entidade.nome}</strong>
      </div>
      <nav aria-label="Navegação administrativa">
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
        <NavLink className="sidebar__link" to="/entidades">
          <Icon nome="doadores" />
          <span>Entidades</span>
        </NavLink>
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
