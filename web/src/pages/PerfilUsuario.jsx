import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import RequestState from '../components/RequestState'
import { Aviso, Botao, Campo, Secao, Vazio } from '../components/Ui'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { usuariosService } from '../services/usuariosService'
import { validarPerfilUsuario } from '../utils/perfilUsuario'

const TIPOS = { PESSOA_FISICA: 'Pessoa física', PESSOA_JURIDICA: 'Pessoa jurídica', ENTIDADE: 'Entidade', ADMIN: 'Administrador' }

// Minha conta (RF-003): GET /usuarios/me e PATCH /usuarios/me para qualquer conta autenticada.
// Nome e telefone são editáveis; a troca de senha exige a senha atual. E-mail, CPF e CNPJ não mudam.
export default function PerfilUsuario() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  if (!usuario)
    return (
      <Vazio principal titulo="Entre para acessar sua conta">
        <Link to="/login" state={{ de: pathname }}>Entrar</Link>
      </Vazio>
    )
  return <Perfil key={usuario.id} />
}

function Perfil() {
  const request = useRequest((config) => usuariosService.meuPerfil(config), [])
  return (
    <section className="public-section perfil-usuario">
      <span className="sobretitulo">MINHA CONTA</span>
      <div className="public-page-title">
        <h1>Minha conta</h1>
        <p>Atualize seus dados de contato e sua senha.</p>
      </div>
      <RequestState {...request}>{(dados) => <Formulario dados={dados} />}</RequestState>
    </section>
  )
}

function Formulario({ dados }) {
  const { atualizarUsuario } = useAuth()
  const [perfil, setPerfil] = useState(dados)
  const [erros, setErros] = useState({})
  const salvar = useAsyncAction(usuariosService.atualizarPerfil)
  const documento = perfil.cpf || perfil.cnpj

  async function enviar(event) {
    event.preventDefault()
    const form = event.currentTarget
    const campos = Object.fromEntries(new FormData(form))
    salvar.reset()
    const encontrados = validarPerfilUsuario(campos)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const resposta = await salvar.executar({
      nome: campos.nome.trim(),
      telefone: campos.telefone.trim() || undefined,
      ...(campos.novaSenha && { senhaAtual: campos.senhaAtual, novaSenha: campos.novaSenha }),
    })
    if (resposta) {
      setPerfil(resposta)
      atualizarUsuario({ nome: resposta.nome })
      for (const campo of ['senhaAtual', 'novaSenha', 'confirmacao']) form.elements[campo].value = ''
    }
  }

  // 422 do servidor ({ erros: { campo } }), como "Senha atual incorreta.", aparece junto ao campo.
  const todos = { ...(salvar.error?.campos ?? {}), ...erros }
  const erroCampo = (campo) => todos[campo] && <small role="alert" className="erro-campo">{todos[campo]}</small>

  return (
    <div className="pilha">
      <Secao titulo="Dados da conta" descricao="Informações usadas no login e nos comprovantes.">
        <dl className="perfil-usuario__dados">
          <div><dt>E-mail</dt><dd>{perfil.email}</dd></div>
          <div><dt>Tipo de conta</dt><dd>{TIPOS[perfil.tipo] ?? perfil.tipo}</dd></div>
          {documento && <div><dt>{perfil.cpf ? 'CPF' : 'CNPJ'}</dt><dd>{documento}</dd></div>}
        </dl>
        <small>E-mail e documento não podem ser alterados.</small>
      </Secao>
      <form className="pilha" onSubmit={enviar} noValidate>
        <Secao titulo="Dados pessoais">
          <div className="form-grid">
            <div>
              <Campo rotulo="Nome" name="nome" defaultValue={perfil.nome} required maxLength={200} autoComplete="name" aria-invalid={Boolean(todos.nome)} />
              {erroCampo('nome')}
            </div>
            <div>
              <Campo rotulo="Telefone" name="telefone" type="tel" defaultValue={perfil.telefone ?? ''} maxLength={20} autoComplete="tel" aria-invalid={Boolean(todos.telefone)} />
              {erroCampo('telefone')}
            </div>
          </div>
        </Secao>
        <Secao titulo="Alterar senha" descricao="Preencha somente se quiser trocar a senha.">
          <div className="form-grid">
            <div className="campo--inteiro">
              <Campo rotulo="Senha atual" name="senhaAtual" type="password" autoComplete="current-password" aria-invalid={Boolean(todos.senhaAtual)} />
              {erroCampo('senhaAtual')}
            </div>
            <div>
              <Campo rotulo="Nova senha" name="novaSenha" type="password" autoComplete="new-password" ajuda="Mínimo de 8 caracteres." aria-invalid={Boolean(todos.novaSenha)} />
              {erroCampo('novaSenha')}
            </div>
            <div>
              <Campo rotulo="Confirme a nova senha" name="confirmacao" type="password" autoComplete="new-password" aria-invalid={Boolean(todos.confirmacao)} />
              {erroCampo('confirmacao')}
            </div>
          </div>
        </Secao>
        {salvar.error && !salvar.error.campos && <Aviso erro>{salvar.error.message}</Aviso>}
        {salvar.success && <Aviso>Seus dados foram atualizados.</Aviso>}
        <div className="acoes">
          <Botao type="submit" disabled={salvar.pending} aria-busy={salvar.pending}>
            {salvar.pending ? 'Salvando…' : 'Salvar alterações'}
          </Botao>
        </div>
      </form>
    </div>
  )
}
