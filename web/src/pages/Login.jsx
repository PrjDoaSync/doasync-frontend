import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AvisoIndisponivel from '../components/AvisoIndisponivel'
import { Aviso, Botao, Campo, Secao } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { destinoPorTipo } from '../utils/auth'

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { entrar } = useAuth(),
    navigate = useNavigate(),
    location = useLocation()
  const [recuperar, setRecuperar] = useState(false),
    [pendencia, setPendencia] = useState(null),
    [erroEmail, setErroEmail] = useState(''),
    [erro, setErro] = useState(''),
    [enviando, setEnviando] = useState(false)

  async function acessar(form) {
    const dados = new FormData(form)
    setErro('')
    setEnviando(true)
    try {
      const usuario = await entrar(String(dados.get('email')), String(dados.get('senha')))
      navigate(location.state?.de ?? destinoPorTipo(usuario.tipo), { replace: true })
    } catch (e) {
      setErro(e?.message ?? 'Não foi possível entrar. Tente novamente.')
      setEnviando(false)
    }
  }
  async function solicitarRecuperacao(form) {
    const email = String(new FormData(form).get('email')).trim()
    setPendencia(null)
    if (!email) return setErroEmail('Informe o e-mail da sua conta.')
    if (!FORMATO_EMAIL.test(email)) return setErroEmail('Informe um e-mail válido, como nome@exemplo.com.')
    setErroEmail('')
    setEnviando(true)
    try {
      await authService.solicitarRecuperacaoSenha(email)
    } catch (e) {
      setPendencia(e)
    }
    setEnviando(false)
  }
  return (
    <section className="public-section acesso">
      <div className="public-page-title">
        <span className="sobretitulo">ÁREA DA ENTIDADE</span>
        <h1>Bem-vindo ao DoaSync</h1>
        <p>Sua próxima transformação começa aqui.</p>
      </div>
      <div className="acesso-grid">
        <div className="acesso-ilustracao">
          <img
            src="/images/alimentos.jpg"
            alt="Alimentos que conectam solidariedade e transformação"
          />
          <h2>
            Um espaço para cuidar
            <br />
            de quem mais precisa.
          </h2>
          <p>
            Gerencie suas campanhas, acompanhe doações e transforme
            solidariedade em impacto.
          </p>
        </div>
        <Secao
          titulo={recuperar ? 'Esqueceu sua senha?' : 'Entre na sua conta'}
          descricao={
            recuperar
              ? 'Informe seu e-mail para solicitar a recuperação do acesso.'
              : 'Acesse com a conta da sua entidade, de doador ou de administrador.'
          }
        >
          <form
            noValidate={recuperar}
            onSubmit={(e) => {
              e.preventDefault()
              if (recuperar) return solicitarRecuperacao(e.currentTarget)
              acessar(e.currentTarget)
            }}
            className="pilha"
          >
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              required
              aria-invalid={recuperar && erroEmail ? 'true' : undefined}
              ajuda={recuperar ? erroEmail || undefined : undefined}
            />
            {!recuperar && (
              <Campo
                rotulo="Senha"
                type="password"
                name="senha"
                autoComplete="current-password"
                required
              />
            )}
            <Botao type="submit" disabled={enviando} aria-busy={enviando}>
              {recuperar ? 'Solicitar recuperação' : enviando ? 'Entrando…' : 'Entrar'}
            </Botao>
            {erro && !recuperar && <Aviso erro>{erro}</Aviso>}
            {recuperar && pendencia &&
              (pendencia.indisponivel ? (
                <AvisoIndisponivel recurso="recuperacaoSenha">Nenhum e-mail foi enviado.</AvisoIndisponivel>
              ) : (
                <Aviso erro>{pendencia.message}</Aviso>
              ))}
            <button
              className="link-botao"
              type="button"
              onClick={() => {
                setRecuperar(!recuperar)
                setPendencia(null)
                setErroEmail('')
                setErro('')
              }}
            >
              {recuperar ? 'Voltar para o acesso' : 'Esqueci minha senha'}
            </button>
          </form>
          <hr />
          <p>
            Ainda não tem uma conta?{' '}
            <Link to="/cadastro-doador" state={location.state}>Criar conta de doador</Link>
            {' · '}
            <Link to="/cadastro-entidade">Cadastrar entidade</Link>
          </p>
        </Secao>
      </div>
    </section>
  )
}
