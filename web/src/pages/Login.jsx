import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Aviso, Botao, Campo, Secao } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { destinoPorTipo } from '../utils/auth'

export default function Login() {
  const { entrar } = useAuth(),
    navigate = useNavigate(),
    location = useLocation()
  const [recuperar, setRecuperar] = useState(false),
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
              ? 'A recuperação de senha por e-mail está indisponível.'
              : 'Acesse com a conta da sua entidade, de doador ou de administrador.'
          }
        >
          {!recuperar && <form
            onSubmit={(e) => {
              e.preventDefault()
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
            />
            <Campo
                rotulo="Senha"
                type="password"
                name="senha"
                autoComplete="current-password"
                required
              />
            <Botao type="submit" disabled={enviando} aria-busy={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Botao>
            {erro && <Aviso erro>{erro}</Aviso>}
          </form>}
            <button
              className="link-botao"
              type="button"
              onClick={() => {
                setRecuperar(!recuperar)
                setErro('')
              }}
            >
              {recuperar ? 'Voltar para o acesso' : 'Esqueci minha senha'}
            </button>
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
