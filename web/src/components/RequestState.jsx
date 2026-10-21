import ErrorMessage from './ErrorMessage'
import Loading from './Loading'

// Renderiza loading, erro ou o conteúdo, a partir do retorno do useRequest.
// Uso: <RequestState {...request}>{(data) => <Tabela dados={data} />}</RequestState>
export default function RequestState({ data, loading, error, reload, children }) {
  if (loading && data == null) return <Loading />
  if (error) return <ErrorMessage error={error} onRetry={reload} />
  if (data == null) return null
  return children(data)
}
