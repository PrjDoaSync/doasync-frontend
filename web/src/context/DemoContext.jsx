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
      if (chave === 'doacoes' && atual.historicoDoador) {
        return {
          ...atual,
          doacoes: valor,
          historicoDoador: atual.historicoDoador.map((registro) => {
            const doacao = valor.find((item) => item.id === registro.id)
            if (!doacao) return registro
            const confirmada = doacao.status === 'Confirmada'
            const cancelada = doacao.status === 'Cancelada'
            const financeira = doacao.tipo === 'Financeira'
            return {
              ...registro,
              status: cancelada ? 'Cancelada' : confirmada ? 'Recebida' : 'Pendente',
              pagamentoStatus: financeira ? cancelada ? 'Cancelado' : confirmada ? 'Confirmado' : 'Pendente' : 'Não se aplica',
              pagamento: financeira ? `${doacao.metodo} · ${cancelada ? 'cancelado' : confirmada ? 'confirmado' : 'pendente'}` : 'Não se aplica',
              pagamentoSub: financeira ? 'Registro demonstrativo' : confirmada ? 'Entrega conferida na demonstração' : 'Aguardando entrega',
              pagamentoResumo: financeira ? `${confirmada ? 'Confirmado' : cancelada ? 'Cancelado' : 'Pendente'} · ${doacao.metodo}` : 'Sem pagamento · doação de itens',
              statusSub: cancelada ? 'Registro cancelado na demonstração' : confirmada ? 'Aguardando destinação' : financeira ? 'Aguardando pagamento' : 'Aguardando conferência',
            }
          }),
        }
      }
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
