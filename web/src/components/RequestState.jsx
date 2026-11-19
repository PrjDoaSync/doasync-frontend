import ErrorMessage from './ErrorMessage'
import Loading from './Loading'

const estaVazio = (data) => Array.isArray(data) && data.length === 0

// Renderiza loading, erro, vazio ou o conteúdo, a partir do retorno do useRequest.
// Uso: <RequestState {...request}>{(data) => <Tabela dados={data} />}</RequestState>
//
// - `vazio` (opcional): texto ou elemento exibido quando `data` é uma lista vazia.
//   Sem `vazio`, a lista vazia é entregue a `children`, que decide o que mostrar.
// - Se uma nova tentativa falha mas já existem dados, o conteúdo anterior é
//   mantido e o erro aparece acima dele, preservando o contexto do usuário.
export default function RequestState({
  data,
  loading,
  error,
  reload,
  vazio,
  children,
}) {
  if (loading && data == null) return <Loading />
  if (error && data == null) return <ErrorMessage error={error} onRetry={reload} />
  if (data == null) return null

  const aviso = error ? <ErrorMessage error={error} onRetry={reload} /> : null
  if (vazio != null && estaVazio(data)) {
    return (
      <>
        {aviso}
        {typeof vazio === 'string' ? (
          <p role="status" className="tabela-vazia">
            {vazio}
          </p>
        ) : (
          vazio
        )}
      </>
    )
  }
  return (
    <>
      {aviso}
      {children(data)}
    </>
  )
}
