import { RECURSOS_PENDENTES } from '../services/indisponivel'

// Aviso padrão de funcionalidade que depende de uma rota ainda inexistente no backend.
export default function AvisoIndisponivel({ recurso, children }) {
  const pendente = RECURSOS_PENDENTES[recurso]
  return (
    <div className="aviso aviso--pendente" role="status">
      <span aria-hidden="true">ⓘ</span>
      <div>
        <strong>Aguardando integração{pendente ? ` · ${pendente.titulo}` : ''}.</strong> {pendente?.motivo}
        {children && <> {children}</>}
      </div>
    </div>
  )
}
