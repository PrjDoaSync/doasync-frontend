import { useState } from 'react'
import { DemoContext } from './demoContextValue'
import { carregarDemo } from '../mocks/gestao'
import { useRequest } from '../hooks/useRequest'
import RequestState from '../components/RequestState'

export function DemoProvider({ children }) {
  const request = useRequest(carregarDemo)
  const [alteracoes, setAlteracoes] = useState({})
  const [aviso, setAviso] = useState('')
  const dados = request.data ? { ...request.data, ...alteracoes } : null
  function atualizar(chave, valor) {
    setAlteracoes((atual) => {
      if (chave !== 'entidade') return { ...atual, [chave]: valor }
      return {
        ...atual,
        entidade: valor,
        campanhas: (atual.campanhas ?? request.data.campanhas).map((c) =>
          c.entidadeId === valor.id ? { ...c, entidade: valor.nome } : c,
        ),
      }
    })
  }
  return (
    <DemoContext.Provider
      value={{ dados, atualizar, aviso, notificar: setAviso }}
    >
      <RequestState {...request}>{() => children}</RequestState>
    </DemoContext.Provider>
  )
}
