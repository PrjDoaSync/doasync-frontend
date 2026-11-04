import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import { Ico } from '../components/IconesCampanha'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { detalheCampanha } from '../mocks/campanhasDetalhe'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import { checklist, paraNumero, prestacaoInicial, totalAplicado, validarDespesa } from '../utils/prestacao'
import '../styles/campanhas.css'

// [DEV-CAM-10] Encerramento e prestação de contas (#94). Persiste só na sessão
// de demonstração (dentro da campanha). SEM CONTRATO na API: despesas, relato,
// comprovantes (upload) e publicação. Anexos guardam só nome e tamanho, sem envio.
export default function PrestacaoContas() {
  const { id } = useParams()
  const { dados, atualizar } = useDemo()
  const campanha = dados.campanhas.find((c) => c.id === Number(id))
  const det = campanha ? detalheCampanha(campanha) : null
  const [prestacao, setPrestacao] = useState(() => campanha?.prestacao ?? det?.prestacao ?? prestacaoInicial())
  const [abrindo, setAbrindo] = useState(false)
  const [despesa, setDespesa] = useState({ descricao: '', valor: '', comprovante: '' })
  const [erros, setErros] = useState({})
  const [declaracao, setDeclaracao] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!campanha)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>Verifique o endereço ou volte para a lista de campanhas.</Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const encerrada = campanha.status === 'Encerrada'
  const bloqueada = !encerrada || prestacao.publicada
  const aplicado = totalAplicado(prestacao.despesas)
  const saldo = campanha.arrecadado - aplicado
  const itens = checklist(prestacao, declaracao)
  const pronta = itens.every((i) => i.ok)

  function persistir(proxima, texto) {
    setPrestacao(proxima)
    atualizar('campanhas', dados.campanhas.map((c) => (c.id === campanha.id ? { ...c, prestacao: proxima } : c)))
    setResultado({ erro: false, texto })
  }

  function adicionarDespesa(e) {
    e.preventDefault()
    const novos = validarDespesa(despesa, campanha, prestacao.despesas)
    setErros(novos)
    if (Object.keys(novos).length) return
    const nova = { id: `despesa-${prestacao.despesas.length + 1}`, descricao: despesa.descricao.trim(), detalhe: '', valor: paraNumero(despesa.valor), comprovante: despesa.comprovante.trim() || '—' }
    persistir({ ...prestacao, despesas: [...prestacao.despesas, nova] }, 'Despesa adicionada.')
    setDespesa({ descricao: '', valor: '', comprovante: '' })
    setAbrindo(false)
  }

  function anexar(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    const anexo = { id: `anexo-${prestacao.anexos.length + 1}`, nome: arquivo.name, tipo: 'Documento', tamanhoKb: Math.max(1, Math.round(arquivo.size / 1024)) }
    persistir({ ...prestacao, anexos: [...prestacao.anexos, anexo] }, `Comprovante ${arquivo.name} anexado.`)
    e.target.value = ''
  }

  const colunas = [
    { chave: 'descricao', titulo: 'Aplicação dos recursos', render: (d) => <><strong>{d.descricao}</strong>{d.detalhe && <><br /><small className="camp-sub">{d.detalhe}</small></>}</> },
    { chave: 'valor', titulo: 'Valor aplicado', render: (d) => <strong>{formatarMoeda(d.valor)}</strong> },
    { chave: 'comprovante', titulo: 'Comprovante', render: (d) => <span className="camp-link">{d.comprovante}</span> },
  ]

  return (
    <div className="camp">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{campanha.nome}</span> / Prestação de contas
      </nav>
      <PageHeader titulo="Encerramento e prestação de contas" descricao={`${campanha.nome} · Mostre como cada contribuição foi aplicada.`}>
        <Botao para={`/campanhas/${campanha.id}`} secundario><Icon nome="externo" size={16} /> Ver campanha pública</Botao>
      </PageHeader>
      <div className="camp-chips">
        <StatusBadge valor={campanha.status} />
        {encerrada && <span className="badge badge--neutro">Encerrada em {formatarData(campanha.encerraEm)}</span>}
        {encerrada && <span className={`badge ${prestacao.publicada ? 'badge--sucesso' : 'badge--info'}`}>Prestação de contas · {prestacao.publicada ? 'publicada' : 'em revisão'}</span>}
        {det.relatorioSalvoEm && <span className="camp-data">Relatório salvo às {det.relatorioSalvoEm}</span>}
      </div>
      {!encerrada ? (
        <Aviso>A prestação de contas só está disponível para campanhas encerradas. Status atual: {campanha.status}.</Aviso>
      ) : prestacao.publicada ? (
        <Aviso>Prestação de contas publicada. O relatório ficou visível na campanha e não pode mais ser alterado.</Aviso>
      ) : (
        <Aviso>A campanha não recebe mais doações. Revise o relatório e os comprovantes para publicar a prestação de contas aos doadores.</Aviso>
      )}

      <section className="camp-kpis">
        <KpiCard rotulo="Total arrecadado" valor={formatarMoeda(campanha.arrecadado)} detalhe={`${percentual(campanha.arrecadado, campanha.meta)}% da meta financeira de ${formatarMoeda(campanha.meta)}`} />
        <KpiCard rotulo="Recursos aplicados" valor={formatarMoeda(aplicado)} detalhe={`${percentual(aplicado, campanha.arrecadado)}% do valor arrecadado comprovado`} />
        <KpiCard rotulo="Saldo restante" valor={formatarMoeda(saldo)} detalhe={saldo === 0 ? 'Não há recursos pendentes de aplicação' : 'Recursos ainda sem aplicação registrada'} />
      </section>

      <div className="camp-grid">
        <div className="camp-col">
          <div className="camp-card">
            <div className="camp-cab">
              <h2>Como os recursos foram aplicados</h2>
              {!bloqueada && <button type="button" className="camp-botao" onClick={() => setAbrindo(!abrindo)}><Icon nome="mais" size={15} /> Adicionar despesa</button>}
            </div>
            <p className="camp-sub">Despesas vinculadas exclusivamente a esta campanha.</p>
            {abrindo && !bloqueada && (
              <form onSubmit={adicionarDespesa} className="camp-campos" noValidate>
                <Campo rotulo="Descrição da despesa" required className="inteiro" ajuda={erros.descricao}>
                  <input value={despesa.descricao} aria-invalid={!!erros.descricao} onChange={(e) => setDespesa({ ...despesa, descricao: e.target.value })} />
                </Campo>
                <Campo rotulo="Valor (R$)" required ajuda={erros.valor}>
                  <input inputMode="decimal" value={despesa.valor} aria-invalid={!!erros.valor} onChange={(e) => setDespesa({ ...despesa, valor: e.target.value })} />
                </Campo>
                <Campo rotulo="Nº do comprovante" ajuda="Ex.: NF 0821">
                  <input value={despesa.comprovante} onChange={(e) => setDespesa({ ...despesa, comprovante: e.target.value })} />
                </Campo>
                <div className="camp-acoes inteiro"><Botao type="submit" secundario>Salvar despesa</Botao></div>
              </form>
            )}
            <DataTable colunas={colunas} linhas={prestacao.despesas} vazio="Nenhuma despesa registrada ainda." />
            <div className="camp-total"><span>Total aplicado</span><strong>{formatarMoeda(aplicado)}</strong></div>
          </div>

          <div className="camp-card">
            <h2>Resultados e impacto</h2>
            <Campo rotulo="Relato de aplicação dos recursos" required>
              <textarea rows={5} value={prestacao.relato} disabled={bloqueada} onChange={(e) => setPrestacao({ ...prestacao, relato: e.target.value })} />
            </Campo>
            {det.impacto?.itens && (
              <div className="camp-impacto">
                <Icon nome="itens" size={20} />
                <div><strong>{det.impacto.itens}</strong><br /><small className="camp-sub">Itens doados entregues à comunidade · contabilizados separadamente dos recursos financeiros.</small></div>
              </div>
            )}
          </div>

          <div className="camp-card">
            <div className="camp-cab">
              <h2>Comprovantes anexados</h2>
              {!bloqueada && (
                <label className="camp-botao"><Ico nome="upload" /> Anexar documento
                  <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={anexar} />
                </label>
              )}
            </div>
            {prestacao.anexos.length === 0 && <p className="camp-sub">Nenhum comprovante anexado ainda.</p>}
            {prestacao.anexos.map((a) => (
              <div className="camp-arq" key={a.id}>
                <span className="camp-arq__icone"><Ico nome="arquivo" size={18} /></span>
                <div><strong>{a.nome}</strong><br /><small className="camp-sub">{a.tipo ?? 'Documento'} · {a.tamanhoKb} KB</small></div>
                <span className="badge badge--sucesso">Anexado</span>
              </div>
            ))}
            <small className="camp-sub">Os comprovantes serão disponibilizados junto ao relatório público.</small>
          </div>
        </div>

        <aside className="camp-aside">
          <div className="camp-card">
            <span><StatusBadge valor={campanha.status} /></span>
            {campanha.imagem && <img className="camp-capa" src={campanha.imagem} alt="" />}
            <h2>{campanha.nome}</h2>
            <p className="camp-sub">{campanha.entidade} · {campanha.categoria}</p>
            {det.impacto && (
              <>
                <hr className="camp-sep" />
                <span className="rotulo-caps">Impacto alcançado</span>
                <strong className="valor-grande">{det.impacto.pessoas} pessoas</strong>
                <span>{det.impacto.texto}</span>
                <span className="camp-sub">{det.impacto.detalhe}</span>
              </>
            )}
            {encerrada && (
              <>
                <hr className="camp-sep" />
                <span className="rotulo-caps">Encerramento</span>
                <strong>{formatarData(campanha.encerraEm)}{campanha.arrecadado >= campanha.meta ? ' · Meta alcançada' : ''}</strong>
                <span className="camp-sub">Recebimento de doações finalizado. Relatório preparado por Ana Silva.</span>
              </>
            )}
          </div>

          <div className="camp-card">
            <h2>Pronto para prestar contas</h2>
            <ul className="camp-check">
              {itens.map((i) => (
                <li key={i.chave} className={i.ok ? 'feito' : ''}>{i.ok ? <Icon nome="check" size={15} /> : '○'} {i.texto}</li>
              ))}
            </ul>
            {!bloqueada && (
              <>
                <hr className="camp-sep" />
                <label className="camp-sub">
                  <input type="checkbox" checked={declaracao} onChange={(e) => setDeclaracao(e.target.checked)} />{' '}
                  Declaro que o relatório e os comprovantes refletem a aplicação dos recursos recebidos.
                </label>
                <Botao disabled={!pronta} onClick={() => persistir({ ...prestacao, publicada: true }, 'Prestação de contas publicada.')}>Publicar prestação de contas</Botao>
                <Botao secundario onClick={() => persistir(prestacao, 'Relatório salvo nesta sessão de demonstração.')}>Salvar relatório</Botao>
                <small className="camp-sub">Ao publicar, o relatório ficará visível na campanha e os doadores serão notificados.</small>
              </>
            )}
            {resultado && <Aviso erro={resultado.erro}>{resultado.texto}</Aviso>}
          </div>
        </aside>
      </div>
    </div>
  )
}
