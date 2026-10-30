export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null

  return (
    <div role="alert" className="error-message">
      <p>{error.message ?? 'Ocorreu um erro inesperado.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
