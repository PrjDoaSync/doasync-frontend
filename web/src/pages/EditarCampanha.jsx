import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CamposCampanha from '../components/CamposCampanha'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Icon, Secao, Vazio } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { podeEditar } from '../utils/campanhas'
import { corpoCampanha, validarCampanha } from '../utils/criarCampanha'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import '../styles/criar-campanha.css'

// [DEV-CAM-08] Editar campanha (#92): GET /campanhas/{id} lê a campanha e a `versao`;
// PATCH /campanhas/{id} envia a mesma `versao` (lock otimista). Versão desatualizada → 409,
// e o usuário recarrega a versão atual. Só a entidade dona edita.
// SEM CONTRATO na API: metas por item e galeria/upload (a capa é uma URL).
export default function EditarCampanha() {
  const { id } = useParams()
  const request = useRequest((config) => campanhasService.buscarGestao(id, config), [id])

  return (
    <RequestState {...request}>
      {(campanha) =>
        campanha ? (
          <Edicao key={campanha.id} campanha={campanha} recarregar={request.reload} />
        ) : (
          <>
            <Vazio titulo="Campanha não encontrada" principal>
              Verifique o endereço ou volte para a lista de campanhas.
            </Vazio>
            <Botao para="/campanhas">Voltar para campanhas</Botao>
          </>
        )
      }
    </RequestState>
  )
}

const paraFormulario = (c) => ({
  titulo: c.nome,
  categoria: c.categoria,
  descricao: c.descricao,
  dataInicio: c.iniciaEm,
  dataFim: c.encerraEm,
  metaValor: String(c.meta),
  imagemUrl: c.imagemUrl,
})

function Edicao({ campanha, recarregar }) {
  const { usuario } = useAuth()
  const [f, setF] = useState(() => paraFormulario(campanha))
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState(null)
  // Depois de um conflito (409), a nova leitura do detalhe substitui o formulário pela versão atual.
  const aguardandoLeitura = useRef(null)
  useEffect(() => {
    if (!aguardandoLeitura.current || aguardandoLeitura.current === campanha) return
    aguardandoLeitura.current = null
    setF(paraFormulario(campanha))
    setErros({})
    setResultado(null)
  }, [campanha])

  function carregarVersaoAtual() {
    aguardandoLeitura.current = campanha
    recarregar()
  }

  const dona = usuario.tipo === 'ENTIDADE' && usuario.entidadeId === campanha.entidadeId
  const semVersao = campanha.versao == null
  const editavel = dona && podeEditar(campanha.status) && !semVersao
  const pct = percentual(campanha.arrecadado, campanha.meta)

  const motivoBloqueio = !dona
    ? 'Somente a entidade responsável pode editar esta campanha.'
    : !podeEditar(campanha.status)
      ? `Esta campanha não pode mais ser editada. Status atual: ${campanha.status}.`
      : semVersao
        ? 'A edição está indisponível: o servidor não informou a versão da campanha, necessária para salvar sem sobrescrever outra alteração.'
        : null

  async function salvar(e) {
    e.preventDefault()
    if (!editavel || salvando) return
    const novos = validarCampanha(f)
    const meta = Number(String(f.metaValor).replace(',', '.'))
    if (!novos.metaValor && meta < campanha.arrecadado)
      novos.metaValor = `A meta não pode ser menor que o total recebido (${formatarMoeda(campanha.arrecadado)}).`
    setErros(novos)
    setResultado(null)
    if (Object.keys(novos).length) {
      setResultado({ erro: true, texto: 'Revise os campos destacados.' })
      return
    }
    setSalvando(true)
    try {
      await campanhasService.atualizar(campanha.id, corpoCampanha(f), campanha.versao)
      setSalvando(false)
      setResultado({ erro: false, texto: 'Campanha atualizada com sucesso.' })
      // A resposta do PATCH não traz a nova `versao`: relemos o detalhe para a próxima edição.
      recarregar()
    } catch (falha) {
      setSalvando(false)
      if (falha?.campos) setErros(falha.campos)
      setResultado({
        erro: true,
        conflito: falha?.status === 409,
        texto:
          falha?.status === 409
            ? `${falha.message} Carregue a versão atual para continuar; as alterações não salvas serão descartadas.`
            : falha?.campos
              ? 'Revise os campos destacados.'
              : (falha?.message ?? 'Não foi possível salvar. Seus dados foram mantidos no formulário.'),
      })
    }
  }

  return (
    <>
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>
        <Link to={`/campanhas/${campanha.id}/acompanhamento`}>{campanha.nome}</Link>
        <span>/</span>Editar
      </nav>
      <PageHeader titulo="Editar campanha" descricao="Atualize as informações de uma campanha da sua entidade.">
        <Botao para={`/campanhas/${campanha.id}/acompanhamento`} secundario>
          <Icon nome="relatorios" size={16} /> Acompanhar campanha
        </Botao>
      </PageHeader>
      {motivoBloqueio ? (
        <Aviso>{motivoBloqueio}</Aviso>
      ) : (
        <Aviso>As alterações aparecem na vitrine depois de salvas. Doações recebidas e o histórico são preservados.</Aviso>
      )}
      <div className="dashboard-grid">
        <Secao
          titulo="Informações da campanha"
          descricao="Os campos com * são obrigatórios."
          acao={<StatusBadge valor={campanha.status} />}
        >
          <form noValidate onSubmit={salvar} aria-busy={salvando}>
            <fieldset disabled={!editavel || salvando} className="campos-edicao">
              <legend className="sr-only">Dados editáveis</legend>
              <CamposCampanha f={f} setF={setF} erros={erros} bloquearInicio={campanha.status === 'Ativa'} />
            </fieldset>
            {resultado && (
              <Aviso erro={resultado.erro}>
                {resultado.texto}
                {resultado.conflito && (
                  <>
                    {' '}
                    <button type="button" className="link-botao" onClick={carregarVersaoAtual}>
                      Carregar versão atual
                    </button>
                  </>
                )}
              </Aviso>
            )}
            <div className="acoes">
              <Botao para="/campanhas" secundario>Cancelar</Botao>
              <Botao type="submit" disabled={!editavel || salvando}>
                {salvando ? 'Salvando…' : <><Icon nome="check" size={16} /> Salvar alterações</>}
              </Botao>
            </div>
          </form>
        </Secao>
        <Secao titulo={campanha.nome} className="cam-previa">
          <img src={campanha.imagem} alt="" />
          <p>{campanha.entidade}{campanha.categoria && ` · ${campanha.categoria}`}</p>
          <hr />
          <small>ARRECADADO ATÉ AGORA</small>
          <strong className="numero-destaque">{formatarMoeda(campanha.arrecadado)}</strong>
          <div className="progresso" role="img" aria-label={`${pct}% da meta`}>
            <div className="progresso__barra" style={{ width: `${pct}%` }} />
          </div>
          <p>{pct}% da meta de {formatarMoeda(campanha.meta)}</p>
          <small>PERÍODO DA CAMPANHA</small>
          <p>{formatarData(campanha.iniciaEm)} a {formatarData(campanha.encerraEm)}</p>
        </Secao>
      </div>
    </>
  )
}
