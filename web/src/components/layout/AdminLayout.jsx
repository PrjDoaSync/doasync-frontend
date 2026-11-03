import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import ContentArea from './ContentArea'
import { DemoBanner, Toast } from './AppLayouts'

export default function AdminLayout() {
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="layout">
        <AdminSidebar />
        <div className="layout__principal">
          <AdminHeader />
          <DemoBanner />
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
