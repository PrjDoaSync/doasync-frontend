import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Aviso, Botao, Etapas, Secao } from '../components/Ui'
import PageHeader from '../components/PageHeader'
import CamposCampanha from '../components/CamposCampanha'
import { useAuth } from '../hooks/useAuth'
import { campanhasService } from '../services/campanhasService'
import { formatarData, formatarMoeda } from '../utils/format'
import { CAMPANHA_VAZIA, IMAGENS_CAMPANHA, corpoCampanha, validarCampanha } from '../utils/criarCampanha'
import '../styles/criar-campanha.css'

const ETAPAS = ['Dados da campanha', 'Revisão e publicação']
const hojeISO = () => new Date().toISOString().slice(0, 10)

// Criar campanha (POST /campanhas): só ENTIDADE aprovada. "Salvar rascunho" envia rascunho: true;
// "Publicar" cria ATIVA, ou AGENDADA quando o início é futuro. Sem API: itens necessários,
// galeria e upload de imagem (a capa é uma URL).
export default function CriarCampanha() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(0),
    [f, setF] = useState({ ...CAMPANHA_VAZIA, imagemUrl: IMAGENS_CAMPANHA[0].arquivo }),
    [erros, setErros] = useState({}),
    [erro, setErro] = useState(''),
    [confirmado, setConfirmado] = useState(false),
    [salvando, setSalvando] = useState(false)

  if (usuario.tipo !== 'ENTIDADE' || usuario.statusEntidade !== 'APROVADA')
    return (
      <Aviso>
        {usuario.tipo === 'ENTIDADE'
          ? 'Sua entidade ainda não foi aprovada: a criação de campanhas fica disponível após a aprovação.'
          : 'Campanhas são criadas pelas entidades.'}{' '}
        <Link to="/campanhas">Voltar às campanhas</Link>
      </Aviso>
    )

  // Valida e mostra os erros; devolve true quando está tudo certo.
  function validar(opcoes) {
    const encontrados = validarCampanha(f, { hoje: hojeISO(), confirmado, ...opcoes })
    setErros(encontrados)
    const { confirmado: faltaConfirmar, ...campos } = encontrados
    setErro(Object.keys(campos).length ? 'Revise os campos destacados.' : (faltaConfirmar ?? ''))
    // Erro em algum campo do formulário: volta para a etapa onde ele está.
    if (Object.keys(campos).length && etapa === 1) setEtapa(0)
    return Object.keys(encontrados).length === 0
  }

  async function salvar(rascunho) {
    if (salvando || !validar({ publicar: !rascunho })) return
    setSalvando(true)
    try {
      const criada = await campanhasService.criar(corpoCampanha(f), rascunho)
      const aviso = rascunho
        ? 'Rascunho salvo.'
        : criada.status === 'Agendada'
          ? `Campanha agendada para ${formatarData(criada.iniciaEm)}.`
          : 'Campanha publicada.'
      navigate('/campanhas', { state: { aviso } })
    } catch (falha) {
      if (falha?.campos) setErros(falha.campos)
      setErro(falha?.campos ? 'Revise os campos destacados.' : (falha?.message ?? 'Não foi possível salvar.'))
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>Criar campanha
      </div>
      <PageHeader titulo="Criar campanha" descricao="Comece contando a história da sua causa." />
      <Etapas atual={etapa} itens={ETAPAS} />
      <div className="dashboard-grid">
        {etapa === 0 ? (
          <Secao titulo="Dados da campanha" descricao="As informações ajudam os doadores a conhecer sua iniciativa.">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (validar({ publicar: false })) setEtapa(1)
              }}
            >
              <CamposCampanha f={f} setF={setF} erros={erros} />
              {erro && <Aviso erro>{erro}</Aviso>}
              <div className="acoes">
                <Botao para="/campanhas" secundario>Cancelar</Botao>
                <Botao secundario onClick={() => salvar(true)} disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar rascunho'}
                </Botao>
                <Botao type="submit" disabled={salvando}>Continuar</Botao>
              </div>
            </form>
          </Secao>
        ) : (
          <Secao titulo="Revisão e publicação" descricao="Confira os dados e publique.">
            <dl className="revisao">
              <div><dt>Título</dt><dd>{f.titulo}</dd></div>
              <div><dt>Categoria</dt><dd>{f.categoria || 'Não informada'}</dd></div>
              <div><dt>Período</dt><dd>{formatarData(f.dataInicio)} a {formatarData(f.dataFim)}</dd></div>
              <div><dt>Meta financeira</dt><dd>{formatarMoeda(Number(String(f.metaValor).replace(',', '.')))}</dd></div>
            </dl>
            {f.dataInicio > hojeISO() && (
              <Aviso>O início é em {formatarData(f.dataInicio)}: a campanha fica agendada e começa a receber doações nesse dia.</Aviso>
            )}
            <label className="campanha-confirmacao">
              <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} />
              Confirmo que as informações estão corretas.
            </label>
            {erro && <Aviso erro>{erro}</Aviso>}
            <div className="acoes">
              <Botao secundario onClick={() => { setErro(''); setEtapa(0) }} disabled={salvando}>Voltar</Botao>
              <Botao secundario onClick={() => salvar(true)} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar rascunho'}
              </Botao>
              <Botao onClick={() => salvar(false)} disabled={salvando} aria-busy={salvando}>
                {salvando ? 'Publicando…' : 'Publicar campanha'}
              </Botao>
            </div>
          </Secao>
        )}
        <Secao titulo={f.titulo || 'Sua campanha'} className="cam-previa">
          <span className="badge">Prévia</span>
          {f.imagemUrl && <img src={f.imagemUrl} alt="Prévia da imagem de capa" />}
          <p>{usuario.nome}{f.categoria && ` · ${f.categoria}`}</p>
          <hr />
          <small>PERÍODO DA CAMPANHA</small>
          <p>
            {f.dataInicio ? formatarData(f.dataInicio) : 'Início a definir'} a {f.dataFim ? formatarData(f.dataFim) : 'término a definir'}
          </p>
          <p>{f.descricao || 'Conte a história e as necessidades da sua campanha.'}</p>
          {f.metaValor && <strong className="numero-destaque">{formatarMoeda(Number(String(f.metaValor).replace(',', '.')) || 0)}</strong>}
        </Secao>
      </div>
    </>
  )
}
