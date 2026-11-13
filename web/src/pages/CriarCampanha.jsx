import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { Aviso, Botao, Campo, Etapas, Secao } from '../components/Ui'
import PageHeader from '../components/PageHeader'
import { categorias } from '../mocks/gestao'
import { HOJE_DEMO } from '../mocks/campanhasDetalhe'
import { formatarData, formatarMoeda } from '../utils/format'
import {
  IMAGENS_CAMPANHA,
  montarCampanha,
  validarBasicos,
  validarMetas,
  validarNovoItem,
  validarPublicacao,
} from '../utils/criarCampanha'
import '../styles/criar-campanha.css'

const VAZIO = {
  nome: '',
  categoria: '',
  cidade: 'São Paulo, SP',
  descricao: '',
  inicio: '',
  encerraEm: '',
  meta: '',
}
const ETAPAS = ['Dados básicos', 'Metas e necessidades', 'Revisão e publicação']
const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function CriarCampanha() {
  const { dados, atualizar, notificar } = useDemo(),
    navigate = useNavigate(),
    formRef = useRef(null),
    [etapa, setEtapa] = useState(0),
    [basicos, setBasicos] = useState(VAZIO),
    [itens, setItens] = useState([]),
    [novoItem, setNovoItem] = useState({ nome: '', quantidade: '' }),
    [erroItem, setErroItem] = useState(''),
    [imagem, setImagem] = useState(IMAGENS_CAMPANHA[0].arquivo),
    [confirmado, setConfirmado] = useState(false),
    [erro, setErro] = useState(''),
    [salvando, setSalvando] = useState(false)

  function lerBasicos() {
    return { ...basicos, ...Object.fromEntries(new FormData(formRef.current)) }
  }
  // Valida a etapa 1 e guarda os dados; devolve os dados ou null se houver erro.
  function validarEtapa1() {
    const f = lerBasicos()
    const mensagem = validarBasicos(f)
    if (mensagem) {
      setErro(mensagem)
      return null
    }
    setErro('')
    setBasicos(f)
    return f
  }
  function continuar(e) {
    e?.preventDefault()
    if (etapa === 0) {
      if (validarEtapa1()) setEtapa(1)
      return
    }
    const mensagem = validarMetas({ meta: basicos.meta, itens })
    if (mensagem) {
      setErro(mensagem)
      return
    }
    setErro('')
    setEtapa(2)
  }
  function adicionarItem(e) {
    e.preventDefault()
    const mensagem = validarNovoItem(novoItem, itens)
    if (mensagem) {
      setErroItem(mensagem)
      return
    }
    setItens([...itens, { nome: novoItem.nome.trim(), meta: Number(novoItem.quantidade) }])
    setNovoItem({ nome: '', quantidade: '' })
    setErroItem('')
  }
  async function salvar(status) {
    // Do primeiro passo o formulário ainda não foi guardado; nos demais, já está em `basicos`.
    const f = etapa === 0 ? validarEtapa1() : basicos
    if (!f) return
    if (status === 'Ativa') {
      const mensagem = validarPublicacao({ encerraEm: f.encerraEm, confirmado }, HOJE_DEMO)
      if (mensagem) {
        setErro(mensagem)
        return
      }
    }
    setSalvando(true)
    setErro('')
    try {
      await pausa(300)
      const nova = montarCampanha({
        id: Date.now(),
        basicos: f,
        meta: f.meta,
        itens,
        imagem,
        entidade: dados.entidade,
        status,
      })
      atualizar('campanhas', [...dados.campanhas, nova])
      notificar(
        status === 'Ativa'
          ? 'Campanha publicada nesta sessão de demonstração.'
          : 'Rascunho salvo nesta sessão de demonstração.',
      )
      navigate('/campanhas')
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>Criar campanha
      </div>
      <PageHeader
        titulo="Criar campanha"
        descricao="Comece contando a história da sua causa."
      />
      <Etapas atual={etapa} itens={ETAPAS} />
      <div className="dashboard-grid">
        {etapa === 0 ? (
          <Secao
            titulo="Dados básicos"
            descricao="As informações ajudam os doadores a conhecer sua iniciativa."
          >
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault()
                salvar('Rascunho')
              }}
              className="form-grid"
            >
              <Campo
                rotulo="Nome da campanha"
                name="nome"
                required
                maxLength={120}
                defaultValue={basicos.nome}
                placeholder="Ex.: Mesa solidária para 200 famílias"
                className="campo--inteiro"
              />
              <Campo rotulo="Categoria">
                <select name="categoria" required defaultValue={basicos.categoria}>
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>
              <Campo
                rotulo="Localização"
                name="cidade"
                required
                defaultValue={basicos.cidade}
              />
              <Campo rotulo="Descrição da campanha" className="campo--inteiro">
                <textarea
                  name="descricao"
                  required
                  rows={6}
                  maxLength={3000}
                  defaultValue={basicos.descricao}
                  placeholder="Conte a história, quem será beneficiado e como a doação será utilizada."
                />
              </Campo>
              <Campo rotulo="Início" name="inicio" type="date" required defaultValue={basicos.inicio} />
              <Campo
                rotulo="Encerramento"
                name="encerraEm"
                type="date"
                required
                defaultValue={basicos.encerraEm}
              />
              <Campo
                rotulo="Meta financeira (R$)"
                name="meta"
                type="number"
                required
                min="1"
                step="0.01"
                defaultValue={basicos.meta}
                placeholder="30000"
                ajuda="Você poderá ajustar a meta e listar itens na próxima etapa."
              />
              <div className="campo--inteiro">
                <Aviso>
                  A campanha ficará apenas nesta sessão de demonstração. O
                  envio de imagens e a publicação real dependem da integração.
                </Aviso>
              </div>
              {erro && (
                <div className="campo--inteiro">
                  <Aviso erro>{erro}</Aviso>
                </div>
              )}
              <div className="acoes campo--inteiro">
                <Botao para="/campanhas" secundario>
                  Cancelar
                </Botao>
                <Botao type="submit" secundario disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar rascunho'}
                </Botao>
                <Botao onClick={continuar} disabled={salvando}>
                  Continuar
                </Botao>
              </div>
            </form>
          </Secao>
        ) : etapa === 1 ? (
          <Secao
            titulo="Metas e necessidades"
            descricao="Defina quanto a campanha precisa arrecadar e quais itens podem ser doados."
          >
            <div className="form-grid">
              <Campo
                rotulo="Meta financeira (R$)"
                type="number"
                required
                min="1"
                step="0.01"
                value={basicos.meta}
                onChange={(e) => setBasicos({ ...basicos, meta: e.target.value })}
                className="campo--inteiro"
              />
            </div>
            <h3 className="subtitulo">Itens necessários</h3>
            {itens.length === 0 ? (
              <p className="lista-vazia">
                Nenhum item adicionado. Você pode publicar apenas com meta
                financeira.
              </p>
            ) : (
              <ul className="itens-campanha" aria-label="Itens necessários">
                {itens.map((item) => (
                  <li key={item.nome}>
                    <span>
                      <strong>{item.nome}</strong>
                      <small>Meta: {item.meta} unidades</small>
                    </span>
                    <button
                      type="button"
                      className="botao botao--secundario"
                      aria-label={`Remover ${item.nome}`}
                      onClick={() => setItens(itens.filter((i) => i.nome !== item.nome))}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={adicionarItem} className="novo-item">
              <Campo
                rotulo="Nome do item"
                value={novoItem.nome}
                onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                maxLength={60}
                placeholder="Ex.: Cesta básica"
              />
              <Campo
                rotulo="Quantidade"
                type="number"
                min="1"
                step="1"
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
              />
              <Botao type="submit" secundario>
                Adicionar item
              </Botao>
            </form>
            {erroItem && <Aviso erro>{erroItem}</Aviso>}
            {erro && <Aviso erro>{erro}</Aviso>}
            <div className="acoes">
              <Botao secundario onClick={() => { setErro(''); setEtapa(0) }}>
                Voltar
              </Botao>
              <Botao type="button" secundario onClick={() => salvar('Rascunho')} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar rascunho'}
              </Botao>
              <Botao onClick={continuar}>Continuar</Botao>
            </div>
          </Secao>
        ) : (
          <Secao
            titulo="Revisão e publicação"
            descricao="Escolha a imagem de capa, confira os dados e publique."
          >
            <fieldset className="imagens-campanha">
              <legend>Imagem de capa</legend>
              {IMAGENS_CAMPANHA.map((img) => (
                <label key={img.arquivo} className={imagem === img.arquivo ? 'selecionada' : ''}>
                  <input
                    type="radio"
                    name="imagem"
                    value={img.arquivo}
                    checked={imagem === img.arquivo}
                    onChange={() => setImagem(img.arquivo)}
                  />
                  <img src={img.arquivo} alt="" />
                  <span>{img.rotulo}</span>
                </label>
              ))}
            </fieldset>
            <small>O envio de imagens próprias depende da integração; por enquanto, escolha uma imagem de exemplo.</small>
            <dl className="revisao">
              <div><dt>Nome</dt><dd>{basicos.nome}</dd></div>
              <div><dt>Categoria</dt><dd>{basicos.categoria || 'Não informada'}</dd></div>
              <div><dt>Localização</dt><dd>{basicos.cidade}</dd></div>
              <div>
                <dt>Período</dt>
                <dd>{formatarData(basicos.inicio)} a {formatarData(basicos.encerraEm)}</dd>
              </div>
              <div><dt>Meta financeira</dt><dd>{formatarMoeda(Number(basicos.meta))}</dd></div>
              <div>
                <dt>Itens necessários</dt>
                <dd>
                  {itens.length === 0
                    ? 'Nenhum'
                    : itens.map((i) => `${i.meta} ${i.nome}`).join(', ')}
                </dd>
              </div>
            </dl>
            <label className="confirmacao">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
              />
              Confirmo que as informações estão corretas.
            </label>
            {erro && <Aviso erro>{erro}</Aviso>}
            <div className="acoes">
              <Botao secundario onClick={() => { setErro(''); setEtapa(1) }} disabled={salvando}>
                Voltar
              </Botao>
              <Botao type="button" secundario onClick={() => salvar('Rascunho')} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar rascunho'}
              </Botao>
              <Botao onClick={() => salvar('Ativa')} disabled={salvando}>
                {salvando ? 'Publicando…' : 'Publicar campanha'}
              </Botao>
            </div>
          </Secao>
        )}
        <Secao titulo="Uma boa campanha começa com uma boa história">
          <p>
            Seja claro sobre o objetivo e as pessoas que serão beneficiadas.
          </p>
          <ul className="lista-dicas">
            <li>Escolha um nome fácil de entender.</li>
            <li>Explique como os recursos serão utilizados.</li>
            <li>Informe o período da campanha.</li>
            <li>Mantenha as informações transparentes.</li>
          </ul>
        </Secao>
      </div>
    </>
  )
}
