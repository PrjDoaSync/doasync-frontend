export default function PageHeader({ titulo, descricao, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {children}
    </div>
  )
}
