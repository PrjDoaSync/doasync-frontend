import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Ui'
import {
  mockSolicitarRecuperacaoSenha,
  mockTentativaLogin,
} from '../mocks/autenticacao'

function validarFormatoEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function Login() {
  // Estados do formulário de Login
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [manterConectado, setManterConectado] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loginCarregando, setLoginCarregando] = useState(false)
  const [loginErro, setLoginErro] = useState('')
  const [loginAviso, setLoginAviso] = useState('')

  // Estados do formulário de Recuperação de Senha
  const [recuperacaoEmail, setRecuperacaoEmail] = useState('')
  const [recuperacaoCarregando, setRecuperacaoCarregando] = useState(false)
  const [recuperacaoErro, setRecuperacaoErro] = useState('')
  const [recuperacaoSucesso, setRecuperacaoSucesso] = useState(false)
  const [recuperacaoAviso, setRecuperacaoAviso] = useState('')

  // Submissão do login
  const aoSubmeterLogin = async (e) => {
    e.preventDefault()
    setLoginErro('')
    setLoginAviso('')

    const emailLimpo = email.trim()
    const senhaLimpa = senha.trim()

    if (!emailLimpo) {
      setLoginErro('Informe o seu e-mail de acesso.')
      document.getElementById('login-email')?.focus()
      return
    }

    if (!validarFormatoEmail(emailLimpo)) {
      setLoginErro('Informe um formato de e-mail válido (ex.: nome@entidade.org.br).')
      document.getElementById('login-email')?.focus()
      return
    }

    if (!senhaLimpa) {
      setLoginErro('Informe a sua senha.')
      document.getElementById('login-senha')?.focus()
      return
    }

    try {
      setLoginCarregando(true)
      const resposta = await mockTentativaLogin({
        email: emailLimpo,
        senha: senhaLimpa,
        manterConectado,
      })
      setLoginAviso(resposta.mensagem)
    } catch {
      setLoginErro('Erro ao processar a autenticação. Tente novamente mais tarde.')
    } finally {
      setLoginCarregando(false)
    }
  }

  // Submissão da recuperação de senha
  const aoSubmeterRecuperacao = async (e) => {
    e.preventDefault()
    setRecuperacaoErro('')
    setRecuperacaoSucesso(false)
    setRecuperacaoAviso('')

    const emailLimpo = recuperacaoEmail.trim()

    if (!emailLimpo) {
      setRecuperacaoErro('Informe o e-mail cadastrado para recuperação.')
      document.getElementById('recuperacao-email')?.focus()
      return
    }

    if (!validarFormatoEmail(emailLimpo)) {
      setRecuperacaoErro('Informe um formato de e-mail válido.')
      document.getElementById('recuperacao-email')?.focus()
      return
    }

    try {
      setRecuperacaoCarregando(true)
      const resposta = await mockSolicitarRecuperacaoSenha({ email: emailLimpo })
      setRecuperacaoSucesso(true)
      setRecuperacaoAviso(resposta.mensagem)
    } catch {
      setRecuperacaoErro('Erro ao solicitar recuperação. Tente novamente.')
    } finally {
      setRecuperacaoCarregando(false)
    }
  }

  const irParaRecuperacao = () => {
    const el = document.getElementById('recuperacao-email')
    if (el) {
      el.focus()
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
  }

  const irParaLogin = () => {
    const el = document.getElementById('login-email')
    if (el) {
      el.focus()
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="acesso-pagina">
      <div className="acesso-container">
        {/* Identificador de seção e Títulos principais */}
        <div className="acesso-topo">
          <span className="acesso-categoria">GESTÃO · ACESSO DA ENTIDADE</span>
          <h1 className="acesso-titulo-principal">Bem-vinda ao DoaSync</h1>
          <p className="acesso-descricao-principal">
            Acesse sua entidade para acompanhar campanhas, doações e o impacto da sua rede.
          </p>
        </div>

        {/* Três colunas: Institucional, Login e Recuperação */}
        <div className="acesso-grid-tres-colunas">
          {/* Coluna 1 — Institucional */}
          <section className="acesso-col-institucional" aria-label="Painel institucional">
            <div className="acesso-foto-wrapper">
              <img
                src="/images/alimentos.jpg"
                alt="Pessoas voluntárias organizando alimentos doados em caixas"
                className="acesso-foto"
              />
            </div>
            <h2 className="acesso-institucional-titulo">Mais organização. Mais impacto.</h2>
            <p className="acesso-institucional-desc">
              Reúna sua arrecadação financeira e seus recebimentos de itens em um único lugar.
            </p>
            <ul className="acesso-beneficios" aria-label="Benefícios da plataforma">
              <li>
                <span className="acesso-check-icone" aria-hidden="true">
                  <Icon nome="check" size={15} />
                </span>
                <span>Acompanhe metas e evolução das campanhas</span>
              </li>
              <li>
                <span className="acesso-check-icone" aria-hidden="true">
                  <Icon nome="check" size={15} />
                </span>
                <span>Confirme entregas com segurança</span>
              </li>
              <li>
                <span className="acesso-check-icone" aria-hidden="true">
                  <Icon nome="check" size={15} />
                </span>
                <span>Mantenha a transparência com sua comunidade</span>
              </li>
            </ul>
          </section>

          {/* Coluna 2 — Entrar na sua conta */}
          <section
            className="acesso-card"
            id="card-login"
            aria-labelledby="titulo-entrar"
          >
            <span className="acesso-badge">Área da entidade</span>
            <h2 id="titulo-entrar" className="acesso-card-titulo">
              Entre na sua conta
            </h2>
            <p className="acesso-card-subtitulo">
              Use o e-mail cadastrado como responsável pela entidade.
            </p>

            <form onSubmit={aoSubmeterLogin} className="acesso-form" noValidate>
              <div className="acesso-campo">
                <label htmlFor="login-email" className="acesso-campo__label">
                  E-mail
                </label>
                <div className="acesso-input-wrapper">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (loginErro) setLoginErro('')
                    }}
                    placeholder="ana@redeesperanca.org.br"
                    autoComplete="username"
                    className="acesso-input"
                    required
                    aria-invalid={!!loginErro}
                  />
                  <span className="acesso-input-icone" aria-hidden="true">
                    <Icon nome="mail" size={18} />
                  </span>
                </div>
              </div>

              <div className="acesso-campo">
                <label htmlFor="login-senha" className="acesso-campo__label">
                  Senha
                </label>
                <div className="acesso-input-wrapper">
                  <input
                    id="login-senha"
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value)
                      if (loginErro) setLoginErro('')
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="acesso-input"
                    required
                    aria-invalid={!!loginErro}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="acesso-input-toggle-senha"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    <Icon
                      nome={mostrarSenha ? 'olho-fechado' : 'olho'}
                      size={18}
                    />
                  </button>
                </div>
              </div>

              <div className="acesso-opcoes-linha">
                <label className="acesso-checkbox">
                  <input
                    id="manter-conectado"
                    name="manterConectado"
                    type="checkbox"
                    checked={manterConectado}
                    onChange={(e) => setManterConectado(e.target.checked)}
                  />
                  <span>Manter conectado neste dispositivo</span>
                </label>
              </div>

              <div className="acesso-link-recuperar-wrapper">
                <button
                  type="button"
                  onClick={irParaRecuperacao}
                  className="acesso-link-acao"
                >
                  Esqueci minha senha →
                </button>
              </div>

              <button
                type="submit"
                disabled={loginCarregando}
                className="acesso-btn-primario"
              >
                {loginCarregando ? (
                  'Entrando...'
                ) : (
                  <>
                    <Icon nome="seta" size={16} />
                    <span>Entrar</span>
                  </>
                )}
              </button>

              {loginErro && (
                <div className="aviso aviso--erro" role="alert">
                  <span aria-hidden="true">!</span>
                  <div>{loginErro}</div>
                </div>
              )}

              {loginAviso && (
                <div className="aviso" role="status">
                  <span aria-hidden="true">ⓘ</span>
                  <div>{loginAviso}</div>
                </div>
              )}

              <p className="acesso-separador">
                Sua entidade ainda não tem uma conta?
              </p>

              <Link
                to="/cadastro-entidade"
                className="acesso-btn-secundario"
              >
                Cadastrar entidade
              </Link>
            </form>
          </section>

          {/* Coluna 3 — Recuperação de senha */}
          <section
            className="acesso-card acesso-card--destaque"
            id="card-recuperacao"
            aria-labelledby="titulo-recuperacao"
          >
            <span className="acesso-badge">Recuperação de senha</span>
            <h2 id="titulo-recuperacao" className="acesso-card-titulo">
              Esqueceu sua senha?
            </h2>
            <p className="acesso-card-subtitulo">
              Informe seu e-mail. Enviaremos um link seguro para definir uma nova senha.
            </p>

            <form
              onSubmit={aoSubmeterRecuperacao}
              className="acesso-form"
              noValidate
            >
              <div className="acesso-campo">
                <label
                  htmlFor="recuperacao-email"
                  className="acesso-campo__label"
                >
                  E-mail de recuperação
                </label>
                <div className="acesso-input-wrapper">
                  <input
                    id="recuperacao-email"
                    name="emailRecuperacao"
                    type="email"
                    value={recuperacaoEmail}
                    onChange={(e) => {
                      setRecuperacaoEmail(e.target.value)
                      if (recuperacaoErro) setRecuperacaoErro('')
                    }}
                    placeholder="ana@redeesperanca.org.br"
                    autoComplete="email"
                    className="acesso-input"
                    required
                    aria-invalid={!!recuperacaoErro}
                  />
                  <span className="acesso-input-icone" aria-hidden="true">
                    <Icon nome="mail" size={18} />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={recuperacaoCarregando}
                className="acesso-btn-primario"
              >
                {recuperacaoCarregando
                  ? 'Enviando...'
                  : 'Enviar link de recuperação'}
              </button>

              {recuperacaoErro && (
                <div className="aviso aviso--erro" role="alert">
                  <span aria-hidden="true">!</span>
                  <div>{recuperacaoErro}</div>
                </div>
              )}

              {recuperacaoSucesso && (
                <div className="acesso-sucesso-container">
                  <div className="acesso-sucesso" role="status">
                    <span
                      className="acesso-sucesso__icone"
                      aria-hidden="true"
                    >
                      <Icon nome="check-circle" size={18} />
                    </span>
                    <span className="acesso-sucesso__texto">
                      {recuperacaoAviso}
                    </span>
                  </div>
                  <p className="acesso-sucesso__nota">
                    Confira também a caixa de spam. Você poderá solicitar outro link em 60 segundos.
                  </p>
                  <small className="acesso-sucesso__mock-info">
                    Ambiente de demonstração: nenhum e-mail real foi enviado (integração pendente).
                  </small>
                </div>
              )}

              <div className="acesso-voltar-wrapper">
                <button
                  type="button"
                  onClick={irParaLogin}
                  className="acesso-link-acao"
                >
                  ← Voltar para o acesso
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Faixa informativa inferior */}
        <aside className="acesso-faixa-protegida" role="note">
          <span className="acesso-faixa-protegida__icone" aria-hidden="true">
            <Icon nome="info" size={18} />
          </span>
          <span className="acesso-faixa-protegida__texto">
            Seu acesso é protegido. Nunca compartilhe sua senha ou o link de recuperação com outras pessoas.
          </span>
        </aside>
      </div>
    </div>
  )
}
