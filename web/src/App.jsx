import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Layout, { PublicLayout } from './components/layout/AppLayouts'
import Campanhas from './pages/Campanhas'
import Doacoes from './pages/DoacoesGestao'
import Entidades from './pages/Entidades'
import { DemoProvider } from './context/DemoContext'
import { Home, Explorar, DetalheCampanha } from './pages/Publico'
import FluxoDoacao from './pages/FluxoDoacao'
import CriarCampanha from './pages/CriarCampanha'
import Dashboard from './pages/Dashboard'
import Relatorios from './pages/Relatorios'
import CadastroEntidade from './pages/CadastroEntidade'
import Login from './pages/Login'
import Doadores from './pages/Doadores'
import Itens from './pages/Itens'
import Usuarios from './pages/Usuarios'
import { Vazio } from './components/Ui'

function RotaAcessivel() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const cabecalho = document.querySelector('h1')
    if (cabecalho) {
      document.title = `${cabecalho.textContent} · DoaSync`
      cabecalho.setAttribute('tabindex', '-1')
      cabecalho.focus({ preventScroll: true })
    }
  }, [pathname])
  return null
}

export default function App() {
  return (
    <DemoProvider>
      <RotaAcessivel />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="campanhas/:id" element={<DetalheCampanha />} />
          <Route path="doar/:id" element={<FluxoDoacao />} />
          <Route path="login" element={<Login />} />
          <Route
            path="*"
            element={
              <Vazio principal titulo="Página não encontrada">
                <Link to="/">Voltar ao início</Link>
              </Vazio>
            }
          />
        </Route>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/campanha" element={<Dashboard analitico />} />
          <Route path="campanhas" element={<Campanhas />} />
          <Route path="campanhas/nova" element={<CriarCampanha />} />
          <Route path="doacoes" element={<Doacoes />} />
          <Route path="entidades" element={<Entidades />} />
          <Route path="doadores" element={<Doadores />} />
          <Route path="itens" element={<Itens />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="cadastro-entidade" element={<CadastroEntidade />} />
          <Route path="configuracoes" element={<CadastroEntidade perfil />} />
          <Route path="configuracoes/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </DemoProvider>
  )
}
