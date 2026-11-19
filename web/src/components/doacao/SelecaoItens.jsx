import { Aviso, Botao, Secao, Vazio } from '../Ui'
import '../../styles/doacao.css'

// DOA-06. `itens`: [{ nome, especificacao, meta, recebido }]; `selecao`: { [nome]: quantidade }.
export default function SelecaoItens({ itens, selecao, onChange, erro, campanhaId, onVoltar, onContinuar }) {
  if (itens.length === 0) {
    return (
      <Secao titulo="Escolha os itens">
        <Vazio titulo="Esta campanha ainda não lista itens">
          A entidade ainda não informou as necessidades de itens desta campanha. Você pode fazer uma doação financeira ou
          voltar mais tarde.
        </Vazio>
        <div className="acoes">
          <Botao secundario onClick={onVoltar}>
            Voltar
          </Botao>
          <Botao para={`/campanhas/${campanhaId}`}>Ver a campanha</Botao>
        </div>
      </Secao>
    )
  }

  return (
    <Secao titulo="Escolha os itens" descricao="Informe a quantidade de cada item que você vai doar.">
      <ul className="itens-doacao">
        {itens.map((item) => {
          const restante = Math.max(item.meta - item.recebido, 0)
          const id = `item-${item.nome}`
          return (
            <li key={item.nome}>
              <div>
                <strong>{item.nome}</strong>
                {item.especificacao && <small>{item.especificacao}</small>}
                <small>
                  {restante > 0 ? `Ainda faltam ${restante} de ${item.meta} unidades` : 'Meta deste item atingida'}
                </small>
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
      <Aviso>Doação de demonstração: a entidade confirma o recebimento dos itens depois da entrega.</Aviso>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar}>
          Voltar
        </Botao>
        <Botao onClick={onContinuar}>Continuar</Botao>
      </div>
    </Secao>
  )
}
