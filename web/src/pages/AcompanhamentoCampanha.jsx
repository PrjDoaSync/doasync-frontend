import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import { Ico } from '../components/IconesCampanha'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { HOJE_DEMO, HORA_DEMO, detalheCampanha } from '../mocks/campanhasDetalhe'
import { diasRestantes } from '../utils/campanhas'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import '../styles/campanhas.css'

// [DEV-CAM-09] Acompanhamento da campanha (#93). Dados de demonstração.
// SEM CONTRATO na API: itens por tipo, famílias, timeline, publicar atualização,
// filtro por período, exportação e paginação.
export default function AcompanhamentoCampanha() {
  const { id } = useParams()
  const { dados, atualizar } = useDemo()
  const c = dados.campanhas.find((item) => item.id === Number(id))
  const det = c ? detalheCampanha(c) : null
  const [modalidade, setModalidade] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [feedback, setFeedback] = useState('')

  if (!c)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>Verifique o endereço ou volte para a lista de campanhas.</Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const ativa = c.status === 'Ativa'
  const dias = diasRestantes(c.encerraEm)
  const itensRec = det.itens.length ? det.itens.reduce((s, i) => s + i.recebido, 0) : c.itensRecebidos ?? 0
  const itensMeta = det.itens.length ? det.itens.reduce((s, i) => s + i.meta, 0) : c.itensMeta ?? 0
  const linhas = det.doacoes.linhas.filter((l) => !modalidade || l.tipo === modalidade)

  function publicar(e) {
    e.preventDefault()
    const texto = mensagem.trim()
    setFeedback('')
    if (!texto) return setErro('Escreva a mensagem antes de publicar.')
    const nova = { id: `nova-${det.timeline.length}`, data: `${formatarData(HOJE_DEMO)} · ${HORA_DEMO}`, titulo: texto.split(/[.!?\n]/)[0].slice(0, 60), texto, link: 'Atualização pública' }
    atualizar('campanhas', dados.campanhas.map((x) => (x.id === c.id ? { ...x, timeline: [nova, ...det.timeline] } : x)))
    setMensagem('')
    setErro('')
    setFeedback('Atualização publicada nesta sessão de demonstração.')
  }

  const colunas = [
    { chave: 'doador', titulo: 'Doador', render: (l) => <><strong>{l.doador}</strong><br /><small className="camp-ok">Recebida e confirmada</small></> },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'contribuicao', titulo: 'Contribuição', render: (l) => <strong>{l.contribuicao}</strong> },
    { chave: 'recebida', titulo: 'Recebida em' },
  ]

  return (
    <div className="camp">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{c.nome.split(':')[0]}</span> / Acompanhamento
      </nav>
      <PageHeader titulo="Acompanhamento da campanha" descricao={c.nome}>
        {ativa && <Botao para={`/campanhas/${c.id}/editar`} secundario><Icon nome="editar" size={16} /> Editar</Botao>}
        <Botao para={`/campanhas/${c.id}`} secundario><Icon nome="externo" size={16} /> Ver campanha</Botao>
      </PageHeader>
      <div className="camp-chips">
        <StatusBadge valor={c.status} />
        {ativa && <span className="badge badge--alerta">{dias <= 14 ? 'Urgente · ' : ''}{dias} dias restantes</span>}
        <span className="camp-data">{formatarData(c.criadaEm).slice(0, 5)} a {formatarData(c.encerraEm)}{det.atualizadoEm ? ` · Atualizado em ${det.atualizadoEm}` : ''}</span>
      </div>

      <section className="camp-kpis">
        <KpiCard rotulo="Arrecadação financeira" valor={formatarMoeda(c.arrecadado)} detalhe={`${percentual(c.arrecadado, c.meta)}% da meta de ${formatarMoeda(c.meta)}${det.doacoes.financeiras ? ` · ${det.doacoes.financeiras} doações` : ''}`} />
        <KpiCard rotulo="Itens recebidos" valor={`${itensRec} de ${itensMeta}`} detalhe={`${percentual(itensRec, itensMeta)}% da meta de itens${det.doacoes.itens ? ` · ${det.doacoes.itens} doações` : ''}`} />
        {det.familias
          ? <KpiCard rotulo="Famílias beneficiadas" valor={`${det.familias.atendidas} de ${det.familias.meta}`} detalhe={det.familias.nota} />
          : <KpiCard rotulo="Doações confirmadas" valor={String(det.doacoes.total)} detalhe="Somente doações confirmadas" />}
      </section>

      <div className="camp-grid">
        <div className="camp-col">
          <div className="camp-card">
            <div className="camp-cab"><h2>Doações recebidas</h2><button type="button" className="camp-botao" disabled aria-disabled="true"><Icon nome="download" size={16} /> Exportar</button></div>
            <p className="camp-sub">Contribuições confirmadas nesta campanha.</p>
            <div className="camp-chips" style={{ margin: 0 }}>
              <select aria-label="Modalidade" value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
                <option value="">Todas as modalidades</option>
                <option>Pix</option><option>Cartão</option><option>Itens</option>
              </select>
              <select aria-label="Período" disabled><option>Todo o período</option></select>
            </div>
            <DataTable colunas={colunas} linhas={linhas} vazio="Nenhuma doação confirmada ainda." />
            <div className="camp-tabela-rodape">
              <span>{linhas.length} de {det.doacoes.total} doações · Página 1</span>
              <button type="button" className="camp-botao" disabled aria-disabled="true">Próxima <Ico nome="chevron" /></button>
            </div>
          </div>

          {det.itens.length > 0 && (
            <div className="camp-card">
              <div className="camp-cab"><h2>Progresso dos itens</h2><strong className="camp-link">{itensRec} de {itensMeta}</strong></div>
              {det.itens.map((i) => {
                const p = percentual(i.recebido, i.meta)
                return (
                  <div className="camp-prog" key={i.nome}>
                    <strong>{i.nome}</strong>
                    <div>
                      <div className="camp-prog__dados"><span>{i.recebido} de {i.meta}</span><strong>Faltam {Math.max(0, i.meta - i.recebido)}</strong></div>
                      <div className="progresso" role="img" aria-label={`${p}% de ${i.nome}`}><div className="progresso__barra" style={{ width: `${p}%` }} /></div>
                    </div>
                  </div>
                )
              })}
              <hr className="camp-sep" />
              <small className="camp-sub">Entregas de itens confirmadas pela {c.entidade}. O progresso financeiro é contabilizado separadamente.</small>
            </div>
          )}
        </div>

        <aside className="camp-aside">
          <div className="camp-card">
            <h2>Timeline de atualizações</h2>
            <p className="camp-sub">Mantenha os doadores informados sobre o impacto da campanha.</p>
            {det.timeline.length === 0 ? <p className="camp-sub">Nenhuma atualização publicada ainda.</p> : (
              <ul className="camp-tl">
                {det.timeline.map((t) => (
                  <li key={t.id}>
                    <span className="camp-tl__ponto"><Icon nome="check" size={13} /></span>
                    <div><span className="camp-sub">{t.data}</span><strong>{t.titulo}</strong>{t.texto}<br /><a href="#atualizacao">{t.link}</a></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <form className="camp-card" onSubmit={publicar} noValidate>
            <h2>Publicar uma atualização</h2>
            <Campo rotulo="Mensagem aos doadores" ajuda={erro || 'A mensagem ficará visível na página pública.'}>
              <textarea rows={4} placeholder="Conte uma novidade sobre a campanha…" value={mensagem} aria-invalid={!!erro} onChange={(e) => setMensagem(e.target.value)} />
            </Campo>
            {feedback && <Aviso>{feedback}</Aviso>}
            <Botao type="submit"><Ico nome="enviar" /> Publicar atualização</Botao>
          </form>
        </aside>
      </div>
    </div>
  )
}
