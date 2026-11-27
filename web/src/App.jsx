import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Layout, { PublicLayout } from './components/layout/AppLayouts'
import Campanhas from './pages/Campanhas'
import Doacoes from './pages/DoacoesGestao'
import Entidades from './pages/Entidades'
import { DemoProvider } from './context/DemoContext'
import { AuthProvider } from './context/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import { Home, Explorar, DetalheCampanha } from './pages/Publico'
import FluxoDoacao from './pages/FluxoDoacao'
import MinhasDoacoes from './pages/MinhasDoacoes'
import ConfirmacaoDoacao from './pages/ConfirmacaoDoacao'
import CriarCampanha from './pages/CriarCampanha'
import EditarCampanha from './pages/EditarCampanha'
import AcompanhamentoCampanha from './pages/AcompanhamentoCampanha'
import PrestacaoContas from './pages/PrestacaoContas'
import Dashboard from './pages/Dashboard'
import Relatorios from './pages/Relatorios'
import CadastroEntidade from './pages/CadastroEntidade'
import PerfilEntidade from './pages/PerfilEntidade'
import Login from './pages/Login'
import CadastroDoador from './pages/CadastroDoador'
import Doadores from './pages/Doadores'
import Itens from './pages/Itens'
import Usuarios from './pages/Usuarios'
import UsuariosPlataforma from './pages/UsuariosPlataforma'
import Informacoes from './pages/Informacoes'
import PerfilUsuario from './pages/PerfilUsuario'
import EntidadesPublicas, { PerfilEntidadePublico } from './pages/EntidadesPublicas'
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
    <AuthProvider>
      <DemoProvider>
        <RotaAcessivel />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="explorar" element={<Explorar />} />
            <Route path="campanhas/:id" element={<DetalheCampanha />} />
            <Route path="doar/:id" element={<FluxoDoacao />} />
            <Route path="doar/:id/confirmacao/:doacaoId" element={<ConfirmacaoDoacao />} />
            <Route path="doar/entidade/:id" element={<FluxoDoacao direta />} />
            <Route path="doar/entidade/:id/confirmacao/:doacaoId" element={<ConfirmacaoDoacao />} />
            <Route path="entidades-publicas" element={<EntidadesPublicas />} />
            <Route path="entidades-publicas/:id" element={<PerfilEntidadePublico />} />
            <Route path="perfil-usuario" element={<PerfilUsuario />} />
            <Route path="minhas-doacoes" element={<MinhasDoacoes />} />
            <Route path="minhas-doacoes/:doacaoId" element={<ConfirmacaoDoacao historico />} />
            <Route path="login" element={<Login />} />
            <Route path="cadastro-doador" element={<CadastroDoador />} />
            <Route path="cadastro-entidade" element={<CadastroEntidade />} />
            <Route path="ajuda" element={<Informacoes pagina="ajuda" />} />
            <Route path="privacidade" element={<Informacoes pagina="privacidade" />} />
            <Route path="termos" element={<Informacoes pagina="termos" />} />
            <Route
              path="acesso-restrito"
              element={
                <Vazio principal titulo="Acesso restrito">
                  A área de gestão é exclusiva para entidades e administradores.{' '}
                  <Link to="/">Voltar ao início</Link>
                </Vazio>
              }
            />
            <Route
              path="*"
              element={
                <Vazio principal titulo="Página não encontrada">
                  <Link to="/">Voltar ao início</Link>
                </Vazio>
              }
            />
          </Route>
          {/* Gestão: só ENTIDADE ou ADMIN autenticados. */}
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard/campanha" element={<Dashboard analitico />} />
              <Route path="campanhas" element={<Campanhas />} />
              <Route path="campanhas/nova" element={<CriarCampanha />} />
              <Route path="campanhas/:id/editar" element={<EditarCampanha />} />
              <Route path="campanhas/:id/acompanhamento" element={<AcompanhamentoCampanha />} />
              <Route path="campanhas/:id/prestacao-de-contas" element={<PrestacaoContas />} />
              <Route path="doacoes" element={<Doacoes />} />
              <Route path="entidades" element={<Entidades />} />
              <Route path="usuarios" element={<UsuariosPlataforma />} />
              <Route path="doadores" element={<Doadores />} />
              <Route path="itens" element={<Itens />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="configuracoes" element={<PerfilEntidade />} />
              <Route path="configuracoes/usuarios" element={<Usuarios />} />
            </Route>
          </Route>
        </Routes>
      </DemoProvider>
    </AuthProvider>
  )
}
