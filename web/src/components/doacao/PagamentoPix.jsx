import AvisoIndisponivel from '../AvisoIndisponivel'
import { Aviso, Botao, Icon, Secao } from '../Ui'
import { formatarMoeda } from '../../utils/format'

// DOA-04 (#98). POST /doacoes registra a doação PIX, mas ainda não há provedor: a API não gera
// QR Code nem código "copia e cola" e não há cobrança. A tela não exibe código fictício.
export default function PagamentoPix({ valor, resumo, enviando, erro, onVoltar, onConfirmar }) {
  return (
    <Secao titulo="Pagamento via PIX" descricao={`Valor da doação: ${formatarMoeda(valor)}`}>
      <div className="pix">
        <div className="pix__qr" role="img" aria-label="QR Code PIX indisponível: sem provedor de pagamento integrado">
          <Icon nome="carteira" size={44} />
          <small>QR Code indisponível</small>
        </div>
        <div className="pix__texto">
          <ol className="pix__passos">
            <li>Confira o resumo da sua doação.</li>
            <li>Confirme para registrar a doação na plataforma.</li>
            <li>O comprovante fica disponível em Meu histórico.</li>
          </ol>
          <ul className="resumo-final">
            {resumo.map(([rotulo, texto]) => (
              <li key={rotulo}>
                <span>{rotulo}</span>
                <strong>{texto}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AvisoIndisponivel recurso="provedorPix">
        Ao confirmar, nenhum valor é cobrado: a doação é registrada e entra no total arrecadado.
      </AvisoIndisponivel>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar} disabled={enviando}>Voltar</Botao>
        <Botao onClick={onConfirmar} disabled={enviando} aria-busy={enviando}>
          {enviando ? 'Registrando…' : 'Confirmar doação'}
        </Botao>
      </div>
    </Secao>
  )
}
