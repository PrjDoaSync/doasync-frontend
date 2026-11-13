import { useState } from 'react'
import { Aviso, Botao, Campo, Secao } from '../Ui'
import { formatarData, formatarMoeda } from '../../utils/format'
import { gerarBoleto, validarCartao } from '../../utils/doacao'
import '../../styles/doacao.css'

// DOA-05. Cartão e boleto são só demonstração: nada é enviado nem cobrado, e os
// dados do cartão não saem do formulário (não entram no registro da doação).
export default function PagamentoCartaoBoleto({ metodo, valor, campanha, hoje, enviando, erro, onVoltar, onConcluir }) {
  return metodo === 'Cartão' ? (
    <Cartao valor={valor} hoje={hoje} enviando={enviando} erro={erro} onVoltar={onVoltar} onConcluir={onConcluir} />
  ) : (
    <Boleto valor={valor} campanha={campanha} hoje={hoje} enviando={enviando} erro={erro} onVoltar={onVoltar} onConcluir={onConcluir} />
  )
}

function Cartao({ valor, hoje, enviando, erro, onVoltar, onConcluir }) {
  const [erros, setErros] = useState({})

  function enviar(e) {
    e.preventDefault()
    const campos = Object.fromEntries(new FormData(e.currentTarget))
    const encontrados = validarCartao(campos, hoje)
    setErros(encontrados)
    if (Object.keys(encontrados).length === 0) onConcluir({ metodo: 'Cartão' })
  }

  return (
    <Secao titulo="Pagamento com cartão" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <Aviso>
        Demonstração: não informe dados reais do seu cartão. Nada é enviado nem cobrado e os dados não são guardados.
      </Aviso>
      <form onSubmit={enviar} className="form-grid" noValidate>
        <div className="campo--inteiro">
          <Campo rotulo="Nome no cartão" name="nome" required autoComplete="off" />
          {erros.nome && <small role="alert" className="erro-campo">{erros.nome}</small>}
        </div>
        <div className="campo--inteiro">
          <Campo rotulo="Número do cartão" name="numero" required inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" />
          {erros.numero && <small role="alert" className="erro-campo">{erros.numero}</small>}
        </div>
        <div>
          <Campo rotulo="Validade (MM/AA)" name="validade" required autoComplete="off" placeholder="MM/AA" />
          {erros.validade && <small role="alert" className="erro-campo">{erros.validade}</small>}
        </div>
        <div>
          <Campo rotulo="CVV" name="cvv" required inputMode="numeric" autoComplete="off" maxLength={4} />
          {erros.cvv && <small role="alert" className="erro-campo">{erros.cvv}</small>}
        </div>
        {erro && (
          <div className="campo--inteiro">
            <Aviso erro>{erro}</Aviso>
          </div>
        )}
        <div className="acoes campo--inteiro">
          <Botao secundario onClick={onVoltar} disabled={enviando}>
            Voltar
          </Botao>
          <Botao type="submit" disabled={enviando}>
            {enviando ? 'Processando…' : `Pagar ${formatarMoeda(valor)} (demonstração)`}
          </Botao>
        </div>
      </form>
    </Secao>
  )
}

function Boleto({ valor, campanha, hoje, enviando, erro, onVoltar, onConcluir }) {
  const [copia, setCopia] = useState('')
  const { linha, vencimento } = gerarBoleto(valor, campanha.id, hoje)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(linha)
      setCopia('Linha digitável copiada.')
    } catch {
      setCopia('Não foi possível copiar. Selecione a linha e copie manualmente.')
    }
  }

  return (
    <Secao titulo="Pagamento com boleto" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <dl className="boleto">
        <div>
          <dt>Vencimento</dt>
          <dd>{formatarData(vencimento)}</dd>
        </div>
        <div>
          <dt>Beneficiário</dt>
          <dd>{campanha.entidade}</dd>
        </div>
      </dl>
      <label className="pix__codigo">
        <span>Linha digitável (demonstração)</span>
        <textarea readOnly rows={2} value={linha} />
      </label>
      <div className="acoes acoes--inicio">
        <Botao secundario onClick={copiar}>
          Copiar linha digitável
        </Botao>
        <small role="status">{copia}</small>
      </div>
      <Aviso>
        Este boleto é uma demonstração: não é válido e nenhum arquivo foi gerado. A compensação pode levar até 3 dias
        úteis após o pagamento real.
      </Aviso>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar} disabled={enviando}>
          Voltar
        </Botao>
        <Botao onClick={() => onConcluir({ metodo: 'Boleto' })} disabled={enviando}>
          {enviando ? 'Registrando…' : 'Concluir doação (demonstração)'}
        </Botao>
      </div>
    </Secao>
  )
}
