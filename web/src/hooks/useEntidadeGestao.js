import { useState } from 'react'
import { useAuth } from './useAuth'

// Entidade cujos dados a tela de gestão mostra: a própria, para a ENTIDADE; a escolhida,
// para o ADMIN (que não tem entidadeId na sessão). Use com <SeletorEntidade />.
export function useEntidadeGestao() {
  const { usuario } = useAuth()
  const admin = usuario?.tipo === 'ADMIN'
  const [escolhida, setEscolhida] = useState('')
  return {
    admin,
    entidadeId: admin ? escolhida : usuario?.entidadeId ?? '',
    escolher: setEscolhida,
  }
}
