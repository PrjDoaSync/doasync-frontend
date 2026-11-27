import AvisoIndisponivel from '../AvisoIndisponivel'
import { Aviso, Botao, Secao } from '../Ui'

// DOA-06 (#100). `itens`: [{ nome, especificacao, meta, recebido }]; `selecao`: { [nome]: quantidade }.
// Os itens são exemplos (mocks/itensDemo.js) até a API informar as necessidades da campanha.
export default function SelecaoItens({ itens, selecao, onChange, erro, onVoltar, onContinuar }) {
  return (
    <Secao titulo="Escolha os itens" descricao="Informe a quantidade de cada item que você pretende doar.">
      <AvisoIndisponivel recurso="doacaoItens">Os itens abaixo são exemplos de demonstração.</AvisoIndisponivel>
      <ul className="itens-doacao">
        {itens.map((item) => {
          const restante = Math.max(item.meta - item.recebido, 0)
          const marcado = Number(selecao[item.nome]) > 0
          const id = `item-${item.nome.replace(/\s+/g, '-')}`
          return (
            <li key={item.nome} className={marcado ? 'selecionado' : ''}>
              <div>
                <label className="item-escolha">
                  <input
                    type="checkbox"
                    aria-label={`Selecionar ${item.nome}`}
                    disabled={restante === 0}
                    checked={marcado}
                    onChange={(e) => onChange(item.nome, e.target.checked ? '1' : '0')}
                  />
                  <strong>{item.nome}</strong>
                </label>
                {item.especificacao && <small>{item.especificacao}</small>}
                <small>{restante > 0 ? `Ainda faltam ${restante} de ${item.meta} unidades` : 'Meta deste item atingida'}</small>
                <progress max={item.meta || 1} value={item.recebido} aria-label={`Progresso de ${item.nome}`} />
              </div>
              <label htmlFor={id}>
                <span className="sr-only">Quantidade de {item.nome}</span>
                <input
                  id={id}
                  type="number"
                  min="0"
                  max={restante}
                  step="1"
                  inputMode="numeric"
                  disabled={restante === 0}
                  value={selecao[item.nome] ?? ''}
                  placeholder="0"
                  onChange={(e) => onChange(item.nome, e.target.value)}
                />
              </label>
            </li>
          )
        })}
      </ul>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar}>Voltar</Botao>
        <Botao onClick={onContinuar}>Continuar</Botao>
      </div>
    </Secao>
  )
}
