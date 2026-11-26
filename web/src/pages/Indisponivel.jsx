import PageHeader from '../components/PageHeader'
import { Botao, Vazio } from '../components/Ui'

export default function Indisponivel({ titulo, children }) {
  return (
    <>
      <PageHeader titulo={titulo} />
      <Vazio titulo="Funcionalidade indisponível">{children}</Vazio>
      <Botao para="/dashboard" secundario>Voltar ao dashboard</Botao>
    </>
  )
}
