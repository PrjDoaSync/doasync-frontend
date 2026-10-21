import { useCallback, useEffect, useRef, useState } from 'react'

// Executa uma chamada de API e expõe { data, loading, error, reload }.
// `request` recebe { signal } e deve retornar uma Promise (ex.: um método dos
// services). A chamada é cancelada ao desmontar o componente ou ao recarregar.
export function useRequest(request, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const controllerRef = useRef(null)

  const run = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setState((prev) => ({ ...prev, loading: true, error: null }))
    request({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (error?.cancelled || controller.signal.aborted) return
        setState((prev) => ({ ...prev, loading: false, error }))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    return () => controllerRef.current?.abort()
  }, [run])

  return { ...state, reload: run }
}
