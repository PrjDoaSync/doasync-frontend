import { useState } from 'react'
import { useParams } from 'react-router-dom'
import CamposCampanha from '../components/CamposCampanha'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import { Aviso, Botao, Vazio } from '../components/Ui'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { podeEditar } from '../utils/campanhas'
import { corpoCampanha, validarCampanha } from '../utils/criarCampanha'

export default function EditarCampanha() {
  const { id } = useParams()
  return <ConsultaEdicao key={id} id={id} />
}

function ConsultaEdicao({ id }) {
  const { usuario } = useAuth()
  const request = useRequest((config) => campanhasService.buscarPublica(id, config).then((campanha) => ({ campanha })), [id])

  return (
    <>
      <PageHeader titulo="Editar campanha"><Botao para="/campanhas" secundario>Voltar</Botao></PageHeader>
      <RequestState key={id} {...request}>
        {({ campanha }) => {
          if (!campanha || usuario.tipo !== 'ENTIDADE' || campanha.entidadeId !== usuario.entidadeId) {
            return <Vazio titulo="Campanha indisponível para edição" />
          }
          if (!podeEditar(campanha.status)) return <Aviso>Campanhas {campanha.status.toLowerCase()}s não podem ser editadas.</Aviso>
          if (!Number.isSafeInteger(campanha.versao)) return <Aviso>A edição está indisponível nesta versão da API. A consulta precisa informar a versão da campanha.</Aviso>
          return <Formulario key={campanha.id} campanha={campanha} />
        }}
      </RequestState>
    </>
  )
}

function camposDaCampanha(campanha) {
  return {
    titulo: campanha.nome,
    descricao: campanha.descricao,
    categoria: campanha.categoria,
    metaValor: String(campanha.meta),
    dataInicio: campanha.iniciaEm,
    dataFim: campanha.encerraEm,
    imagemUrl: campanha.imagemUrl,
  }
}

function Formulario({ campanha }) {
  const [atual, setAtual] = useState(campanha)
  const [f, setF] = useState(() => camposDaCampanha(campanha))
  const [erros, setErros] = useState({})
  const salvar = useAsyncAction((corpo) => campanhasService.atualizar(atual.id, corpo))
  const recarregar = useAsyncAction(async () => {
    const versaoAtual = await campanhasService.buscarPublica(atual.id)
    if (!versaoAtual || !podeEditar(versaoAtual.status) || !Number.isSafeInteger(versaoAtual.versao)) {
      throw new Error('A campanha não está disponível para edição.')
    }
    return versaoAtual
  })

  async function descartarRascunho() {
    const versaoAtual = await recarregar.executar()
    if (!versaoAtual) return
    setAtual(versaoAtual)
    setF(camposDaCampanha(versaoAtual))
    setErros({})
    salvar.reset()
  }

  async function submit(event) {
    event.preventDefault()
    if (salvar.pending || salvar.error?.status === 409 || !Number.isSafeInteger(atual.versao)) return
    salvar.reset()
    const invalidos = validarCampanha(f)
    if (Number(f.metaValor.replace(',', '.')) < atual.arrecadado) invalidos.metaValor = 'A meta não pode ser menor que o valor arrecadado.'
    setErros(invalidos)
    if (Object.keys(invalidos).length) return
    const resposta = await salvar.executar({ ...corpoCampanha(f), versao: atual.versao })
    if (resposta) setAtual(resposta)
  }

  return (
    <form className="cartao pilha" onSubmit={submit} noValidate>
      <fieldset disabled={salvar.pending || salvar.error?.status === 409 || !Number.isSafeInteger(atual.versao)}>
        <legend>Informações da campanha</legend>
        <CamposCampanha f={f} setF={setF} erros={{ ...salvar.error?.campos, ...erros }} bloquearInicio={atual.status === 'Ativa'} />
        <Botao type="submit">{salvar.pending ? 'Salvando…' : 'Salvar alterações'}</Botao>
      </fieldset>
      {salvar.success && <Aviso>Campanha atualizada.</Aviso>}
      {salvar.error && <Aviso erro>{salvar.error.message}</Aviso>}
      {salvar.error?.status === 409 && (
        <>
          <p>Copie as alterações que quiser reaplicar antes de carregar a versão atual.</p>
          <Botao secundario onClick={descartarRascunho} disabled={recarregar.pending}>
            {recarregar.pending ? 'Carregando…' : 'Descartar rascunho e carregar versão atual'}
          </Botao>
          {recarregar.error && <Aviso erro>{recarregar.error.message}</Aviso>}
        </>
      )}
    </form>
  )
}
