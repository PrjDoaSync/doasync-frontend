import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import ContentArea from './ContentArea'
import { DemoBanner, Toast } from './AppLayouts'
import { emDemonstracao } from '../../utils/gestao'


export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="layout">
        <AdminSidebar />
        <div className="layout__principal">
          <AdminHeader />
          {emDemonstracao(pathname) && <DemoBanner />}
          <ContentArea>
            <Outlet />
          </ContentArea>
          <footer className="rodape-gestao" role="contentinfo">
            DoaSync · Solidariedade com transparência
          </footer>
        </div>
      </div>
      <Toast />
    </>
  )
}
