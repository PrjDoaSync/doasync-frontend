import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Aviso, Botao, Campo, Secao } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { corpoCadastroDoador, validarCadastroDoador } from '../utils/cadastroDoador'

const VAZIO = {
  tipo: 'PESSOA_FISICA', nome: '', email: '', senha: '', confirmacao: '', telefone: '',
  cpf: '', dataNascimento: '', cnpj: '', razaoSocial: '',
}

// Cadastro público de doador (POST /doadores). Depois de criar a conta, entra e volta para onde estava.
export default function CadastroDoador() {
  const { entrar } = useAuth(),
    navigate = useNavigate(),
    location = useLocation()
  const destino = location.state?.de ?? '/'
  const [f, setF] = useState(VAZIO),
    [erros, setErros] = useState({}),
    [erro, setErro] = useState(''),
    [enviando, setEnviando] = useState(false)
  const pf = f.tipo === 'PESSOA_FISICA'

  const campo = (nome, props = {}) => ({
    name: nome,
    value: f[nome],
    onChange: (e) => setF((atual) => ({ ...atual, [nome]: e.target.value })),
    ajuda: erros[nome],
    'aria-invalid': erros[nome] ? true : undefined,
    ...props,
  })

  async function cadastrar(e) {
    e.preventDefault()
    setErro('')
    const encontrados = validarCadastroDoador(f, new Date().toISOString().slice(0, 10))
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      setErro('Revise os campos destacados.')
      return
    }
    setEnviando(true)
    try {
      await authService.cadastrarDoador(corpoCadastroDoador(f))
      await entrar(f.email, f.senha)
      navigate(destino, { replace: true })
    } catch (falha) {
      // 422/409 por campo ({ erros: { campo: mensagem } }) aparecem no próprio campo.
      if (falha?.campos) setErros(falha.campos)
      setErro(falha?.campos ? 'Revise os campos destacados.' : (falha?.message ?? 'Não foi possível criar a conta.'))
      setEnviando(false)
    }
  }

  return (
    <section className="public-section acesso">
      <div className="public-page-title">
        <span className="sobretitulo">CONTA DE DOADOR</span>
        <h1>Crie sua conta para doar</h1>
        <p>Com a conta você doa para as campanhas e acompanha suas contribuições.</p>
      </div>
      <Secao titulo="Seus dados" descricao="Campos com * são obrigatórios.">
        <form className="pilha" onSubmit={cadastrar} noValidate>
          <fieldset className="tipo-doador">
            <legend>Você é</legend>
            {[
              ['PESSOA_FISICA', 'Pessoa física'],
              ['PESSOA_JURIDICA', 'Pessoa jurídica (empresa)'],
            ].map(([valor, rotulo]) => (
              <label key={valor}>
                <input
                  type="radio"
                  name="tipo"
                  value={valor}
                  checked={f.tipo === valor}
                  onChange={() => {
                    setF((atual) => ({ ...atual, tipo: valor }))
                    setErros({})
                  }}
                />
                {rotulo}
              </label>
            ))}
          </fieldset>
          <Campo rotulo={pf ? 'Nome completo' : 'Nome do responsável'} required autoComplete="name" {...campo('nome')} />
          {pf ? (
            <>
              <Campo rotulo="CPF" required inputMode="numeric" placeholder="000.000.000-00" {...campo('cpf')} />
              <Campo rotulo="Data de nascimento" required type="date" {...campo('dataNascimento')} />
            </>
          ) : (
            <>
              <Campo rotulo="CNPJ" required inputMode="numeric" placeholder="00.000.000/0000-00" {...campo('cnpj')} />
              <Campo rotulo="Razão social" required {...campo('razaoSocial')} />
            </>
          )}
          <Campo rotulo="E-mail" required type="email" autoComplete="email" {...campo('email')} />
          <Campo rotulo="Telefone" required type="tel" autoComplete="tel" placeholder="(48) 99999-0000" {...campo('telefone')} />
          <Campo rotulo="Senha" required type="password" autoComplete="new-password" {...campo('senha', { ajuda: erros.senha ?? 'Mínimo de 8 caracteres.' })} />
          <Campo rotulo="Confirme a senha" required type="password" autoComplete="new-password" {...campo('confirmacao')} />
          {erro && <Aviso erro>{erro}</Aviso>}
          <Botao type="submit" disabled={enviando} aria-busy={enviando}>
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </Botao>
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" state={location.state}>
              Entrar
            </Link>
          </p>
        </form>
      </Secao>
    </section>
  )
}
