import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Botao, Campo, Icon, Secao, Vazio } from '../components/Ui'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../services/entidadesService'
import { formatarCpf } from '../utils/cadastroDoador'
import { AREAS_ATUACAO, corpoEndereco, validarResponsavelEEndereco } from '../utils/cadastroEntidade'

// Perfil da entidade (/configuracoes): GET e PATCH /entidades/{id}, com id da sessão.
// Sem endpoint na API: documentos, preferências de notificação e equipe da entidade.
export default function PerfilEntidade() {
  const { usuario } = useAuth()
  if (!usuario?.entidadeId)
    return (
      <Vazio principal titulo="Perfil disponível só para entidades">
        A conta de administrador não tem perfil de entidade. <Link to="/dashboard">Voltar ao painel</Link>
      </Vazio>
    )
  return <Perfil id={usuario.entidadeId} email={usuario.email} />
}

function Perfil({ id, email }) {
  const request = useRequest((config) => entidadesService.buscar(id, config), [id])
  return (
    <>
      <div className="breadcrumb">
        <Link to="/dashboard">Área da entidade</Link>
        <span>/</span>
        Perfil da entidade
      </div>
      <PageHeader titulo="Perfil da entidade" descricao="Mantenha os dados públicos e de contato da sua entidade atualizados." />
      <RequestState {...request}>
        {(entidade) => <Formulario key={entidade.id} entidade={entidade} email={email} onSalvo={request.reload} />}
      </RequestState>
    </>
  )
}

const deEntidade = (e) => ({
  nomeFantasia: e.nomeFantasia,
  descricao: e.descricao,
  areaAtuacao: e.areaAtuacao,
  site: e.site,
  emailContato: e.emailContato,
  telefoneContato: e.telefoneContato,
  whatsapp: e.whatsapp,
  responsavelNome: '',
  responsavelCpf: '',
  ...(e.endereco ?? { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }),
})

function validar(f) {
  const erros = validarResponsavelEEndereco(f)
  if (!f.descricao.trim()) erros.descricao = 'Descrição é obrigatória.'
  // telefone_contato e whatsapp são VARCHAR(20) no banco: acima disso o backend responde 500.
  for (const c of ['telefoneContato', 'whatsapp']) if (f[c].trim().length > 20) erros[c] = 'Use até 20 caracteres.'
  if (f.emailContato.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.emailContato.trim())) erros.emailContato = 'E-mail inválido.'
  return erros
}

function corpo(f) {
  const c = {
    nomeFantasia: f.nomeFantasia.trim(),
    descricao: f.descricao.trim(),
    areaAtuacao: f.areaAtuacao,
    site: f.site.trim(),
    emailContato: f.emailContato.trim(),
    telefoneContato: f.telefoneContato.trim(),
    whatsapp: f.whatsapp.trim(),
  }
  // Responsável só vai quando preenchido (a API não devolve o atual; null = manter).
  if (f.responsavelNome.trim()) {
    c.responsavelNome = f.responsavelNome.trim()
    c.responsavelCpf = formatarCpf(f.responsavelCpf)
  }
  const endereco = corpoEndereco(f)
  if (endereco) c.endereco = endereco
  return c
}

function Formulario({ entidade, email, onSalvo }) {
  const [f, setF] = useState(() => deEntidade(entidade)),
    [erros, setErros] = useState({}),
    [erro, setErro] = useState(''),
    [sucesso, setSucesso] = useState(false),
    [salvando, setSalvando] = useState(false)
  const areas = AREAS_ATUACAO.includes(f.areaAtuacao) || !f.areaAtuacao ? AREAS_ATUACAO : [f.areaAtuacao, ...AREAS_ATUACAO]

  const campo = (nome, ajuda) => ({
    name: nome,
    value: f[nome],
    onChange: (e) => setF((atual) => ({ ...atual, [nome]: e.target.value })),
    ajuda: erros[nome] ?? ajuda,
    'aria-invalid': erros[nome] ? true : undefined,
  })

  async function salvar(e) {
    e.preventDefault()
    setSucesso(false)
    setErro('')
    const encontrados = validar(f)
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      setErro('Revise os campos destacados.')
      return
    }
    setSalvando(true)
    try {
      await entidadesService.atualizar(entidade.id, corpo(f))
      setSucesso(true)
      onSalvo()
    } catch (falha) {
      if (falha?.campos) {
        const { responsavel, ...demais } = falha.campos
        setErros(responsavel ? { ...demais, responsavelNome: responsavel, responsavelCpf: responsavel } : demais)
      }
      setErro(falha?.campos ? 'Revise os campos destacados.' : (falha?.message ?? 'Não foi possível salvar.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} className="pilha" noValidate>
      <div className="dashboard-grid">
        <div className="pilha">
          <Secao titulo="Dados públicos" descricao="Aparecem para os doadores na vitrine e nas campanhas.">
            <div className="form-grid">
              <Campo rotulo="Nome da entidade" maxLength={200} {...campo('nomeFantasia')} />
              <Campo rotulo="Área de atuação">
                <select name="areaAtuacao" value={f.areaAtuacao} onChange={(e) => setF({ ...f, areaAtuacao: e.target.value })}>
                  {areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Sobre a entidade" required className="campo--inteiro" ajuda={erros.descricao}>
                <textarea
                  name="descricao"
                  rows={4}
                  maxLength={5000}
                  value={f.descricao}
                  aria-invalid={erros.descricao ? true : undefined}
                  onChange={(e) => setF({ ...f, descricao: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Site" type="url" placeholder="https://" className="campo--inteiro" {...campo('site')} />
            </div>
          </Secao>
          <Secao titulo="Contato">
            <div className="form-grid">
              <Campo rotulo="E-mail de contato" type="email" {...campo('emailContato')} />
              <Campo rotulo="Telefone de contato" type="tel" maxLength={20} {...campo('telefoneContato')} />
              <Campo rotulo="WhatsApp" type="tel" maxLength={20} {...campo('whatsapp')} />
            </div>
          </Secao>
          <Secao titulo="Responsável legal" descricao="Por privacidade, a API não mostra o responsável atual. Preencha nome e CPF só para alterá-lo.">
            <div className="form-grid">
              <Campo rotulo="Nome do responsável" maxLength={200} {...campo('responsavelNome')} />
              <Campo rotulo="CPF do responsável" inputMode="numeric" placeholder="000.000.000-00" {...campo('responsavelCpf')} />
            </div>
          </Secao>
          <Secao titulo="Endereço" descricao="Se informar, preencha todos os campos (o complemento é opcional).">
            <div className="form-grid">
              <Campo rotulo="CEP" inputMode="numeric" placeholder="00000-000" {...campo('cep')} />
              <Campo rotulo="Logradouro" maxLength={200} {...campo('logradouro')} />
              <Campo rotulo="Número" maxLength={20} {...campo('numero')} />
              <Campo rotulo="Complemento" maxLength={100} {...campo('complemento')} />
              <Campo rotulo="Bairro" maxLength={100} {...campo('bairro')} />
              <Campo rotulo="Cidade" maxLength={100} {...campo('cidade')} />
              <Campo rotulo="UF" maxLength={2} placeholder="SC" {...campo('uf')} />
            </div>
          </Secao>
        </div>
        <Secao titulo="Situação da entidade">
          <StatusBadge valor={entidade.status} />
          <h3>{entidade.nome}</h3>
          <dl className="linhas-resumo">
            <div><dt>Razão social</dt><dd>{entidade.razaoSocial}</dd></div>
            <div><dt>CNPJ</dt><dd>{entidade.cnpj}</dd></div>
            <div><dt>E-mail de acesso</dt><dd>{email}</dd></div>
          </dl>
          {entidade.status === 'Pendente' && (
            <Aviso>Cadastro em análise. Depois da aprovação, a entidade aparece na vitrine e pode criar campanhas.</Aviso>
          )}
          {entidade.status === 'Reprovada' && (
            <Aviso erro>Cadastro reprovado{entidade.motivoReprovacao ? `: ${entidade.motivoReprovacao}` : '.'}</Aviso>
          )}
          {entidade.status === 'Inativa' && <Aviso erro>Entidade desativada pela administração do DoaSync.</Aviso>}
          <small>Razão social e CNPJ não podem ser alterados por aqui.</small>
        </Secao>
      </div>
      {erro && <Aviso erro>{erro}</Aviso>}
      {sucesso && <Aviso>Perfil atualizado.</Aviso>}
      <div className="acoes acoes--fim">
        <Botao
          secundario
          onClick={() => {
            setF(deEntidade(entidade))
            setErros({})
            setErro('')
            setSucesso(false)
          }}
        >
          Descartar alterações
        </Botao>
        <Botao type="submit" disabled={salvando} aria-busy={salvando}>
          <Icon nome="check" />
          {salvando ? 'Salvando…' : 'Salvar perfil'}
        </Botao>
      </div>
    </form>
  )
}
