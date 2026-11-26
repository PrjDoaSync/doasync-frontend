import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Layout, { PublicLayout } from './components/layout/AppLayouts'
import Campanhas from './pages/Campanhas'
import Doacoes from './pages/DoacoesGestao'
import Doadores from './pages/Doadores'
import AdministracaoContas from './pages/AdministracaoContas'
import Indisponivel from './pages/Indisponivel'
import PerfilUsuario from './pages/PerfilUsuario'
import EntidadesPublicas from './pages/EntidadesPublicas'
import { AuthProvider } from './context/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import { Home, Explorar, DetalheCampanha } from './pages/Publico'
import FluxoDoacao from './pages/FluxoDoacao'
import MinhasDoacoes from './pages/MinhasDoacoes'
import ConfirmacaoDoacao from './pages/ConfirmacaoDoacao'
import CriarCampanha from './pages/CriarCampanha'
import EditarCampanha from './pages/EditarCampanha'
import AcompanhamentoCampanha from './pages/AcompanhamentoCampanha'
import Dashboard from './pages/Dashboard'
import CadastroEntidade from './pages/CadastroEntidade'
import PerfilEntidade from './pages/PerfilEntidade'
import Login from './pages/Login'
import CadastroDoador from './pages/CadastroDoador'
import Informacoes from './pages/Informacoes'
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
      <RotaAcessivel />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="campanhas/:id" element={<DetalheCampanha />} />
          <Route path="doar/:id" element={<FluxoDoacao />} />
          <Route path="doar/entidade/:id" element={<FluxoDoacao direta />} />
          <Route path="doar/entidade/:id/confirmacao/:doacaoId" element={<ConfirmacaoDoacao />} />
          <Route path="entidades-publicas" element={<EntidadesPublicas />} />
          <Route path="doar/:id/confirmacao/:doacaoId" element={<ConfirmacaoDoacao />} />
          <Route path="minhas-doacoes" element={<MinhasDoacoes />} />
          <Route path="minhas-doacoes/:doacaoId" element={<ConfirmacaoDoacao historico />} />
          <Route path="login" element={<Login />} />
          <Route path="perfil-usuario" element={<PerfilUsuario />} />
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
            <Route path="campanhas/:id/prestacao-de-contas" element={<Indisponivel titulo="Prestação de contas">A API ainda não permite publicar a destinação de recursos e as despesas da campanha.</Indisponivel>} />
            <Route path="doacoes" element={<Doacoes />} />
            <Route path="entidades" element={<AdministracaoContas entidades />} />
            <Route path="doadores" element={<Doadores />} />
            <Route path="itens" element={<Indisponivel titulo="Controle de itens doados">A API ainda não oferece cadastro ou movimentação de estoque.</Indisponivel>} />
            <Route path="relatorios" element={<Dashboard relatorio />} />
            <Route path="configuracoes" element={<PerfilEntidade />} />
            <Route path="configuracoes/usuarios" element={<AdministracaoContas />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
