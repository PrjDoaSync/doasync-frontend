import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../Ui'

const TITULOS_ROTAS = [
  { prefixo: '/dashboard/campanha', titulo: 'Dashboard analítico por campanha' },
  { prefixo: '/dashboard', titulo: 'Dashboard geral' },
  { prefixo: '/campanhas/nova', titulo: 'Criar campanha' },
  { sufixo: '/editar', titulo: 'Editar campanha' },
  { sufixo: '/acompanhamento', titulo: 'Acompanhamento da campanha' },
  { sufixo: '/prestacao-de-contas', titulo: 'Prestação de contas' },
  { prefixo: '/campanhas', titulo: 'Gestão de campanhas' },
  { prefixo: '/doacoes', titulo: 'Doações recebidas' },
  { prefixo: '/doadores', titulo: 'Doadores e histórico' },
  { prefixo: '/itens', titulo: 'Controle de itens doados' },
  { prefixo: '/relatorios', titulo: 'Relatórios e exportação' },
  { prefixo: '/configuracoes/usuarios', titulo: 'Usuários e permissões' },
  { prefixo: '/configuracoes', titulo: 'Perfil da entidade e configurações' },
  { prefixo: '/cadastro-entidade', titulo: 'Cadastro da entidade' },
  { prefixo: '/entidades', titulo: 'Gestão de entidades' },
]

export default function AdminHeader() {
  const { pathname } = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef(null)
  const botaoRef = useRef(null)

  // Encontra o título correspondente à rota atual
  const correspondente = TITULOS_ROTAS.find((item) => {
    if (item.sufixo && pathname.endsWith(item.sufixo)) return true
    if (item.prefixo && pathname.startsWith(item.prefixo)) return true
    return false
  })
  const titulo = correspondente ? correspondente.titulo : 'Gestão da entidade'

  // Fechar menu ao pressionar Escape ou clicar fora
  useEffect(() => {
    function tratarKeyDown(e) {
      if (e.key === 'Escape' && menuAberto) {
        setMenuAberto(false)
        botaoRef.current?.focus()
      }
    }
    function tratarCliqueFora(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        botaoRef.current &&
        !botaoRef.current.contains(e.target)
      ) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('keydown', tratarKeyDown)
    document.addEventListener('mousedown', tratarCliqueFora)
    return () => {
      document.removeEventListener('keydown', tratarKeyDown)
      document.removeEventListener('mousedown', tratarCliqueFora)
    }
  }, [menuAberto])

  return (
    <header className="topo" role="banner">
      <span className="topo__titulo">{titulo}</span>

      <div className="topo__acoes">
        <button
          type="button"
          className="topo__notificacao"
          aria-label="Notificações da entidade"
          title="Notificações"
        >
          <Icon nome="sino" size={18} />
          <span className="topo__notificacao-badge" aria-hidden="true" />
        </button>

        <div className="topo__perfil-container">
          <button
            ref={botaoRef}
            type="button"
            className="topo__usuario"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-haspopup="menu"
            aria-label="Perfil do usuário e ações comuns"
          >
            <span className="topo__avatar" aria-hidden="true">
              AS
            </span>
            <span className="topo__usuario-info">
              <strong>Ana Silva</strong>
              <small>Administradora · demonstração</small>
            </span>
            <Icon
              nome="seta"
              size={14}
              className={`topo__usuario-seta ${menuAberto ? 'topo__usuario-seta--aberto' : ''}`}
            />
          </button>

          {menuAberto && (
            <div
              ref={menuRef}
              className="topo__menu-dropdown"
              role="menu"
              aria-label="Opções do perfil"
            >
              <div className="topo__menu-cabecalho">
                <strong>Ana Silva</strong>
                <small>ana.silva@redeesperanca.org.br</small>
              </div>
              <hr className="topo__menu-divisor" />
              <Link
                to="/configuracoes"
                role="menuitem"
                className="topo__menu-item"
                onClick={() => setMenuAberto(false)}
              >
                <Icon nome="configuracoes" size={16} />
                <span>Perfil da entidade</span>
              </Link>
              <Link
                to="/configuracoes/usuarios"
                role="menuitem"
                className="topo__menu-item"
                onClick={() => setMenuAberto(false)}
              >
                <Icon nome="doadores" size={16} />
                <span>Gerenciar equipe</span>
              </Link>
              <hr className="topo__menu-divisor" />
              <Link
                to="/login"
                role="menuitem"
                className="topo__menu-item topo__menu-item--sair"
                onClick={() => setMenuAberto(false)}
              >
                <Icon nome="sair" size={16} />
                <span>Sair da conta</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
