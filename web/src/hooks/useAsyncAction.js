import { useCallback, useEffect, useRef, useState } from 'react'

// Executa uma ação assíncrona disparada pelo usuário (salvar, enviar, confirmar)
// e expõe { executar, pending, success, error, reset }.
//
// - `pending`: true enquanto a ação roda (use em `disabled` e `aria-busy`).
// - Envio duplicado: chamadas a `executar` enquanto há uma em andamento são
//   ignoradas. A trava é um ref, então vale mesmo para dois cliques antes de o
//   React redesenhar o botão como desabilitado.
// - `executar` devolve o resultado da ação, ou undefined se falhou, foi
//   cancelada ou ignorada por duplicidade.
// - Erros marcados com `cancelled` (ver normalizeError em services/api.js) não
//   viram mensagem; o estado volta ao repouso.
// - Não atualiza estado depois que o componente é desmontado.
export function useAsyncAction(action) {
  const [state, setState] = useState({
    pending: false,
    success: false,
    error: null,
  })
  const emAndamento = useRef(false)
  const montado = useRef(true)
  const acaoAtual = useRef(action)

  useEffect(() => {
    acaoAtual.current = action
  })
  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  const executar = useCallback(async (...args) => {
    if (emAndamento.current) return undefined
    emAndamento.current = true
    setState({ pending: true, success: false, error: null })
    try {
      const resultado = await acaoAtual.current(...args)
      if (montado.current) setState({ pending: false, success: true, error: null })
      return resultado
    } catch (error) {
      if (montado.current) {
        setState({
          pending: false,
          success: false,
          error: error?.cancelled ? null : error,
        })
      }
      return undefined
    } finally {
      emAndamento.current = false
    }
  }, [])

  const reset = useCallback(
    () => setState({ pending: false, success: false, error: null }),
    [],
  )

  return { ...state, executar, reset }
}
