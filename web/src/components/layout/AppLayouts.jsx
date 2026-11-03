import { useDemo } from '../../context/DemoContext'
import { Icon } from '../Ui'
import AdminLayout from './AdminLayout'
import PublicLayout from './PublicLayout'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import ContentArea from './ContentArea'

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

export {
  AdminLayout,
  PublicLayout,
  PublicHeader,
  PublicFooter,
  AdminSidebar,
  AdminHeader,
  ContentArea,
}

export default AdminLayout
