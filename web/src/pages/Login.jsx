import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Botao, Campo, Secao } from '../components/Ui'

export default function Login() {
  const [recuperar, setRecuperar] = useState(false),
    [aviso, setAviso] = useState('')
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
              : 'Acesse a área de gestão da sua entidade.'
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setAviso(
                recuperar
                  ? 'O serviço de recuperação ainda não está integrado. Nenhum e-mail foi enviado.'
                  : 'A autenticação ainda não está integrada. Use o acesso de demonstração abaixo.',
              )
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
            {!recuperar && (
              <Campo
                rotulo="Senha"
                type="password"
                name="senha"
                autoComplete="current-password"
                required
              />
            )}
            <Botao type="submit">
              {recuperar ? 'Solicitar recuperação' : 'Entrar'}
            </Botao>
            {aviso && <Aviso>{aviso}</Aviso>}
            <button
              className="link-botao"
              type="button"
              onClick={() => {
                setRecuperar(!recuperar)
                setAviso('')
              }}
            >
              {recuperar ? 'Voltar para o acesso' : 'Esqueci minha senha'}
            </button>
          </form>
          <hr />
          <Botao para="/dashboard" secundario>
            Acessar demonstração
          </Botao>
          <small>Dados fictícios · nenhum acesso autenticado.</small>
          <p>
            Ainda não tem uma conta?{' '}
            <Link to="/cadastro-entidade">Cadastrar entidade</Link>
          </p>
        </Secao>
      </div>
    </section>
  )
}
