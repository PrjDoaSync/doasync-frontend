// Mensagem de erro acessível (role="alert") com ação opcional de nova tentativa.
// Aceita o erro normalizado de services/api.js, um Error ou uma string.
function mensagemDoErro(error) {
  if (typeof error === 'string') return error
  return error?.message || 'Ocorreu um erro inesperado.'
}

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null

  return (
    <div role="alert" className="error-message">
      <p>{mensagemDoErro(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
