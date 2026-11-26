import { useState } from 'react'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import PaginacaoApi from '../components/PaginacaoApi'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Modal, Vazio } from '../components/Ui'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../services/entidadesService'
import { mapStatusEntidade } from '../services/mappers'
import { usuariosService } from '../services/usuariosService'

const tipos = { PESSOA_FISICA: 'Pessoa física', PESSOA_JURIDICA: 'Pessoa jurídica', ENTIDADE: 'Entidade', ADMIN: 'Administrador' }
const statusEntidades = ['PENDENTE', 'APROVADA', 'REPROVADA', 'INATIVA']

export default function AdministracaoContas({ entidades = false }) {
  const { usuario } = useAuth()
  if (usuario.tipo !== 'ADMIN') {
    return <Vazio principal titulo="Acesso restrito">Esta área é exclusiva de administradores da plataforma.</Vazio>
  }
  return <Lista key={`${usuario.id}-${entidades}`} adminId={usuario.id} entidades={entidades} />
}

function Lista({ adminId, entidades }) {
  const [filtros, setFiltros] = useState({ page: 1 })
  const [selecionado, setSelecionado] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const request = useRequest(
    (config) => usuariosService.listar({ ...filtros, ...(entidades && { tipo: 'ENTIDADE' }) }, config),
    [entidades, filtros],
  )

  function filtrar(event) {
    event.preventDefault()
    const { busca, tipo, status } = Object.fromEntries(new FormData(event.currentTarget))
    setFiltros({ page: 1, busca: busca.trim() || undefined, tipo: tipo || undefined, status: status || undefined })
    setMensagem('')
  }

  const colunas = [
    { chave: 'nome', titulo: entidades ? 'Conta da entidade' : 'Nome' },
    { chave: 'email', titulo: 'E-mail' },
    ...(entidades
      ? [{ chave: 'statusEntidade', titulo: 'Aprovação', render: (u) => <StatusBadge valor={mapStatusEntidade(u.statusEntidade) || 'Indisponível'} /> }]
      : [
        { chave: 'tipo', titulo: 'Tipo', render: (u) => tipos[u.tipo] ?? u.tipo },
        { chave: 'status', titulo: 'Status', render: (u) => <StatusBadge valor={u.status === 'ATIVO' ? 'Ativo' : 'Inativo'} /> },
      ]),
    { chave: 'acoes', titulo: 'Ações', render: (u) => (entidades ? u.entidadeId : u.id !== adminId) &&
      <Botao secundario disabled={request.loading || Boolean(request.error)} onClick={() => { setSelecionado(u); setMensagem('') }} aria-label={`Alterar status de ${u.nome}`}>Alterar status</Botao> },
  ]

  return (
    <>
      <PageHeader titulo={entidades ? 'Gestão de entidades' : 'Usuários e permissões'} descricao={entidades ? 'Consulte as contas de entidades e altere seu status de aprovação.' : 'Consulte as contas da plataforma e controle seu acesso.'} />
      <form className="cartao form-grid" onSubmit={filtrar}>
        <Campo name="busca" rotulo="Buscar por nome ou e-mail" type="search" />
        {!entidades && <Campo rotulo="Tipo de conta"><select name="tipo"><option value="">Todos</option>{Object.entries(tipos).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></Campo>}
        {!entidades && <Campo rotulo="Status"><select name="status"><option value="">Todos</option><option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option></select></Campo>}
        <div><Botao type="submit">Buscar</Botao></div>
      </form>
      {mensagem && <Aviso>{mensagem}</Aviso>}
      <section className="cartao">
        <RequestState {...request}>
          {(dados) => <>
            <DataTable linhas={dados.itens} colunas={colunas} />
            <PaginacaoApi dados={dados} ocupado={request.loading} selecionar={(page) => setFiltros((atual) => ({ ...atual, page }))} />
          </>}
        </RequestState>
      </section>
      {selecionado && <AlterarStatus usuario={selecionado} entidades={entidades} fechar={() => setSelecionado(null)} salvo={() => {
        setSelecionado(null)
        setMensagem('Status atualizado.')
        request.reload()
      }} />}
    </>
  )
}

function AlterarStatus({ usuario, entidades, fechar, salvo }) {
  const atual = entidades ? usuario.statusEntidade : usuario.status
  const [status, setStatus] = useState(entidades ? '' : (atual === 'ATIVO' ? 'INATIVO' : 'ATIVO'))
  const [motivo, setMotivo] = useState('')
  const salvar = useAsyncAction(() => entidades
    ? entidadesService.alterarStatus(usuario.entidadeId, { status, ...(status === 'REPROVADA' && { motivo: motivo.trim() }) })
    : usuariosService.alterarStatus(usuario.id, status))

  async function submit(event) {
    event.preventDefault()
    if (!status || (status === 'REPROVADA' && !motivo.trim())) return
    if (await salvar.executar()) salvo()
  }

  return (
    <Modal titulo={`Alterar status de ${usuario.nome}`} fechar={() => { if (!salvar.pending) fechar() }}>
      <form onSubmit={submit} className="pilha">
        {entidades
          ? <Campo rotulo="Novo status" required><select value={status} onChange={(e) => setStatus(e.target.value)} required disabled={salvar.pending}>
            <option value="">Selecione</option>
            {statusEntidades.filter((id) => id !== atual || id === 'REPROVADA').map((id) => <option value={id} key={id}>{mapStatusEntidade(id)}</option>)}
          </select></Campo>
          : <p>{status === 'ATIVO' ? 'Esta conta voltará a ter acesso à plataforma.' : 'Esta conta perderá acesso à plataforma.'}</p>}
        {status === 'REPROVADA' && <Campo rotulo="Motivo da reprovação" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={1000} required disabled={salvar.pending} />}
        {salvar.error && <Aviso erro>{salvar.error.message}</Aviso>}
        <Botao type="submit" disabled={!status || salvar.pending}>{salvar.pending ? 'Salvando…' : 'Confirmar mudança'}</Botao>
      </form>
    </Modal>
  )
}
