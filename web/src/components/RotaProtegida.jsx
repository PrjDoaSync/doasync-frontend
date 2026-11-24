import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { acessaGestao } from '../utils/auth'

// Guarda das rotas de gestão: exige sessão de ENTIDADE ou ADMIN.
// Sem sessão → /login, que volta para a rota de origem depois de entrar (state.de).
export default function RotaProtegida() {
  const { usuario } = useAuth()
  const { pathname, search } = useLocation()
  if (!usuario) return <Navigate to="/login" replace state={{ de: pathname + search }} />
  if (!acessaGestao(usuario.tipo)) return <Navigate to="/acesso-restrito" replace />
  return <Outlet />
}
