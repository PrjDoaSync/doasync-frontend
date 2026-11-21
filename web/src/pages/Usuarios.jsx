import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Aviso, Botao, Campo, Icon, Modal } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { VOCE, equipeDemo } from '../mocks/equipe'
import { ACESSOS, PAPEIS, PERMISSOES, acaoDaLinha, aplicarAcesso, filtrarEquipe, resumoEquipe, validarAcesso, validarConvite } from '../utils/equipe'
import '../styles/usuarios.css'

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`
const Ico = ({ d }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)
const ICONES = {
  pessoas: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 20v-2a4 4 0 0 0-3-3.9 M16 2.1a4 4 0 0 1 0 7.8',
  email: 'M3 5h18v14H3z M3 7l9 6 9-6',
  bloqueio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M5.6 5.6l12.8 12.8',
}
const classeAcesso = (u) => (u.acesso === 'Ativo' ? 'usr-ok' : u.acesso === 'Suspenso' ? 'usr-susp' : 'usr-pend')

// [DEV-GES-09] Usuários e permissões (#113). Persiste só na sessão de demonstração.
// SEM CONTRATO na API: papéis da entidade, convites, 2FA, último acesso e escopo.
export default function Usuarios() {
  const { dados, atualizar, notificar } = useDemo()
  const equipe = dados.equipe ?? equipeDemo
  const [filtro, setFiltro] = useState({ busca: '', papel: '', acesso: '' })
  const [selId, setSelId] = useState(2)
  const sel = equipe.find((u) => u.id === selId) ?? equipe[0]
  const [form, setForm] = useState({ papel: sel.papel, acesso: sel.acesso })
  const [erro, setErro] = useState('')
  const [feedback, setFeedback] = useState('')
  const [convite, setConvite] = useState(null)
  const [erroConvite, setErroConvite] = useState('')
  const resumo = resumoEquipe(equipe)
  const lista = filtrarEquipe(equipe, filtro)
  const mudar = (campo) => (e) => setFiltro({ ...filtro, [campo]: e.target.value })
  const somenteLeitura = sel.id === VOCE || sel.acesso === 'Convite pendente'
  const MSG = 'Equipe atualizada na demonstração. Nenhum convite foi enviado ou acesso real alterado.'

  function selecionar(u) {
    setSelId(u.id)
    setForm({ papel: u.papel, acesso: u.acesso })
    setErro('')
    setFeedback('')
  }
  function salvar(novo = form) {
    const msg = validarAcesso(novo, sel, equipe)
    if (msg) return setErro(msg)
    atualizar('equipe', aplicarAcesso(equipe, sel.id, novo))
    setForm(novo)
    setErro('')
    setFeedback(`Permissões de ${sel.nome} salvas.`)
    notificar(MSG)
  }
  function acao(u) {
    if (u.acesso === 'Convite pendente') return notificar('Convite reenviado na demonstração. Nenhum e-mail foi enviado.')
    if (u.acesso === 'Suspenso') {
      atualizar('equipe', aplicarAcesso(equipe, u.id, { acesso: 'Ativo' }))
      if (u.id === selId) setForm({ ...form, acesso: 'Ativo' })
      return notificar(MSG)
    }
    selecionar(u)
  }
  function convidar(e) {
    e.preventDefault()
    const msg = validarConvite(convite, equipe)
    if (msg) return setErroConvite(msg)
    atualizar('equipe', [...equipe, { id: `convite-${equipe.length + 1}`, nome: convite.nome.trim(), email: convite.email.trim(), papel: convite.papel, acesso: 'Convite pendente', doisFatores: false, ultimoAcesso: 'Ainda não acessou', conviteExpira: '09/10/2026' }])
    setConvite(null)
    notificar('Convite registrado na demonstração. Nenhum convite foi enviado ou acesso real alterado.')
  }

  return (
    <div className="usr">
      <div>
        <nav className="breadcrumb" aria-label="Você está em"><Link to="/configuracoes">Configurações</Link> <span>/</span> Usuários e permissões</nav>
        <PageHeader titulo="Usuários e permissões da entidade" descricao={`Defina quem pode acessar, operar e administrar a ${dados.entidade.nome}.`}>
          <Botao onClick={() => { setConvite({ nome: '', email: '', papel: 'Leitura' }); setErroConvite('') }}><Icon nome="mais" size={16} /> Convidar pessoa</Botao>
        </PageHeader>
      </div>

      <section className="usr-kpis">
        {[
          ['Acessos ativos', plural(resumo.ativos, 'pessoa', 'pessoas'), `${plural(resumo.admins, 'administradora', 'administradoras')} · ${plural(resumo.naEquipe, 'pessoa', 'pessoas')} na equipe`, ICONES.pessoas],
          ['Convites pendentes', plural(resumo.convites, 'convite', 'convites'), resumo.expira ? `Expira em ${resumo.expira}` : 'Nenhum convite aguardando', ICONES.email],
          ['Acesso suspenso', plural(resumo.suspensos, 'pessoa', 'pessoas'), 'Sem acesso até a reativação', ICONES.bloqueio],
        ].map(([rotulo, valor, detalhe, icone]) => (
          <div className="kpi usr-kpi" key={rotulo}>
            <span className="kpi__rotulo usr-kpi__topo"><span>{rotulo}</span><Ico d={icone} /></span>
            <strong className="kpi__valor">{valor}</strong>
            <small className="kpi__detalhe">{detalhe}</small>
          </div>
        ))}
      </section>

      <section className="usr-card" aria-labelledby="usr-equipe">
        <h2 id="usr-equipe">Equipe da {dados.entidade.nome}</h2>
        <div className="usr-filtros">
          <Campo rotulo="Buscar pessoa"><input placeholder="Nome ou e-mail" value={filtro.busca} onChange={mudar('busca')} /></Campo>
          <Campo rotulo="Papel"><select value={filtro.papel} onChange={mudar('papel')}><option value="">Todos os papéis</option>{PAPEIS.map((p) => <option key={p}>{p}</option>)}</select></Campo>
          <Campo rotulo="Estado de acesso"><select value={filtro.acesso} onChange={mudar('acesso')}><option value="">Todos os estados</option>{ACESSOS.map((a) => <option key={a}>{a}</option>)}</select></Campo>
        </div>
        <div className="tabela-wrapper">
          <table className="tabela">
            <thead><tr>{['Pessoa', 'Papel', 'Acesso', 'Último acesso', 'Ação'].map((t) => <th key={t} scope="col">{t}</th>)}</tr></thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id} className={u.id === selId ? 'usr-sel' : ''}>
                  <td><strong>{u.nome}{u.id === VOCE ? ' · você' : ''}</strong><small>{u.email}</small></td>
                  <td>{u.papel}</td>
                  <td className={classeAcesso(u)}>{u.acesso}{u.acesso === 'Ativo' && u.doisFatores ? ' · 2FA' : ''}</td>
                  <td>{u.ultimoAcesso}</td>
                  <td><button type="button" className="usr-acao" aria-label={`${acaoDaLinha(u)} de ${u.nome}`} onClick={() => acao(u)}>{acaoDaLinha(u)}</button></td>
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={5}>Nenhuma pessoa encontrada com esses filtros.</td></tr>}
            </tbody>
          </table>
        </div>
        <small className="usr-sub">{plural(equipe.length, 'pessoa cadastrada', 'pessoas cadastradas')} · Convites não liberam acesso antes da aceitação. 2FA = autenticação em duas etapas.</small>
      </section>

      <section className="usr-card" aria-labelledby="usr-permissoes">
        <div><h2 id="usr-permissoes">Permissões por papel</h2><p className="usr-sub">✓ Permitido · — Não permitido · Aplicadas apenas à {dados.entidade.nome}.</p></div>
        <div className="tabela-wrapper">
          <table className="tabela usr-matriz">
            <thead><tr><th scope="col">Permissão</th>{PAPEIS.map((p) => <th key={p} scope="col">{p}</th>)}</tr></thead>
            <tbody>
              {PERMISSOES.map((p) => (
                <tr key={p.chave}>
                  <td><strong>{p.texto}</strong></td>
                  {PAPEIS.map((papel) => p.papeis.includes(papel)
                    ? <td key={papel} className="usr-sim"><span aria-label="Permitido">✓</span></td>
                    : <td key={papel} className="usr-nao"><span aria-label="Não permitido">—</span></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="usr-sub">Pagamentos financeiros são confirmados pelo provedor, não pela equipe. Contatos pessoais permanecem mascarados para o papel Leitura.</small>
      </section>

      <section className="usr-card" aria-labelledby="usr-edicao">
        <div><h2 id="usr-edicao">Editar acesso · {sel.nome}</h2><p className="usr-sub">Pessoa selecionada · Acesso a todas as campanhas da entidade.</p></div>
        <div className="usr-edicao">
          <Campo rotulo="Papel"><select value={form.papel} disabled={somenteLeitura} onChange={(e) => setForm({ ...form, papel: e.target.value })}>{PAPEIS.map((p) => <option key={p}>{p}</option>)}</select></Campo>
          <Campo rotulo="Estado de acesso">
            <select value={form.acesso} disabled={somenteLeitura} onChange={(e) => setForm({ ...form, acesso: e.target.value })}>
              {(sel.acesso === 'Convite pendente' ? ACESSOS : ['Ativo', 'Suspenso']).map((a) => <option key={a}>{a}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Escopo"><select disabled><option>{dados.entidade.nome} · todas as campanhas</option></select></Campo>
          <Botao disabled={somenteLeitura} onClick={() => salvar()}><Icon nome="check" size={16} /> Salvar permissões</Botao>
        </div>
        <div className="usr-edicao__rodape">
          {sel.doisFatores ? <span className="usr-selo2fa">2FA habilitada</span> : <span className="usr-sub">2FA não habilitada</span>}
          <span className="usr-sub">Suspender acesso revoga as sessões imediatamente.</span>
          <Botao secundario disabled={somenteLeitura} onClick={() => salvar({ ...form, acesso: 'Suspenso' })}>Suspender acesso</Botao>
        </div>
        {sel.id === VOCE && <p className="usr-sub">Você está vendo as suas permissões. O seu acesso de administradora não pode ser alterado por aqui.</p>}
        {erro && <Aviso erro>{erro}</Aviso>}
        {feedback && <Aviso>{feedback}</Aviso>}
      </section>

      <Aviso>Dados demonstrativos. Somente administradoras podem alterar papéis e convites. Mudanças ficam registradas na auditoria; a última administradora não pode ter seu próprio acesso removido. <Link to="/configuracoes">Ver perfil da entidade</Link></Aviso>

      {convite && (
        <Modal titulo="Convidar pessoa" fechar={() => setConvite(null)}>
          <form className="pilha" onSubmit={convidar}>
            <Campo rotulo="Nome" required><input value={convite.nome} onChange={(e) => setConvite({ ...convite, nome: e.target.value })} /></Campo>
            <Campo rotulo="E-mail" required><input type="email" value={convite.email} onChange={(e) => setConvite({ ...convite, email: e.target.value })} /></Campo>
            <Campo rotulo="Papel"><select value={convite.papel} onChange={(e) => setConvite({ ...convite, papel: e.target.value })}>{PAPEIS.map((p) => <option key={p}>{p}</option>)}</select></Campo>
            {erroConvite && <Aviso erro>{erroConvite}</Aviso>}
            <Botao type="submit">Adicionar convite de demonstração</Botao>
          </form>
        </Modal>
      )}
    </div>
  )
}
