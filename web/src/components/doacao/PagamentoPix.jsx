import { useState } from 'react'
import { Aviso, Botao, Icon, Secao } from '../Ui'
import { formatarMoeda } from '../../utils/format'
import { gerarCodigoPix } from '../../utils/doacao'
import '../../styles/doacao.css'

// DOA-04. Não existe integração com banco: o QR Code e o código são ilustrativos.
export default function PagamentoPix({ valor, campanha, enviando, erro, onVoltar, onConcluir }) {
  const [copia, setCopia] = useState('')
  const codigo = gerarCodigoPix(valor, campanha.id)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopia('Código copiado.')
    } catch {
      setCopia('Não foi possível copiar. Selecione o código e copie manualmente.')
    }
  }

  return (
    <Secao titulo="Pagamento via PIX" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <div className="pix">
        <div className="pix__qr" role="img" aria-label="QR Code ilustrativo da demonstração">
          <Icon nome="itens" size={44} />
          <small>QR Code ilustrativo</small>
        </div>
        <div className="pix__texto">
          <ol className="pix__passos">
            <li>Abra o aplicativo do seu banco e escolha pagar com PIX.</li>
            <li>Escaneie o QR Code ou use o código “copia e cola”.</li>
            <li>Confira o valor e confirme o pagamento.</li>
          </ol>
          <label className="pix__codigo">
            <span>Código PIX (demonstração)</span>
            <textarea readOnly rows={3} value={codigo} />
          </label>
          <div className="acoes acoes--inicio">
            <Botao secundario onClick={copiar}>
              Copiar código
            </Botao>
            <small role="status">{copia}</small>
          </div>
          <small>O código é válido por 30 minutos. Após o pagamento, a entidade confirma o recebimento.</small>
        </div>
      </div>
      <Aviso>
        Este PIX é uma demonstração: o código não é válido e nenhum valor será cobrado. O pagamento real depende da
        integração com o provedor.
      </Aviso>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar} disabled={enviando}>
          Voltar
        </Botao>
        <Botao onClick={() => onConcluir({ metodo: 'PIX' })} disabled={enviando}>
          {enviando ? 'Registrando…' : 'Já fiz o pagamento (demonstração)'}
        </Botao>
      </div>
    </Secao>
  )
}
