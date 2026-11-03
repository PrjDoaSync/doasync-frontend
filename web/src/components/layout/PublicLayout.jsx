import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import { DemoBanner, Toast } from './AppLayouts'

export default function PublicLayout() {
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <DemoBanner />
      <main className="public-main" id="conteudo" tabIndex={-1} role="main">
        <Outlet />
      </main>
      <PublicFooter />
      <Toast />
    </>
  )
}
