// Barra de filtros: busca por texto + selects. `selects`: [{ rotulo, valor, onChange, opcoes }]
export default function Filtros({ busca, onBusca, placeholder, selects = [] }) {
  return (
    <div className="filtros">
      <input
        type="search"
        className="filtros__busca"
        value={busca}
        onChange={(evento) => onBusca(evento.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {selects.map((select) => (
        <select
          key={select.rotulo}
          value={select.valor}
          onChange={(evento) => select.onChange(evento.target.value)}
          aria-label={select.rotulo}
        >
          <option value="">{select.rotulo}</option>
          {select.opcoes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
