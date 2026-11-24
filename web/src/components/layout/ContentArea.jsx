export default function ContentArea({ children, className = '' }) {
  return (
    <main
      className={`conteudo ${className}`.trim()}
      id="conteudo"
      tabIndex={-1}
      role="main"
    >
      {children}
    </main>
  )
}
