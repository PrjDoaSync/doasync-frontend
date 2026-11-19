import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Ico } from '../components/IconesCampanha'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Icon, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { detalheCampanha } from '../mocks/campanhasDetalhe'
import { categorias } from '../mocks/gestao'
import { diasRestantes, validarEdicao } from '../utils/campanhas'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import '../styles/campanhas.css'

// [DEV-CAM-08] Editar campanha (#92). Persiste só na sessão de demonstração;
// na integração (#35) o salvamento vira PATCH /campanhas/{id}.
// SEM CONTRATO na API: categoria, metas por item, imagem de capa e última atualização.
export default function EditarCampanha() {
  const { id } = useParams()
  const { dados, atualizar } = useDemo()
  const campanha = dados.campanhas.find((c) => c.id === Number(id))
  const det = campanha ? detalheCampanha(campanha) : null
  const [form, setForm] = useState(() =>
    campanha && {
      nome: campanha.nome, descricao: campanha.descricao, categoria: campanha.categoria,
      encerraEm: campanha.encerraEm, meta: String(campanha.meta), itens: det.itens.map((i) => String(i.meta)),
    },
  )
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!campanha)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>Verifique o endereço ou volte para a lista de campanhas.</Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const editavel = campanha.status === 'Ativa'
  const pct = percentual(campanha.arrecadado, campanha.meta)
  const itensRec = det.itens.reduce((s, i) => s + i.recebido, 0)
  const itensMeta = det.itens.reduce((s, i) => s + i.meta, 0)
  const dias = diasRestantes(campanha.encerraEm)
  const ligar = (chave) => ({
    value: form[chave],
    onChange: (e) => setForm({ ...form, [chave]: e.target.value }),
    disabled: !editavel || salvando,
    'aria-invalid': !!erros[chave],
  })

  async function salvar(e) {
    e.preventDefault()
    if (salvando) return // evita submissão duplicada
    const novos = validarEdicao(form, campanha)
    det.itens.forEach((i, k) => {
      const meta = Number(String(form.itens[k]).replace(',', '.'))
      if (!(meta >= i.recebido && meta > 0)) novos[`item${k}`] = `A meta de ${i.nome} não pode ser menor que o recebido (${i.recebido}).`
    })
    setErros(novos)
    setResultado(null)
    if (Object.keys(novos).length) return
    setSalvando(true)
    try {
      await new Promise((r) => setTimeout(r, 400)) // latência simulada
      atualizar(
        'campanhas',
        dados.campanhas.map((c) =>
          c.id === campanha.id
            ? {
                ...c, nome: form.nome.trim(), descricao: form.descricao.trim(), categoria: form.categoria,
                encerraEm: form.encerraEm, meta: Number(String(form.meta).replace(',', '.')),
                itens: det.itens.map((i, k) => ({ ...i, meta: Number(String(form.itens[k]).replace(',', '.')) })),
              }
            : c,
        ),
      )
      setResultado({ erro: false, texto: 'Campanha atualizada nesta sessão de demonstração.' })
    } catch (err) {
      setResultado({ erro: true, texto: err?.message ?? 'Não foi possível salvar. Seus dados foram mantidos no formulário.' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="camp">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{campanha.nome.split(':')[0]}</span> / Editar
      </nav>
      <PageHeader titulo="Editar campanha" descricao="Atualize as informações de uma campanha já publicada.">
        <Botao para={`/campanhas/${campanha.id}`} secundario><Icon nome="externo" size={16} /> Ver campanha pública</Botao>
      </PageHeader>
      <Aviso>
        {editavel
          ? 'Esta campanha está ativa. As alterações serão exibidas na vitrine após o salvamento. Doações recebidas e histórico serão preservados.'
          : `Somente campanhas ativas podem ser editadas. Status atual: ${campanha.status}.`}
      </Aviso>

      <div className="camp-grid" style={{ marginTop: 20 }}>
        <form className="camp-card" onSubmit={salvar} noValidate>
          <div className="camp-cab"><h2>Informações da campanha</h2><StatusBadge valor={campanha.status} /></div>
          <p className="camp-sub">{campanha.nome.split(':')[0]} · Publicada em {formatarData(campanha.criadaEm)} · Os campos com * são obrigatórios.</p>
          <Campo rotulo="Título da campanha" required ajuda={erros.nome}><input {...ligar('nome')} /></Campo>
          <Campo rotulo="Descrição" required ajuda={erros.descricao}><textarea rows={4} {...ligar('descricao')} /></Campo>
          <div className="camp-campos">
            <Campo rotulo="Entidade responsável" ajuda="Não pode ser alterada após a publicação."><input value={campanha.entidade} disabled readOnly /></Campo>
            <Campo rotulo="Categoria" required>
              <select {...ligar('categoria')}>
                {[...new Set([campanha.categoria, ...categorias])].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Data de início" ajuda="Não pode ser alterada após a publicação."><input value={formatarData(campanha.criadaEm)} disabled readOnly /></Campo>
            <Campo rotulo="Data de término" required ajuda={erros.encerraEm}><input type="date" {...ligar('encerraEm')} /></Campo>
          </div>

          <hr className="camp-sep" />
          <h2>Meta financeira e itens</h2>
          <p className="camp-sub">Modalidade: dinheiro e itens · As metas não podem ser menores que o total recebido.</p>
          <Campo rotulo="Meta financeira (R$)" required ajuda={erros.meta ?? `${formatarMoeda(campanha.arrecadado)} já recebidos. O progresso será recalculado se a meta mudar.`}>
            <input inputMode="decimal" {...ligar('meta')} />
          </Campo>
          {det.itens.length > 0 && (
            <div>
              <div className="camp-itens__linha camp-itens__linha--cab"><span>Item e especificação</span><span>Meta</span><span>Recebidos</span></div>
              {det.itens.map((i, k) => (
                <div key={i.nome}>
                  <div className="camp-itens__linha">
                    <div><strong>{i.nome}</strong><br /><small className="camp-sub">{i.especificacao}</small></div>
                    <input
                      inputMode="numeric" aria-label={`Meta de ${i.nome}`} aria-invalid={!!erros[`item${k}`]}
                      value={form.itens[k]} disabled={!editavel || salvando}
                      onChange={(e) => setForm({ ...form, itens: form.itens.map((v, j) => (j === k ? e.target.value : v)) })}
                    />
                    <span className="camp-sub">{i.recebido} un.</span>
                  </div>
                  {erros[`item${k}`] && <small role="alert" className="camp-sub">{erros[`item${k}`]}</small>}
                </div>
              ))}
            </div>
          )}

          <hr className="camp-sep" />
          <div className="camp-cab">
            <h2>Imagem de capa</h2>
            <button type="button" className="camp-botao" disabled aria-disabled="true"><Ico nome="imagem" /> Alterar imagem</button>
          </div>
          {campanha.imagem ? <img className="camp-capa" src={campanha.imagem} alt="Capa atual da campanha" /> : <div className="camp-capa" />}
          <small className="camp-sub">{campanha.imagem?.split('/').pop() ?? 'sem imagem'} · Capa atual da campanha</small>

          {resultado && <Aviso erro={resultado.erro}>{resultado.texto}</Aviso>}
          <div className="camp-acoes">
            <Botao para="/campanhas" secundario>Cancelar</Botao>
            <Botao type="submit" disabled={!editavel || salvando}>{salvando ? 'Salvando…' : <><Icon nome="check" size={16} /> Salvar alterações</>}</Botao>
          </div>
        </form>

        <aside className="camp-aside">
          <div className="camp-card">
            <span><span className="badge badge--sucesso">{campanha.status} · publicada</span></span>
            <h2>{campanha.nome}</h2>
            <p className="camp-sub">{campanha.entidade} · {campanha.categoria}</p>
            <hr className="camp-sep" />
            <span className="rotulo-caps">Arrecadado até agora</span>
            <strong className="valor-grande">{formatarMoeda(campanha.arrecadado)}</strong>
            <div className="progresso" role="img" aria-label={`${pct}% da meta`}><div className="progresso__barra" style={{ width: `${pct}%` }} /></div>
            <span className="camp-link">{pct}% da meta de {formatarMoeda(campanha.meta)}</span>
            {itensMeta > 0 && <span className="camp-sub">{itensRec} de {itensMeta} itens recebidos</span>}
            <hr className="camp-sep" />
            <span className="rotulo-caps">Período da campanha</span>
            <strong>{formatarData(campanha.criadaEm)} a {formatarData(campanha.encerraEm)}</strong>
            {editavel && <span><span className="badge badge--alerta">{dias <= 14 ? 'Urgente · ' : ''}{dias} dias restantes</span></span>}
            <Botao para={`/campanhas/${campanha.id}/acompanhamento`} secundario><Icon nome="relatorios" size={16} /> Acompanhar campanha</Botao>
          </div>
          <p className="camp-nota"><Ico nome="info" /> A data de início e a entidade responsável não podem ser alteradas após a publicação. Itens com doações recebidas não podem ser removidos.</p>
          {det.ultima && (
            <div className="camp-card">
              <span className="rotulo-caps">Última atualização</span>
              <strong>{det.ultima.autor} · {det.ultima.quando}</strong>
              <span className="camp-sub">{det.ultima.texto}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
