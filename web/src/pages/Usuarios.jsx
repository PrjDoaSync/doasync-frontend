import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import Filtros from '../components/Filtros'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Modal, Secao } from '../components/Ui'

const papeis = ['Administradora', 'Operador', 'Consulta']
export default function Usuarios() {
  const { dados, atualizar, notificar } = useDemo(),
    [busca, setBusca] = useState(''),
    [papel, setPapel] = useState(''),
    [edicao, setEdicao] = useState(null),
    [erro, setErro] = useState('')
  const filtrados = dados.usuarios.filter(
    (u) =>
      (!papel || u.papel === papel) &&
      `${u.nome} ${u.email}`.toLowerCase().includes(busca.trim().toLowerCase()),
  )
  function salvar(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    if (!f.nome.trim()) {
      setErro('Informe o nome da pessoa.')
      return
    }
    if (
      dados.usuarios.some(
        (u) =>
          u.id !== edicao.id &&
          u.email.toLowerCase() === f.email.trim().toLowerCase(),
      )
    ) {
      setErro('Já existe uma pessoa com este e-mail na amostra.')
      return
    }
    const usuario = {
      ...edicao,
      ...f,
      nome: f.nome.trim(),
      email: f.email.trim(),
    }
    atualizar(
      'usuarios',
      edicao.id
        ? dados.usuarios.map((u) => (u.id === edicao.id ? usuario : u))
        : [
            ...dados.usuarios,
            { ...usuario, id: Date.now(), status: 'Convite simulado' },
          ],
    )
    setEdicao(null)
    notificar(
      'Equipe atualizada na demonstração. Nenhum convite foi enviado ou acesso real alterado.',
    )
  }
  return (
    <>
      <div className="breadcrumb">
        Configurações <span>/</span> Usuários e permissões
      </div>
      <PageHeader
        titulo="Usuários e permissões da entidade"
        descricao="Confira a equipe e os papéis de acesso na demonstração."
      >
        <Botao
          onClick={() => {
            setEdicao({
              nome: '',
              email: '',
              papel: 'Consulta',
              status: 'Ativo',
            })
            setErro('')
          }}
        >
          <Icon nome="mais" />
          Convidar pessoa
        </Botao>
      </PageHeader>
      <div className="abas">
        <Link to="/configuracoes">Perfil da entidade</Link>
        <Link to="/configuracoes/usuarios" className="ativa">
          Usuários e permissões
        </Link>
      </div>
      <section className="kpis">
        <KpiCard
          rotulo="Acessos ativos"
          valor={`${dados.usuarios.filter((u) => u.status === 'Ativo').length} pessoas`}
        />
        <KpiCard
          rotulo="Convites na demonstração"
          valor={
            dados.usuarios.filter((u) => u.status === 'Convite simulado').length
          }
        />
        <KpiCard
          rotulo="Acessos inativos"
          valor={dados.usuarios.filter((u) => u.status === 'Inativo').length}
        />
      </section>
      <Secao titulo={`Equipe da ${dados.entidade.nome}`}>
        <Filtros
          busca={busca}
          onBusca={setBusca}
          placeholder="Buscar pessoa ou e-mail"
          selects={[
            {
              rotulo: 'Todos os papéis',
              valor: papel,
              onChange: setPapel,
              opcoes: papeis,
            },
          ]}
        />
        <DataTable
          linhas={filtrados}
          colunas={[
            {
              chave: 'nome',
              titulo: 'Pessoa',
              render: (u) => (
                <>
                  <strong>{u.nome}</strong>
                  <small>{u.email}</small>
                </>
              ),
            },
            { chave: 'papel', titulo: 'Papel' },
            {
              chave: 'status',
              titulo: 'Status',
              render: (u) => <StatusBadge valor={u.status} />,
            },
            {
              chave: 'acao',
              titulo: 'Ação',
              render: (u) => (
                <button
                  type="button"
                  className="link-botao"
                  onClick={() => {
                    setEdicao({ ...u })
                    setErro('')
                  }}
                  aria-label={`Editar acesso de ${u.nome}`}
                >
                  Editar acesso
                </button>
              ),
            },
          ]}
        />
      </Secao>
      <Aviso>
        Os papéis são uma apresentação local do fluxo. Autenticação, autorização
        e envio de convites dependem do backend. Editar esta amostra não concede
        permissões reais.
      </Aviso>
      {edicao && (
        <Modal
          titulo={
            edicao.id ? `Editar acesso · ${edicao.nome}` : 'Convidar pessoa'
          }
          fechar={() => setEdicao(null)}
        >
          <form className="pilha" onSubmit={salvar}>
            <Campo
              rotulo="Nome"
              name="nome"
              defaultValue={edicao.nome}
              required
            />
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              defaultValue={edicao.email}
              required
            />
            <Campo rotulo="Papel">
              <select name="papel" defaultValue={edicao.papel}>
                {papeis.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            {edicao.id && (
              <Campo rotulo="Status">
                <select name="status" defaultValue={edicao.status}>
                  <option>Ativo</option>
                  <option>Inativo</option>
                  {edicao.status === 'Convite simulado' && (
                    <option>Convite simulado</option>
                  )}
                </select>
              </Campo>
            )}
            {erro && <Aviso erro>{erro}</Aviso>}
            <Aviso>
              Alterações válidas apenas para os dados fictícios desta sessão.
            </Aviso>
            <Botao type="submit">
              {edicao.id
                ? 'Salvar na demonstração'
                : 'Adicionar convite de demonstração'}
            </Botao>
          </form>
        </Modal>
      )}
    </>
  )
}
