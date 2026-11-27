import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import Paginacao from '../components/Paginacao'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Modal } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { usuariosService } from '../services/usuariosService'
import { formatarData } from '../utils/format'
import { fatiar } from '../utils/paginacao'

const POR_PAGINA = 10
const TIPOS = ['Pessoa física', 'Pessoa jurídica', 'Entidade', 'Administrador']

// Usuários da plataforma (ADMIN, passo 24): GET /usuarios e PATCH /usuarios/{id}/status.
// Conta INATIVO não faz login. O administrador não desativa a própria conta (409 do servidor).
export default function UsuariosPlataforma() {
  const { usuario } = useAuth()
  // Só o ADMIN consulta GET /usuarios: os demais perfis nem disparam a requisição.
  if (usuario.tipo !== 'ADMIN')
    return (
      <>
        <PageHeader titulo="Usuários da plataforma" />
        <Aviso>Esta área é exclusiva da administração da plataforma.</Aviso>
      </>
    )
  return <Administracao proprioId={usuario.id} />
}

function Administracao({ proprioId }) {
  const request = useRequest((config) => usuariosService.listar({}, config), [])
  const [aviso, setAviso] = useState('')
  return (
    <>
      <PageHeader titulo="Usuários da plataforma" descricao="Contas de doadores, entidades e administradores." />
      {aviso && <Aviso>{aviso}</Aviso>}
      <RequestState {...request}>
        {(contas) => (
          <Lista
            contas={contas}
            proprioId={proprioId}
            bloqueado={request.loading || Boolean(request.error)}
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

function Lista({ contas, proprioId, bloqueado, concluir }) {
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState('')
  const [pagina, setPagina] = useState(1)
  const [alvo, setAlvo] = useState(null)

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return contas.filter(
      (c) =>
        (!tipo || c.tipo === tipo) &&
        (!status || c.status === status) &&
        (!termo || `${c.nome} ${c.email}`.toLocaleLowerCase('pt-BR').includes(termo)),
    )
  }, [contas, busca, tipo, status])
  const filtrar = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  const colunas = [
    { chave: 'nome', titulo: 'Usuário', render: (c) => <><strong>{c.nome}</strong><small>{c.email}</small></> },
    { chave: 'tipo', titulo: 'Perfil' },
    { chave: 'cadastro', titulo: 'Cadastro', render: (c) => (c.dataCadastro ? formatarData(c.dataCadastro.slice(0, 10)) : '—') },
    { chave: 'status', titulo: 'Situação', render: (c) => <StatusBadge valor={c.status} /> },
    {
      chave: 'acao',
      titulo: 'Ação',
      render: (c) =>
        c.id === proprioId ? (
          <small>Sua conta</small>
        ) : (
          <button type="button" className="link-botao" disabled={bloqueado} onClick={() => setAlvo(c)} aria-label={`${c.statusApi === 'ATIVO' ? 'Desativar' : 'Ativar'} ${c.nome}`}>
            {c.statusApi === 'ATIVO' ? 'Desativar' : 'Ativar'}
          </button>
        ),
    },
  ]

  return (
    <>
      <section className="kpis">
        <KpiCard rotulo="Contas ativas" valor={contas.filter((c) => c.statusApi === 'ATIVO').length} />
        <KpiCard rotulo="Contas inativas" valor={contas.filter((c) => c.statusApi === 'INATIVO').length} />
        <KpiCard rotulo="Total de contas" valor={contas.length} />
      </section>
      <section className="cartao">
        <Filtros
          busca={busca}
          onBusca={filtrar(setBusca)}
          placeholder="Buscar por nome ou e-mail"
          selects={[
            { rotulo: 'Todos os perfis', valor: tipo, onChange: filtrar(setTipo), opcoes: TIPOS },
            { rotulo: 'Todas as situações', valor: status, onChange: filtrar(setStatus), opcoes: ['Ativo', 'Inativo'] },
          ]}
        />
        <DataTable nome="Usuários da plataforma" colunas={colunas} linhas={fatiar(filtradas, pagina, POR_PAGINA)} vazio="Nenhum usuário encontrado." />
        <Paginacao pagina={pagina} total={filtradas.length} porPagina={POR_PAGINA} onPagina={setPagina} rotulo="Páginas de usuários" />
      </section>
      {alvo && <Confirmar conta={alvo} fechar={() => setAlvo(null)} concluir={(m) => { setAlvo(null); concluir(m) }} />}
    </>
  )
}

function Confirmar({ conta, fechar, concluir }) {
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const desativar = conta.statusApi === 'ATIVO'
  async function confirmar() {
    if (enviando) return
    setEnviando(true)
    try {
      const resposta = await usuariosService.alterarStatus(conta.id, desativar ? 'INATIVO' : 'ATIVO')
      concluir(`${conta.nome}: ${resposta?.message ?? 'situação atualizada.'}`)
    } catch (falha) {
      setEnviando(false)
      setErro(falha?.message ?? 'Não foi possível alterar a situação da conta.')
    }
  }
  return (
    <Modal titulo={`${desativar ? 'Desativar' : 'Ativar'} conta`} fechar={fechar}>
      <p>
        {desativar
          ? `${conta.nome} não poderá mais entrar e perderá o acesso imediatamente.`
          : `${conta.nome} voltará a poder entrar na plataforma.`}
      </p>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={fechar} disabled={enviando}>Cancelar</Botao>
        <Botao className={desativar ? 'botao--perigo' : ''} onClick={confirmar} disabled={enviando} aria-busy={enviando}>
          {enviando ? 'Enviando…' : desativar ? 'Confirmar desativação' : 'Confirmar ativação'}
        </Botao>
      </div>
    </Modal>
  )
}
