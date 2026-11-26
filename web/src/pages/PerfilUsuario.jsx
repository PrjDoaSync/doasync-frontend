import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import RequestState from '../components/RequestState'
import { Aviso, Botao, Campo, Secao, Vazio } from '../components/Ui'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { usuariosService } from '../services/usuariosService'

export default function PerfilUsuario() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  if (!usuario) return <Vazio principal titulo="Entre para acessar sua conta"><Link to="/login" state={{ de: pathname }}>Entrar</Link></Vazio>
  return <Perfil key={usuario.id} />
}

function Perfil() {
  const request = useRequest(usuariosService.meuPerfil, [])
  return (
    <section className="public-section">
      <div className="public-page-title"><h1>Minha conta</h1></div>
      <RequestState {...request}>{(dados) => <Formulario dados={dados} />}</RequestState>
    </section>
  )
}

function Formulario({ dados }) {
  const [perfil, setPerfil] = useState(dados)
  const [erro, setErro] = useState('')
  const salvar = useAsyncAction(usuariosService.atualizarPerfil)

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const { nome, telefone, senhaAtual, novaSenha } = Object.fromEntries(new FormData(form))
    salvar.reset()
    setErro('')
    if (!nome.trim() || (novaSenha && !senhaAtual.trim())) {
      setErro('Informe seu nome e, para trocar a senha, preencha a senha atual.')
      return
    }
    const resposta = await salvar.executar({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      ...(novaSenha && { senhaAtual, novaSenha }),
    })
    if (resposta) {
      form.reset()
      setPerfil(resposta)
    }
  }

  return (
    <Secao titulo="Dados da conta">
      <p>{perfil.email}</p>
      <form key={JSON.stringify([perfil.nome, perfil.telefone])} className="form-grid" onSubmit={submit}>
        <Campo rotulo="Nome" name="nome" defaultValue={perfil.nome} required maxLength={200} autoComplete="name" />
        <Campo rotulo="Telefone" name="telefone" type="tel" defaultValue={perfil.telefone ?? ''} maxLength={20} autoComplete="tel" />
        <Campo rotulo="Senha atual" name="senhaAtual" type="password" autoComplete="current-password" />
        <Campo rotulo="Nova senha" name="novaSenha" type="password" minLength={8} autoComplete="new-password" />
        <div><Botao type="submit" disabled={salvar.pending}>{salvar.pending ? 'Salvando…' : 'Salvar alterações'}</Botao></div>
        {(erro || salvar.error) && <Aviso erro>{erro || salvar.error.message}</Aviso>}
        {salvar.success && <Aviso>Perfil atualizado.</Aviso>}
      </form>
    </Secao>
  )
}
