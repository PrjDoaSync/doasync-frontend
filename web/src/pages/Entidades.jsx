import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Modal } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../services/entidadesService'
import { mapStatusEntidade } from '../services/mappers'
import { usuariosService } from '../services/usuariosService'
import { formatarData } from '../utils/format'

const STATUS = ['Pendente', 'Aprovada', 'Reprovada', 'Inativa']

// Ações de aprovação por status atual (PATCH /entidades/{id}/status, contrato rota 10).
const ACOES = {
  PENDENTE: [
    { status: 'APROVADA', rotulo: 'Aprovar' },
    { status: 'REPROVADA', rotulo: 'Reprovar', exigeMotivo: true, perigo: true },
  ],
  APROVADA: [{ status: 'INATIVA', rotulo: 'Desativar', perigo: true, aviso: 'As campanhas ativas e agendadas da entidade serão encerradas.' }],
  REPROVADA: [{ status: 'PENDENTE', rotulo: 'Recolocar em análise' }],
  INATIVA: [{ status: 'PENDENTE', rotulo: 'Recolocar em análise' }],
}

// Gestão de entidades (ADMIN, passo 25). GET /entidades só lista APROVADA, então a lista vem de
// GET /usuarios?tipo=ENTIDADE, que traz entidadeId e statusEntidade de cada conta.
export default function Entidades() {
  const { usuario } = useAuth()
  if (usuario.tipo !== 'ADMIN')
    return (
      <>
        <PageHeader titulo="Gestão de entidades" />
        <Aviso>A aprovação de entidades é feita pela administração da plataforma.</Aviso>
      </>
    )
  return <Administracao />
}

function Administracao() {
  const request = useRequest((config) => usuariosService.listar({ tipo: 'ENTIDADE' }, config), [])
  const [aviso, setAviso] = useState('')
  return (
    <>
      <PageHeader titulo="Gestão de entidades" descricao="Analise os cadastros e acompanhe a situação de cada entidade na plataforma." />
      {aviso && <Aviso>{aviso}</Aviso>}
      <RequestState {...request}>
        {(contas) => (
          <Lista
            contas={contas.filter((c) => c.entidadeId)}
            concluir={(mensagem) => {
              setAviso(mensagem)
              request.reload()
            }}
          />
        )}
      </RequestState>
    </>
  )
}

function Lista({ contas, concluir }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [acao, setAcao] = useState(null)

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return contas.filter(
      (c) =>
        (!status || mapStatusEntidade(c.statusEntidadeApi) === status) &&
        (!termo || `${c.nome} ${c.razaoSocial} ${c.email} ${c.documento}`.toLocaleLowerCase('pt-BR').includes(termo)),
    )
  }, [contas, busca, status])
  const contar = (s) => contas.filter((c) => c.statusEntidadeApi === s).length

  const colunas = [
    {
      chave: 'nome',
      titulo: 'Entidade',
      render: (c) => (
        <>
          <strong>{c.razaoSocial || c.nome}</strong>
          <small>{c.documento} · {c.email}</small>
        </>
      ),
    },
    { chave: 'cadastro', titulo: 'Cadastro', render: (c) => (c.dataCadastro ? formatarData(c.dataCadastro.slice(0, 10)) : '—') },
    { chave: 'status', titulo: 'Situação', render: (c) => <StatusBadge valor={mapStatusEntidade(c.statusEntidadeApi)} /> },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (c) => (
        <span className="acoes-status">
          {(ACOES[c.statusEntidadeApi] ?? []).map((a) => (
            <button key={a.status} type="button" className="link-botao" onClick={() => setAcao({ ...a, conta: c })} aria-label={`${a.rotulo} ${c.razaoSocial || c.nome}`}>
              {a.rotulo}
            </button>
          ))}
        </span>
      ),
    },
  ]

  return (
    <>
      <section className="kpis">
        <KpiCard rotulo="Aguardando análise" valor={contar('PENDENTE')} />
        <KpiCard rotulo="Aprovadas" valor={contar('APROVADA')} />
        <KpiCard rotulo="Reprovadas ou inativas" valor={contar('REPROVADA') + contar('INATIVA')} />
      </section>
      <section className="cartao">
        <Filtros
          busca={busca}
          onBusca={setBusca}
          placeholder="Busque por nome, CNPJ ou e-mail"
          selects={[{ rotulo: 'Todas as situações', valor: status, onChange: setStatus, opcoes: STATUS }]}
        />
        <DataTable nome="Entidades cadastradas" colunas={colunas} linhas={filtradas} vazio={contas.length ? 'Nenhuma entidade encontrada.' : 'Nenhuma entidade cadastrada.'} />
      </section>
      {acao && <ConfirmarAcao acao={acao} fechar={() => setAcao(null)} concluir={(m) => { setAcao(null); concluir(m) }} />}
    </>
  )
}

function ConfirmarAcao({ acao, fechar, concluir }) {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const nome = acao.conta.razaoSocial || acao.conta.nome

  async function confirmar(e) {
    e.preventDefault()
    if (enviando) return
    if (acao.exigeMotivo && !motivo.trim()) return setErro('Informe o motivo da reprovação.')
    setEnviando(true)
    try {
      const resposta = await entidadesService.alterarStatus(acao.conta.entidadeId, acao.status, acao.exigeMotivo ? motivo : undefined)
      concluir(`${nome}: ${resposta?.message ?? 'situação atualizada.'}`)
    } catch (falha) {
      setEnviando(false)
      setErro(falha?.campos?.motivo ?? falha?.message ?? 'Não foi possível alterar a situação.')
    }
  }

  return (
    <Modal titulo={`${acao.rotulo}: ${nome}`} fechar={fechar}>
      <form noValidate onSubmit={confirmar}>
        {acao.aviso && <p>{acao.aviso}</p>}
        {acao.exigeMotivo && (
          <Campo rotulo="Motivo da reprovação" required ajuda={erro || 'O motivo é registrado e informado à entidade.'}>
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
