import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Botao, Campo, Secao } from '../components/Ui'
import { authService } from '../services/authService'
import { corpoCadastroEntidade, validarCadastroEntidade } from '../utils/cadastroEntidade'

const AREAS = ['Assistência social e alimentação', 'Educação', 'Saúde', 'Meio ambiente', 'Proteção animal', 'Outros']
const VAZIO = {
  nome: '', razaoSocial: '', cnpj: '', email: '', telefone: '', senha: '', confirmacao: '',
  descricao: '', areaAtuacao: AREAS[0], site: '', responsavelNome: '', responsavelCpf: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
}

// Cadastro público de entidade (POST /entidades). A entidade nasce PENDENTE e só cria
// campanhas depois de aprovada por um administrador. Sem endpoint na API: envio de documentos.
export default function CadastroEntidade() {
  const [f, setF] = useState(VAZIO),
    [erros, setErros] = useState({}),
    [erro, setErro] = useState(''),
    [enviando, setEnviando] = useState(false),
    [criada, setCriada] = useState(null)

  // Props de um campo do formulário; a mensagem de erro, se houver, substitui o texto de ajuda.
  const campo = (nome, ajuda) => ({
    name: nome,
    value: f[nome],
    onChange: (e) => setF((atual) => ({ ...atual, [nome]: e.target.value })),
    ajuda: erros[nome] ?? ajuda,
    'aria-invalid': erros[nome] ? true : undefined,
  })

  async function cadastrar(e) {
    e.preventDefault()
    setErro('')
    const encontrados = validarCadastroEntidade(f)
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      setErro('Revise os campos destacados.')
      return
    }
    setEnviando(true)
    try {
      setCriada(await authService.cadastrarEntidade(corpoCadastroEntidade(f)))
    } catch (falha) {
      // 422/409 por campo; "responsavel" (RN46) é marcado nos dois campos do responsável.
      if (falha?.campos) {
        const { responsavel, ...demais } = falha.campos
        setErros(responsavel ? { ...demais, responsavelNome: responsavel, responsavelCpf: responsavel } : demais)
      }
      setErro(falha?.campos ? 'Revise os campos destacados.' : (falha?.message ?? 'Não foi possível concluir o cadastro.'))
    } finally {
      setEnviando(false)
    }
  }

  if (criada)
    return (
      <section className="public-section acesso">
        <div className="public-page-title">
          <span className="sobretitulo">CADASTRO DE ENTIDADE</span>
          <h1>Cadastro enviado para análise</h1>
          <p>
            A entidade <strong>{criada.nomeFantasia || criada.razaoSocial}</strong> foi cadastrada e está{' '}
            <strong>aguardando aprovação</strong> da equipe do DoaSync.
          </p>
        </div>
        <Secao titulo="Próximos passos">
          <ul className="lista-dicas">
            <li>Você já pode entrar com o e-mail e a senha cadastrados.</li>
            <li>Depois da aprovação, a entidade aparece no DoaSync e pode criar campanhas.</li>
          </ul>
          <div className="acoes">
            <Botao para="/login">Entrar</Botao>
            <Botao secundario para="/">Voltar ao início</Botao>
          </div>
        </Secao>
      </section>
    )

  return (
    <section className="public-section acesso">
      <div className="public-page-title">
        <span className="sobretitulo">CADASTRO DE ENTIDADE</span>
        <h1>Cadastre sua entidade</h1>
        <p>Depois da aprovação, sua entidade pode criar campanhas e receber doações. Campos com * são obrigatórios.</p>
      </div>
      <form className="pilha" onSubmit={cadastrar} noValidate>
        <Secao titulo="Dados da entidade">
          <div className="form-grid">
            <Campo rotulo="Nome da entidade" required maxLength={200} {...campo('nome', 'Como a entidade aparece no DoaSync.')} />
            <Campo rotulo="Razão social" required maxLength={200} {...campo('razaoSocial')} />
            <Campo rotulo="CNPJ" required inputMode="numeric" placeholder="00.000.000/0000-00" {...campo('cnpj')} />
            <Campo rotulo="Área de atuação">
              <select name="areaAtuacao" value={f.areaAtuacao} onChange={(e) => setF({ ...f, areaAtuacao: e.target.value })}>
                {AREAS.map((a) => <option key={a}>{a}</option>)}
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

        <Secao titulo="Acesso" descricao="O e-mail e a senha serão usados para entrar na área da entidade.">
          <div className="form-grid">
            <Campo rotulo="E-mail" required type="email" autoComplete="email" {...campo('email')} />
            <Campo rotulo="Telefone" required type="tel" maxLength={20} placeholder="(48) 3333-0000" {...campo('telefone')} />
            <Campo rotulo="Senha" required type="password" autoComplete="new-password" {...campo('senha', 'Mínimo de 8 caracteres.')} />
            <Campo rotulo="Confirme a senha" required type="password" autoComplete="new-password" {...campo('confirmacao')} />
          </div>
        </Secao>

        <Secao titulo="Responsável legal (opcional)" descricao="Se informar, preencha o nome e o CPF juntos.">
          <div className="form-grid">
            <Campo rotulo="Nome do responsável" maxLength={200} {...campo('responsavelNome')} />
            <Campo rotulo="CPF do responsável" inputMode="numeric" placeholder="000.000.000-00" {...campo('responsavelCpf')} />
          </div>
        </Secao>

        <Secao titulo="Endereço (opcional)" descricao="Se informar, preencha todos os campos (o complemento é opcional).">
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

        {erro && <Aviso erro>{erro}</Aviso>}
        <div className="acoes acoes--entre">
          <p>
            Já tem cadastro? <Link to="/login">Entrar</Link>
          </p>
          <Botao type="submit" disabled={enviando} aria-busy={enviando}>
            {enviando ? 'Enviando cadastro…' : 'Cadastrar entidade'}
          </Botao>
        </div>
      </form>
    </section>
  )
}
