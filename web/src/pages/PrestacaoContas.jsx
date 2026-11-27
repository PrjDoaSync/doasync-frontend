import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AvisoIndisponivel from '../components/AvisoIndisponivel'
import CampanhaNaoEncontrada from '../components/CampanhaNaoEncontrada'
import DataTable from '../components/DataTable'
import { Ico } from '../components/IconesCampanha'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../hooks/useDemo'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import { checklist, paraNumero, prestacaoInicial, totalAplicado, validarDespesa } from '../utils/prestacao'
import '../styles/campanhas.css'

// [DEV-CAM-10] Encerramento e prestação de contas (#94). A campanha vem da API
// (GET /campanhas/{id}); o encerramento fica no Acompanhamento (PATCH /campanhas/{id}/status).
// SEM ROTA na API (services/indisponivel.js → prestacaoContas): despesas, relato, comprovantes
// e publicação. O relatório fica salvo só nesta sessão e anexos guardam só nome e tamanho.
export default function PrestacaoContas() {
  const { id } = useParams()
  const request = useRequest((config) => campanhasService.buscarGestao(id, config), [id])
  return (
    <RequestState {...request} naoEncontrado={<CampanhaNaoEncontrada />}>
      {(campanha) => <Prestacao key={campanha.id} campanha={campanha} />}
    </RequestState>
  )
}

function Prestacao({ campanha }) {
  const { usuario } = useAuth()
  const { dados, atualizar } = useDemo()
  const [prestacao, setPrestacao] = useState(() => dados.prestacoes?.[campanha.id] ?? prestacaoInicial())
  const [abrindo, setAbrindo] = useState(false)
  const [despesa, setDespesa] = useState({ descricao: '', valor: '', comprovante: '' })
  const [erros, setErros] = useState({})
  const [declaracao, setDeclaracao] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [publicando, setPublicando] = useState(false)

  const encerrada = campanha.status === 'Encerrada'
  const bloqueada = !encerrada || prestacao.publicada
  const aplicado = totalAplicado(prestacao.despesas)
  const saldo = campanha.arrecadado - aplicado
  const itens = checklist(prestacao, declaracao)
  const pronta = itens.every((i) => i.ok)

  // Guarda o relatório na sessão (DemoContext), por campanha, até a API existir.
  function persistir(proxima, texto) {
    setPrestacao(proxima)
    atualizar('prestacoes', { ...(dados.prestacoes ?? {}), [campanha.id]: proxima })
    setResultado({ erro: false, texto })
  }

  async function publicar() {
    persistir(prestacao, 'Relatório salvo nesta sessão.')
    setPublicando(true)
    try {
      await campanhasService.publicarPrestacaoContas(campanha.id, prestacao)
      persistir({ ...prestacao, publicada: true }, 'Prestação de contas publicada.')
    } catch (falha) {
      setResultado({ erro: true, texto: `${falha.message} O relatório continua salvo nesta sessão.` })
    } finally {
      setPublicando(false)
    }
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
      </div>
      <AvisoIndisponivel recurso="prestacaoContas">O relatório abaixo fica salvo somente nesta sessão.</AvisoIndisponivel>
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
            <p className="camp-sub">{[campanha.entidade, campanha.categoria].filter(Boolean).join(' · ')}</p>
            {encerrada && (
              <>
                <hr className="camp-sep" />
                <span className="rotulo-caps">Encerramento</span>
                <strong>{formatarData(campanha.encerraEm)}{campanha.arrecadado >= campanha.meta ? ' · Meta alcançada' : ''}</strong>
                <span className="camp-sub">Recebimento de doações finalizado. Relatório preparado por {usuario.nome}.</span>
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
                <Botao disabled={!pronta || publicando} aria-busy={publicando} onClick={publicar}>
                  {publicando ? 'Publicando…' : 'Publicar prestação de contas'}
                </Botao>
                <Botao secundario onClick={() => persistir(prestacao, 'Relatório salvo nesta sessão.')}>Salvar relatório</Botao>
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
