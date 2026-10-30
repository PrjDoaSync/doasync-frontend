export default function Loading({ message = 'Carregando...' }) {
  return (
    <div role="status" aria-live="polite" className="loading">
      {message}
    </div>
  )
}
