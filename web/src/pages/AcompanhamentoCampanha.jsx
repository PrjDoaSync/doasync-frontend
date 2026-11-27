import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import Paginacao from '../components/Paginacao'
import CampanhaNaoEncontrada from '../components/CampanhaNaoEncontrada'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Modal } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { doacoesService } from '../services/doacoesService'
import { acoesDeStatus, diasAte, podeEditar } from '../utils/campanhas'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import { fatiar } from '../utils/paginacao'
import '../styles/campanhas.css'

const POR_PAGINA = 10

// [DEV-CAM-09] Acompanhamento da campanha (#93) e encerramento (#94, CAM-10).
// GET /campanhas/{id} (dona ou ADMIN), GET /entidades/{id}/doacoes?campanhaId= e
// PATCH /campanhas/{id}/status. SEM CONTRATO na API: itens por tipo, timeline de
// atualizações, prestação de contas e exportação — ficam fora desta tela.
export default function AcompanhamentoCampanha() {
  const { id } = useParams()
  const request = useRequest((config) => campanhasService.buscarGestao(id, config), [id])
  return (
    <RequestState {...request} naoEncontrado={<CampanhaNaoEncontrada />}>
      {(campanha) => <Acompanhamento campanha={campanha} recarregar={request.reload} />}
    </RequestState>
  )
}

function Acompanhamento({ campanha: c, recarregar }) {
  const { usuario } = useAuth()
  const doacoes = useRequest(
    (config) => doacoesService.recebidas(c.entidadeId, { campanhaId: c.id }, config),
    [c.entidadeId, c.id],
  )
  const [acao, setAcao] = useState(null)
  const [aviso, setAviso] = useState('')

  const dona = usuario.tipo === 'ENTIDADE' && usuario.entidadeId === c.entidadeId
  const acoes = acoesDeStatus(c, usuario)
  const ativa = c.status === 'Ativa'
  const dias = diasAte(c.encerraEm)
  const pct = percentual(c.arrecadado, c.meta)

  return (
    <div className="camp">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>
        {c.nome}
        <span>/</span>Acompanhamento
      </nav>
      <PageHeader titulo="Acompanhamento da campanha" descricao={c.nome}>
        <div className="acoes">
          {dona && podeEditar(c.status) && (
            <Botao para={`/campanhas/${c.id}/editar`} secundario>
              <Icon nome="editar" size={16} /> Editar
            </Botao>
          )}
          {c.recebendoDoacoes && (
            <Botao para={`/campanhas/${c.id}`} secundario>
              <Icon nome="externo" size={16} /> Ver campanha
            </Botao>
          )}
        </div>
      </PageHeader>
      <p className="camp-chips">
        <StatusBadge valor={c.status} />
        {ativa && <span className="badge badge--alerta">{dias} dias restantes</span>}
        <span className="camp-data">
          {formatarData(c.iniciaEm)} a {formatarData(c.encerraEm)} · {c.entidade}
        </span>
      </p>
      {c.status === 'Desativada' && c.motivoDesativacao && (
        <Aviso erro>Desativada pelo administrador: {c.motivoDesativacao}</Aviso>
      )}
      {aviso && <Aviso>{aviso}</Aviso>}

      <section className="camp-kpis">
        <KpiCard rotulo="Arrecadação financeira" valor={formatarMoeda(c.arrecadado)} detalhe={`${pct}% da meta de ${formatarMoeda(c.meta)}`} />
        <KpiCard
          rotulo="Doações confirmadas"
          valor={doacoes.data ? doacoes.data.filter((d) => d.status === 'Confirmada').length : '—'}
          detalhe="Somente doações confirmadas entram na arrecadação"
        />
        <KpiCard rotulo="Falta para a meta" valor={formatarMoeda(Math.max(0, c.meta - c.arrecadado))} />
      </section>

      <div className="camp-grid">
        <div className="camp-col">
          <section className="camp-card">
            <div className="camp-cab">
              <h2>Doações recebidas</h2>
            </div>
            <p className="camp-sub">Contribuições registradas nesta campanha, mais recentes primeiro.</p>
            <RequestState {...doacoes}>{(lista) => <TabelaDoacoes doacoes={lista} />}</RequestState>
          </section>
        </div>
        <aside className="camp-aside">
          <section className="camp-card">
            <h2>Situação da campanha</h2>
            <p className="camp-sub">
              {acoes.length
                ? 'As mudanças de status são registradas pelo servidor.'
                : `Nenhuma mudança de status disponível para a campanha ${c.status.toLowerCase()}.`}
            </p>
            {acoes.length > 0 && (
              <div className="acoes-status">
                {acoes.map((a) => (
                  <Botao key={a.status + a.rotulo} className={a.perigo ? 'botao--perigo' : ''} onClick={() => setAcao(a)}>
                    {a.rotulo}
                  </Botao>
                ))}
              </div>
            )}
          </section>
          <p className="camp-nota">Timeline de atualizações e prestação de contas dependem de rotas que ainda não existem na API.</p>
        </aside>
      </div>

      {acao && (
        <ConfirmarStatus
          campanha={c}
          acao={acao}
          fechar={() => setAcao(null)}
          concluir={(mensagem) => {
            setAcao(null)
            setAviso(mensagem)
            recarregar()
          }}
        />
      )}
    </div>
  )
}

function TabelaDoacoes({ doacoes }) {
  const [pagina, setPagina] = useState(1)
  const colunas = [
    { chave: 'doador', titulo: 'Doador', render: (d) => <strong>{d.doador}</strong> },
    { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
    { chave: 'forma', titulo: 'Forma', render: (d) => d.formaPagamento },
    { chave: 'data', titulo: 'Data', render: (d) => (d.data ? formatarData(d.data.slice(0, 10)) : '—') },
    { chave: 'status', titulo: 'Status', render: (d) => <StatusBadge valor={d.status} /> },
    { chave: 'comprovante', titulo: 'Comprovante', render: (d) => d.comprovante },
  ]
  return (
    <>
      <DataTable nome="Doações da campanha" colunas={colunas} linhas={fatiar(doacoes, pagina, POR_PAGINA)} vazio="Nenhuma doação registrada nesta campanha ainda." />
      <Paginacao pagina={pagina} total={doacoes.length} porPagina={POR_PAGINA} onPagina={setPagina} rotulo="Páginas de doações" />
    </>
  )
}

function ConfirmarStatus({ campanha, acao, fechar, concluir }) {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar(e) {
    e.preventDefault()
    if (enviando) return
    if (acao.exigeMotivo && !motivo.trim()) return setErro('Informe o motivo da desativação.')
    if (motivo.trim().length > 1000) return setErro('Use até 1.000 caracteres.')
    setEnviando(true)
    setErro('')
    try {
      const resposta = await campanhasService.alterarStatus(campanha.id, acao.status, acao.exigeMotivo ? motivo : undefined)
      concluir(resposta?.message ?? 'Status da campanha atualizado.')
    } catch (falha) {
      setEnviando(false)
      setErro(falha?.campos?.motivo ?? falha?.message ?? 'Não foi possível alterar o status.')
    }
  }

  return (
    <Modal titulo={acao.rotulo} fechar={fechar}>
      <form noValidate onSubmit={confirmar}>
        <p>{acao.confirmacao}</p>
        {acao.exigeMotivo && (
          <Campo rotulo="Motivo" required ajuda={erro || 'O motivo fica registrado e é exibido para a entidade.'}>
            <textarea rows={3} maxLength={1000} value={motivo} aria-invalid={erro ? true : undefined} onChange={(e) => setMotivo(e.target.value)} />
          </Campo>
        )}
        {erro && !acao.exigeMotivo && <Aviso erro>{erro}</Aviso>}
        <div className="acoes">
          <Botao secundario onClick={fechar} disabled={enviando}>Cancelar</Botao>
          <Botao type="submit" className={acao.perigo ? 'botao--perigo' : ''} disabled={enviando} aria-busy={enviando}>
            {enviando ? 'Enviando…' : `Confirmar: ${acao.rotulo.toLowerCase()}`}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}
