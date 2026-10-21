// Tabela genérica. `colunas`: [{ chave, titulo, render?(linha) }]
export default function DataTable({ colunas, linhas, vazio = 'Nenhum registro encontrado.' }) {
  if (linhas.length === 0) {
    return <p className="tabela-vazia">{vazio}</p>
  }

  return (
    <div className="tabela-wrapper">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave}>{coluna.titulo}</th>
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
