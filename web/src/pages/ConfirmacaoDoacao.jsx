import { Link, useParams } from 'react-router-dom'
import { Botao, Etapas, Icon, Secao, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { DOADOR, historicoDoadorDemo } from '../mocks/doador'
import { mensagemConfirmacao } from '../utils/doacoes'
import { formatarData, formatarMoeda } from '../utils/format'
import '../styles/detalhe-doacao.css'

// [DEV-DOA-08] Confirmação da doação (#102). Mostra o estado REAL da doação
// (recebida, aplicada ou pendente). SEM CONTRATO na API: PDFs de comprovante e recibo,
// reenvio de documentos, cartão/boleto (só PIX) e a tela DOA-10 ("Ver detalhe da doação").
export default function ConfirmacaoDoacao() {
  const { id, doacaoId } = useParams()
  const { dados } = useDemo()
  const d = (dados.historicoDoador ?? historicoDoadorDemo).find((item) => item.id === doacaoId && item.campanhaId === Number(id))

  if (!d)
    return (
      <>
        <Vazio titulo="Doação não encontrada" principal>Verifique o endereço ou consulte suas doações.</Vazio>
        <Botao para="/minhas-doacoes">Minhas doações</Botao>
      </>
    )

  const { titulo, texto, faixa } = mensagemConfirmacao(d, DOADOR.nome)
  const pendente = d.status === 'Pendente'
  const financeira = d.tipo === 'Financeira'
  const numero = d.id.replace('DS-', '')
  const docs = [
    ['Comprovante de pagamento', 'Registro do pagamento confirmado, com valor, data e referência da doação.', `COMP-${numero}`],
    ['Recibo de doação', `Declaração de recebimento pela ${d.entidade} para a campanha.`, `REC-${numero}`],
  ]

  return (
    <section className="public-section doacao-fluxo confirmacao">
      <div className="breadcrumb">
        <Link to="/explorar">Campanhas</Link><span>/</span>
        <Link to={`/campanhas/${d.campanhaId}`}>{d.campanha.split(':')[0]}</Link><span>/</span>Doar
      </div>
      <div className="public-page-title">
        <h1>{titulo}</h1>
        <p>{texto}</p>
      </div>
      <Etapas atual={pendente ? 3 : 4} itens={['Tipo de doação', 'Sua contribuição', 'Identificação', financeira ? 'Pagamento' : 'Agendamento']} />

      <div className={`banner-status${pendente ? ' banner-status--pendente' : ''}`} role="status">
        <span className="banner-status__icone"><Icon nome={pendente ? 'relogio' : 'check'} size={20} /></span>
        <div>
          <strong>{faixa}</strong>
          <small>{formatarData(d.data)} às {d.hora} · Doação {d.id}{financeira ? ' · contribuição única' : ''}</small>
        </div>
        <span className="banner-status__selo">{d.status}</span>
      </div>

      <div className="detalhe-grid">
        <div className="fluxo-conteudo">
          <Secao className="comprovante" titulo="Comprovante e recibo" acao={<span className="badge badge--neutro">DEMONSTRAÇÃO</span>}>
            <div className="comprovante-linhas">
            <dl className="linhas-resumo"><div><dt>Doação</dt><dd><strong>{d.id}</strong></dd></div></dl>
            <p className="linhas-resumo__campanha">{d.campanha}</p>
            <dl className="linhas-resumo">
              <div><dt>Entidade beneficiária</dt><dd><strong>{d.entidade}</strong></dd></div>
              <div><dt>Doadora</dt><dd><strong>{DOADOR.nome}</strong></dd></div>
              <div><dt>Pagamento</dt><dd><strong>{financeira ? d.meioDetalhe : 'Não se aplica'}</strong></dd></div>
              <div><dt>Data de recebimento</dt><dd><strong>{formatarData(d.data)} · {d.hora}</strong></dd></div>
            </dl>
            </div>
            <div className="total-linha">
              <span>{financeira ? 'Total recebido' : 'Itens'}</span>
              <strong className="numero-destaque">{financeira ? formatarMoeda(d.valor) : d.titulo}</strong>
            </div>
            <div className="form-grid">
              {docs.map(([nome, descricao, codigo]) => (
                <div className="doc-card" key={nome}>
                  <Icon nome="arquivo" size={22} />
                  <h3>{nome}</h3>
                  <p>{descricao}</p>
                  <small>{codigo} · PDF demonstrativo</small>
                  <Botao secundario disabled><Icon nome="download" /> Baixar PDF</Botao>
                </div>
              ))}
            </div>
            <small>Documentos demonstrativos, sem validade fiscal ou bancária. {pendente ? 'Ficam disponíveis após a confirmação. ' : ''}Os PDFs dependem da integração com o backend.</small>
          </Secao>
        </div>

        <aside className="lateral-confirmacao">
          <div className="cartao">
            <h2>Acompanhe o impacto</h2>
            <dl className="linhas-resumo">
              <div><dt>Pagamento</dt><dd><strong>{d.pagamentoStatus}</strong></dd></div>
              <div><dt>Destinação</dt><dd><strong>{d.status}</strong></dd></div>
            </dl>
            <p className="nota-caixa"><Icon nome="info" size={16} /> Recebida não significa aplicada. A {d.entidade} atualizará o status quando o recurso for usado na campanha.</p>
            <Botao para={`/minhas-doacoes/${d.id}`}><Icon nome="seta" /> Ver detalhe da doação</Botao>
          </div>
          <div className="cartao">
            <Icon nome="email" size={20} />
            <h2>Uma cópia para você</h2>
            <p>Neste cenário, comprovante e recibo são enviados para:</p>
            <strong>{DOADOR.email}</strong>
            <p>O link seguro também dá acesso ao histórico, sem precisar criar uma senha.</p>
            <Botao secundario disabled><Icon nome="enviar" /> Reenviar documentos</Botao>
          </div>
        </aside>
      </div>

      <div className="acoes acoes--entre">
        <Botao para={`/campanhas/${d.campanhaId}`} secundario><Icon nome="voltar" /> Voltar à campanha</Botao>
        <Botao para="/minhas-doacoes"><Icon nome="doacoes" /> Minhas doações</Botao>
      </div>
    </section>
  )
}
