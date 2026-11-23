// Tabela genérica. `colunas`: [{ chave, titulo, render?(linha) }]
export default function DataTable({
  colunas,
  linhas,
  vazio = 'Nenhum registro encontrado.',
  nome,
}) {
  if (linhas.length === 0) {
    return <p className="tabela-vazia" role="status">{vazio}</p>
  }

  return (
    <div className="tabela-wrapper" role="region" aria-label={nome ?? `Tabela: ${colunas.map((c) => c.titulo).filter((t) => typeof t === 'string' && t).join(', ')}`} tabIndex={0}>
      <table className="tabela" aria-label={nome ?? colunas.map((c) => c.titulo).filter((t) => typeof t === 'string' && t).join(', ')}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave} scope="col">
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.id}>
              {colunas.map((coluna) => (
                <td key={coluna.chave}>
                  {coluna.render ? coluna.render(linha) : linha[coluna.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
