import { Navigate, Route, Routes } from 'react-router-dom'
import { DemoProvider } from './context/DemoContext'
import Layout from './components/layout/Layout'
import Campanhas from './pages/Campanhas'
import Doacoes from './pages/Doacoes'
import Entidades from './pages/Entidades'

export default function App() {
  return (
    <DemoProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/campanhas" replace />} />
        <Route path="campanhas" element={<Campanhas />} />
        <Route path="doacoes" element={<Doacoes />} />
        <Route path="entidades" element={<Entidades />} />
      </Route>
    </Routes>
    </DemoProvider>
  )
}
