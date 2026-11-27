import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Aviso, Botao, Campo, Etapas, Secao } from '../components/Ui'
import AvisoIndisponivel from '../components/AvisoIndisponivel'
import CampaignImages from '../components/CampaignImages'
import PageHeader from '../components/PageHeader'
import CamposCampanha from '../components/CamposCampanha'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../hooks/useDemo'
import { campanhasService } from '../services/campanhasService'
import { hojeISO } from '../utils/campanhas'
import { formatarData, formatarMoeda } from '../utils/format'
import {
  CAMPANHA_VAZIA,
  CAMPOS_POR_ETAPA,
  IMAGENS_CAMPANHA,
  corpoCampanha,
  etapaDoErro,
  validarCampanha,
  validarItemCampanha,
} from '../utils/criarCampanha'
import '../styles/criar-campanha.css'

const ETAPAS = ['Dados básicos', 'Metas e itens', 'Imagens e publicação']
const DESCRICOES = [
  'Comece contando a história da sua causa.',
  'Defina quanto a campanha precisa arrecadar e o que mais ela precisa.',
  'Escolha a imagem de capa, revise e publique.',
]
const PARTES = [['basicos'], ['meta'], ['imagem']]
const metaNumerica = (valor) => Number(String(valor).replace(',', '.')) || 0

// Criar campanha (CAM-04 a CAM-06, #88 a #90) em três etapas, como no protótipo. POST /campanhas:
// só ENTIDADE aprovada. "Salvar rascunho" envia rascunho: true; "Publicar" cria ATIVA, ou AGENDADA
// quando o início é futuro. SEM ROTA na API (services/indisponivel.js): metas por item e
// envio de imagens — os itens ficam só na tela e a capa é uma URL.
export default function CriarCampanha() {
  const { usuario } = useAuth()
  const { notificar } = useDemo()
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(0)
  const [f, setF] = useState({ ...CAMPANHA_VAZIA, imagemUrl: IMAGENS_CAMPANHA[0].arquivo })
  const [itens, setItens] = useState([])
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  if (usuario.tipo !== 'ENTIDADE' || usuario.statusEntidade !== 'APROVADA')
    return (
      <Aviso>
        {usuario.tipo === 'ENTIDADE'
          ? 'Sua entidade ainda não foi aprovada: a criação de campanhas fica disponível após a aprovação.'
          : 'Campanhas são criadas pelas entidades.'}{' '}
        <Link to="/campanhas">Voltar às campanhas</Link>
      </Aviso>
    )

  // Valida os campos até a etapa `ate` (inclusive). Com erro em campo, volta para a etapa dele.
  function validar(opcoes, ate = CAMPOS_POR_ETAPA.length - 1) {
    const todos = validarCampanha(f, { hoje: hojeISO(), confirmado, ...opcoes })
    const permitidos = CAMPOS_POR_ETAPA.slice(0, ate + 1).flat()
    const encontrados = Object.fromEntries(Object.entries(todos).filter(([campo]) => permitidos.includes(campo)))
    setErros(encontrados)
    const { confirmado: faltaConfirmar, ...campos } = encontrados
    setErro(Object.keys(campos).length ? 'Revise os campos destacados.' : (faltaConfirmar ?? ''))
    const destino = etapaDoErro(campos)
    if (destino !== -1 && destino !== etapa) setEtapa(destino)
    return Object.keys(encontrados).length === 0
  }

  function avancar(e) {
    e.preventDefault()
    if (validar({ publicar: false }, etapa)) setEtapa(etapa + 1)
  }

  async function salvar(rascunho) {
    if (salvando || !validar({ publicar: !rascunho })) return
    setSalvando(true)
    try {
      const criada = await campanhasService.criar(corpoCampanha(f), rascunho)
      notificar(
        rascunho
          ? 'Rascunho salvo.'
          : criada.status === 'Agendada'
            ? `Campanha agendada para ${formatarData(criada.iniciaEm)}.`
            : 'Campanha publicada.',
      )
      navigate('/campanhas')
    } catch (falha) {
      if (falha?.campos) {
        setErros(falha.campos)
        const destino = etapaDoErro(falha.campos)
        if (destino !== -1) setEtapa(destino)
      }
      setErro(falha?.campos ? 'Revise os campos destacados.' : (falha?.message ?? 'Não foi possível salvar.'))
      setSalvando(false)
    }
  }

  const voltar = () => {
    setErro('')
    setEtapa(etapa - 1)
  }
  const botaoRascunho = (
    <Botao secundario onClick={() => salvar(true)} disabled={salvando}>
      {salvando ? 'Salvando…' : 'Salvar rascunho'}
    </Botao>
  )

  return (
    <>
      <div className="breadcrumb">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>Criar campanha
      </div>
      <PageHeader titulo="Criar campanha" descricao={DESCRICOES[etapa]} />
      <Etapas atual={etapa} itens={ETAPAS} />
      <div className="dashboard-grid">
        <Secao titulo={ETAPAS[etapa]} descricao={etapa === 0 ? 'As informações ajudam os doadores a conhecer sua iniciativa.' : undefined}>
          <form noValidate onSubmit={etapa < 2 ? avancar : (e) => {
            e.preventDefault()
            salvar(false)
          }}>
            <CamposCampanha f={f} setF={setF} erros={erros} partes={PARTES[etapa]} />
            {etapa === 1 && <ItensNecessarios itens={itens} setItens={setItens} />}
            {etapa === 2 && <Revisao f={f} itens={itens} confirmado={confirmado} setConfirmado={setConfirmado} />}
            {erro && <Aviso erro>{erro}</Aviso>}
            <div className="acoes">
              {etapa === 0 ? (
                <Botao para="/campanhas" secundario>Cancelar</Botao>
              ) : (
                <Botao secundario onClick={voltar} disabled={salvando}>Voltar</Botao>
              )}
              {botaoRascunho}
              {etapa < 2 ? (
                <Botao type="submit" disabled={salvando}>Continuar</Botao>
              ) : (
                <Botao type="submit" disabled={salvando} aria-busy={salvando}>
                  {salvando ? 'Publicando…' : 'Publicar campanha'}
                </Botao>
              )}
            </div>
          </form>
        </Secao>
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
          {f.metaValor && <strong className="numero-destaque">{formatarMoeda(metaNumerica(f.metaValor))}</strong>}
          {itens.length > 0 && (
            <>
              <small>ITENS NECESSÁRIOS (NÃO ENVIADOS)</small>
              <ul className="itens-campanha">
                {itens.map((i) => (
                  <li key={i.nome}>
                    {i.nome}
                    <strong>{i.quantidade} un.</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Secao>
      </div>
    </>
  )
}

// Etapa 2 (CAM-05): itens necessários além da meta financeira. Ficam só na tela.
function ItensNecessarios({ itens, setItens }) {
  const [novo, setNovo] = useState({ nome: '', quantidade: '' })
  const [erros, setErros] = useState({})

  function adicionar() {
    const encontrados = validarItemCampanha(novo, itens)
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    setItens([...itens, { nome: novo.nome.trim(), quantidade: Number(novo.quantidade) }])
    setNovo({ nome: '', quantidade: '' })
  }

  return (
    <>
      <h3 className="subtitulo">Itens necessários</h3>
      <AvisoIndisponivel recurso="itensCampanha">A lista abaixo serve para planejar e não é enviada.</AvisoIndisponivel>
      {itens.length === 0 ? (
        <p className="lista-vazia">Nenhum item adicionado.</p>
      ) : (
        <ul className="itens-campanha">
          {itens.map((i) => (
            <li key={i.nome}>
              <div>
                <strong>{i.nome}</strong>
                <small>{i.quantidade} unidade(s)</small>
              </div>
              <Botao secundario onClick={() => setItens(itens.filter((x) => x.nome !== i.nome))} aria-label={`Remover ${i.nome}`}>
                Remover
              </Botao>
            </li>
          ))}
        </ul>
      )}
      <div className="novo-item">
        <Campo
          rotulo="Item"
          value={novo.nome}
          placeholder="Ex.: Cesta básica"
          maxLength={120}
          ajuda={erros.nome}
          aria-invalid={erros.nome ? true : undefined}
          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
        />
        <Campo
          rotulo="Quantidade"
          inputMode="numeric"
          value={novo.quantidade}
          ajuda={erros.quantidade}
          aria-invalid={erros.quantidade ? true : undefined}
          onChange={(e) => setNovo({ ...novo, quantidade: e.target.value })}
        />
        <Botao secundario onClick={adicionar}>Adicionar item</Botao>
      </div>
    </>
  )
}

// Etapa 3 (CAM-06): imagens, revisão e publicação.
function Revisao({ f, itens, confirmado, setConfirmado }) {
  return (
    <>
      <h3 className="subtitulo">Galeria de fotos</h3>
      <AvisoIndisponivel recurso="uploadImagens" />
      <CampaignImages imagem="" onImagem={() => {}} galeria={[]} onGaleria={() => {}} disabled />
      <h3 className="subtitulo">Revisão</h3>
      <dl className="revisao">
        <div><dt>Título</dt><dd>{f.titulo}</dd></div>
        <div><dt>Categoria</dt><dd>{f.categoria || 'Não informada'}</dd></div>
        <div><dt>Período</dt><dd>{formatarData(f.dataInicio)} a {formatarData(f.dataFim)}</dd></div>
        <div><dt>Meta financeira</dt><dd>{formatarMoeda(metaNumerica(f.metaValor))}</dd></div>
        <div><dt>Itens necessários</dt><dd>{itens.length ? `${itens.length} (não enviados)` : 'Nenhum'}</dd></div>
      </dl>
      {f.dataInicio > hojeISO() && (
        <Aviso>O início é em {formatarData(f.dataInicio)}: a campanha fica agendada e começa a receber doações nesse dia.</Aviso>
      )}
      <label className="campanha-confirmacao">
        <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} />
        Confirmo que as informações estão corretas.
      </label>
    </>
  )
}
