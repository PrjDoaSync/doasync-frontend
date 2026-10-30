import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import { Botao, Icon, Marca } from '../Ui'

const menu = [
  ['dashboard', 'Dashboard', '/dashboard'],
  ['campanhas', 'Campanhas', '/campanhas'],
  ['doacoes', 'Doações', '/doacoes'],
  ['doadores', 'Doadores', '/doadores'],
  ['itens', 'Itens doados', '/itens'],
  ['relatorios', 'Relatórios', '/relatorios'],
  ['configuracoes', 'Configurações', '/configuracoes'],
]
export function DemoBanner() {
  return (
    <div className="demo-banner">
      <span className="demo-ponto" />
      Ambiente de demonstração · dados fictícios · alterações válidas somente
      nesta sessão
    </div>
  )
}
export function Toast() {
  const { aviso, notificar } = useDemo()
  return aviso ? (
    <div className="toast" role="status">
      <Icon nome="check" />
      <span>{aviso}</span>
      <button aria-label="Dispensar aviso" onClick={() => notificar('')}>
        ×
      </button>
    </div>
  ) : null
}
export default function AppLayout() {
  const { dados } = useDemo(),
    { pathname } = useLocation()
  const titulo =
    menu.find(([, , path]) => pathname.startsWith(path))?.[1] ??
    (pathname.includes('cadastro')
      ? 'Cadastro da entidade'
      : 'Gestão da entidade')
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="layout">
        <aside className="sidebar">
          <Marca />
          <div className="sidebar__entidade">
            <small>ÁREA DA ENTIDADE</small>
            <strong>{dados.entidade.nome}</strong>
          </div>
          <nav aria-label="Principal">
            {menu.map(([icone, nome, para]) => (
              <NavLink to={para} key={para} className="sidebar__link">
                <Icon nome={icone} />
                {nome}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar__rodape">
            <NavLink className="sidebar__link" to="/entidades">
              <Icon nome="doadores" />
              Entidades
            </NavLink>
            <NavLink className="sidebar__link" to="/">
              <Icon nome="externo" />
              Ver vitrine pública
            </NavLink>
            <NavLink className="sidebar__link" to="/login">
              <Icon nome="sair" />
              Acesso da entidade
            </NavLink>
          </div>
        </aside>
        <div className="layout__principal">
          <header className="topo">
            <span className="topo__titulo">{titulo}</span>
            <div className="topo__usuario">
              <span className="topo__avatar">AS</span>
              <span>
                <strong>Ana Silva</strong>
                <small>Administradora · demonstração</small>
              </span>
            </div>
          </header>
          <DemoBanner />
          <main className="conteudo" id="conteudo" tabIndex={-1}>
            <Outlet />
          </main>
          <footer className="rodape-gestao">
            DoaSync · Solidariedade com transparência
          </footer>
        </div>
      </div>
      <Toast />
    </>
  )
}
export function PublicLayout() {
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="public-header">
        <div className="public-header__inner">
          <Marca />
          <nav aria-label="Navegação pública">
            <NavLink to="/explorar">Explorar campanhas</NavLink>
            <NavLink to="/cadastro-entidade">Para entidades</NavLink>
          </nav>
          <Botao para="/login" secundario>
            Entrar
          </Botao>
        </div>
      </header>
      <DemoBanner />
      <main className="public-main" id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="public-footer">
        <Marca />
        <p>Conectando solidariedade. Transformando vidas.</p>
        <span>© 2026 DoaSync · Projeto de extensão</span>
      </footer>
      <Toast />
    </>
  )
}
