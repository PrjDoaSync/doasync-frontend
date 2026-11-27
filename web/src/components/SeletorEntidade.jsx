import { useId } from 'react'
import RequestState from './RequestState'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../services/entidadesService'

// Seletor de entidade para o ADMIN nas telas que leem /entidades/{id}/... (só entidades aprovadas).
export default function SeletorEntidade({ valor, onChange }) {
  const id = useId()
  const request = useRequest((config) => entidadesService.aprovadas(config), [])
  return (
    <RequestState {...request}>
      {(entidades) => (
        <div className="seletor-entidade">
          <label htmlFor={id}>Entidade</label>
          <select id={id} value={valor} onChange={(e) => onChange(e.target.value)}>
            <option value="">Selecione uma entidade aprovada</option>
            {entidades.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>
      )}
    </RequestState>
  )
}
