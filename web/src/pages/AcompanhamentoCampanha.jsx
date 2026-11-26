import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Vazio } from '../components/Ui'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { mapStatusCampanha } from '../services/mappers'
import { podeEditar } from '../utils/campanhas'
import { formatarData, formatarMoeda } from '../utils/format'

const transicoes = {
  Rascunho: ['AGENDADA', 'ATIVA', 'DESATIVADA'],
  Agendada: ['ATIVA', 'DESATIVADA'],
  Ativa: ['ENCERRADA', 'DESATIVADA'],
}

export default function AcompanhamentoCampanha() {
  const { id } = useParams()
  return <ConsultaAcompanhamento key={id} id={id} />
}

function ConsultaAcompanhamento({ id }) {
  const { usuario } = useAuth()
  const request = useRequest((config) => campanhasService.buscarPublica(id, config).then((campanha) => ({ campanha })), [id])
  return (
    <>
      <PageHeader titulo="Acompanhamento da campanha"><Botao para="/campanhas" secundario>Voltar</Botao></PageHeader>
      <RequestState {...request}>
        {({ campanha }) => campanha && (usuario.tipo === 'ADMIN' || campanha.entidadeId === usuario.entidadeId)
          ? <Detalhes key={id} campanha={campanha} recarregar={request.reload} entidade={usuario.tipo === 'ENTIDADE'} />
          : <Vazio titulo="Campanha não encontrada" />}
      </RequestState>
    </>
  )
}

function Detalhes({ campanha, recarregar, entidade }) {
  const [novo, setNovo] = useState('')
  const [motivo, setMotivo] = useState('')
  const salvar = useAsyncAction((dados) => campanhasService.alterarStatus(campanha.id, dados))
  const opcoes = transicoes[campanha.status] ?? []

  async function submit(event) {
    event.preventDefault()
    if (!opcoes.includes(novo) || (novo === 'DESATIVADA' && !motivo.trim())) return
    const resposta = await salvar.executar({ status: novo, ...(novo === 'DESATIVADA' && { motivo: motivo.trim() }) })
    if (resposta) {
      setNovo('')
      setMotivo('')
      recarregar()
    }
  }

  return (
    <>
      <section className="cartao pilha">
        <h2>{campanha.nome}</h2>
        <p>{campanha.descricao}</p>
        <p>{campanha.entidade} · {formatarData(campanha.iniciaEm)} a {formatarData(campanha.encerraEm)}</p>
        <StatusBadge valor={campanha.status} />
        {campanha.motivoDesativacao && <p>{campanha.motivoDesativacao}</p>}
        {entidade && podeEditar(campanha.status) && <Botao para={`/campanhas/${campanha.id}/editar`} secundario>Editar campanha</Botao>}
      </section>
      <section className="kpis">
        <KpiCard rotulo="Arrecadado" valor={formatarMoeda(campanha.arrecadado)} />
        <KpiCard rotulo="Meta financeira" valor={formatarMoeda(campanha.meta)} />
        <KpiCard rotulo="Progresso" valor={`${campanha.percentual}%`} />
      </section>
      <section className="cartao">
        <h2>Doações recentes</h2>
        <DataTable linhas={campanha.ultimasDoacoes.map((d, i) => ({ ...d, id: i }))} colunas={[
          { chave: 'doador', titulo: 'Doador' },
          { chave: 'data', titulo: 'Data', render: (d) => formatarData(d.data) },
          { chave: 'valor', titulo: 'Valor', render: (d) => formatarMoeda(d.valor) },
        ]} vazio="Nenhuma doação recente." />
      </section>
      {opcoes.length > 0 && (
        <form className="cartao pilha" onSubmit={submit}>
          <h2>Alterar status</h2>
          <Campo rotulo="Novo status" required>
            <select required value={novo} onChange={(e) => setNovo(e.target.value)} disabled={salvar.pending}>
              <option value="">Selecione</option>
              {opcoes.map((opcao) => <option key={opcao} value={opcao}>{mapStatusCampanha(opcao)}</option>)}
            </select>
          </Campo>
          {novo === 'DESATIVADA' && <Campo rotulo="Motivo da desativação" required maxLength={1000} value={motivo} onChange={(e) => setMotivo(e.target.value)} disabled={salvar.pending} />}
          {(novo === 'ENCERRADA' || novo === 'DESATIVADA') && <Aviso>Esta alteração encerra o recebimento de doações para esta campanha.</Aviso>}
          <Botao type="submit" disabled={!novo || salvar.pending}>{salvar.pending ? 'Salvando…' : 'Confirmar mudança'}</Botao>
        </form>
      )}
      {salvar.success && <Aviso>Status atualizado.</Aviso>}
      {salvar.error && <Aviso erro>{salvar.error.message}</Aviso>}
    </>
  )
}
