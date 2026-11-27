import { useState } from 'react'
import AvisoIndisponivel from '../AvisoIndisponivel'
import { Aviso, Botao, Campo, Secao } from '../Ui'
import { doacoesService } from '../../services/doacoesService'
import { formatarData, formatarMoeda } from '../../utils/format'
import { somarDias, validarCartao } from '../../utils/doacao'

// DOA-05 (#99). A API aceita somente PIX: cartão e boleto mostram o formulário do protótipo,
// validam os dados e chamam o serviço, que recusa com a pendência. Nada é cobrado nem
// registrado, e os dados do cartão não saem do formulário.
export default function PagamentoCartaoBoleto({ metodo, valor, destino, hoje, onVoltar, onUsarPix }) {
  return metodo === 'Cartão' ? (
    <Cartao valor={valor} hoje={hoje} onVoltar={onVoltar} onUsarPix={onUsarPix} />
  ) : (
    <Boleto valor={valor} destino={destino} hoje={hoje} onVoltar={onVoltar} onUsarPix={onUsarPix} />
  )
}

function Pendencia({ erro, onUsarPix }) {
  if (!erro) return null
  return (
    <Aviso erro>
      {erro} Nenhum dado foi enviado e nada foi cobrado.{' '}
      <button type="button" className="link-botao" onClick={onUsarPix}>
        Concluir com PIX
      </button>
    </Aviso>
  )
}

function Cartao({ valor, hoje, onVoltar, onUsarPix }) {
  const [erros, setErros] = useState({})
  const [pendencia, setPendencia] = useState('')

  async function enviar(e) {
    e.preventDefault()
    const encontrados = validarCartao(Object.fromEntries(new FormData(e.currentTarget)), hoje)
    setErros(encontrados)
    setPendencia('')
    if (Object.keys(encontrados).length > 0) return
    try {
      await doacoesService.pagarComCartao({ valor })
    } catch (falha) {
      setPendencia(falha.message)
    }
  }

  const erroCampo = (campo) => erros[campo] && <small role="alert" className="erro-campo">{erros[campo]}</small>

  return (
    <Secao titulo="Pagamento com cartão" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <AvisoIndisponivel recurso="cartao">Não informe dados reais do seu cartão.</AvisoIndisponivel>
      <form onSubmit={enviar} className="form-grid" noValidate>
        <div className="campo--inteiro">
          <Campo rotulo="Nome no cartão" name="nome" required autoComplete="off" aria-invalid={Boolean(erros.nome)} />
          {erroCampo('nome')}
        </div>
        <div className="campo--inteiro">
          <Campo
            rotulo="Número do cartão"
            name="numero"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000 0000 0000"
            aria-invalid={Boolean(erros.numero)}
          />
          {erroCampo('numero')}
        </div>
        <div>
          <Campo rotulo="Validade (MM/AA)" name="validade" required autoComplete="off" placeholder="MM/AA" aria-invalid={Boolean(erros.validade)} />
          {erroCampo('validade')}
        </div>
        <div>
          <Campo rotulo="CVV" name="cvv" required inputMode="numeric" autoComplete="off" maxLength={4} aria-invalid={Boolean(erros.cvv)} />
          {erroCampo('cvv')}
        </div>
        <div className="campo--inteiro">
          <Pendencia erro={pendencia} onUsarPix={onUsarPix} />
        </div>
        <div className="acoes campo--inteiro">
          <Botao secundario onClick={onVoltar}>Voltar</Botao>
          <Botao type="submit">Pagar {formatarMoeda(valor)}</Botao>
        </div>
      </form>
    </Secao>
  )
}

function Boleto({ valor, destino, hoje, onVoltar, onUsarPix }) {
  const [pendencia, setPendencia] = useState('')

  async function gerar() {
    setPendencia('')
    try {
      await doacoesService.gerarBoleto({ valor })
    } catch (falha) {
      setPendencia(falha.message)
    }
  }

  return (
    <Secao titulo="Pagamento com boleto" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <AvisoIndisponivel recurso="boleto" />
      <dl className="boleto">
        <div>
          <dt>Beneficiário</dt>
          <dd>{destino.entidade}</dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd>{formatarMoeda(valor)}</dd>
        </div>
        <div>
          <dt>Vencimento previsto</dt>
          <dd>{formatarData(somarDias(hoje, 3))}</dd>
        </div>
      </dl>
      <p>A compensação de um boleto leva até 3 dias úteis após o pagamento.</p>
      <Pendencia erro={pendencia} onUsarPix={onUsarPix} />
      <div className="acoes">
        <Botao secundario onClick={onVoltar}>Voltar</Botao>
        <Botao onClick={gerar}>Gerar boleto</Botao>
      </div>
    </Secao>
  )
}
