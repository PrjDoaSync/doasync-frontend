import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Aviso, Botao, Campo, Secao, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { validarEdicao } from '../utils/campanhas'
import { formatarData, formatarMoeda, percentual } from '../utils/format'

// [DEV-CAM-08] Editar campanha (#92). Persiste só na sessão de demonstração;
// na integração (#35) o salvamento vira PATCH /campanhas/{id}.
// Sem contrato/dados ainda: categoria, itens necessários e imagem de capa.
export default function EditarCampanha() {
  const { id } = useParams()
  const { dados, atualizar } = useDemo()
  const campanha = dados.campanhas.find((c) => c.id === Number(id))
  const [form, setForm] = useState(() =>
    campanha
      ? { nome: campanha.nome, descricao: campanha.descricao, encerraEm: campanha.encerraEm, meta: String(campanha.meta) }
      : null,
  )
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!campanha)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>
          Verifique o endereço ou volte para a lista de campanhas.
        </Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const editavel = campanha.status === 'Ativa'
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
            ? { ...c, nome: form.nome.trim(), descricao: form.descricao.trim(), encerraEm: form.encerraEm, meta: Number(String(form.meta).replace(',', '.')) }
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
    <>
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{campanha.nome}</span> / Editar
      </nav>
      <PageHeader titulo="Editar campanha" descricao="Atualize as informações de uma campanha já publicada.">
        <Botao para={`/campanhas/${campanha.id}/acompanhamento`} secundario>Acompanhar campanha</Botao>
      </PageHeader>
      <Aviso>
        {editavel
          ? 'As alterações serão exibidas na vitrine após o salvamento. Doações recebidas e histórico são preservados.'
          : `Somente campanhas ativas podem ser editadas. Status atual: ${campanha.status}.`}
      </Aviso>
      <Secao titulo="Informações da campanha" descricao={`${campanha.entidade} · ${campanha.categoria}`}>
        <form onSubmit={salvar} className="form-grid" noValidate>
          <Campo rotulo="Título da campanha" required className="campo--inteiro" ajuda={erros.nome}>
            <input {...ligar('nome')} />
          </Campo>
          <Campo rotulo="Descrição" required className="campo--inteiro" ajuda={erros.descricao}>
            <textarea rows={4} {...ligar('descricao')} />
          </Campo>
          <Campo rotulo="Entidade responsável" ajuda="Não pode ser alterada após a publicação.">
            <input value={campanha.entidade} disabled readOnly />
          </Campo>
          <Campo rotulo="Data de início" ajuda="Não pode ser alterada após a publicação.">
            <input value={formatarData(campanha.criadaEm)} disabled readOnly />
          </Campo>
          <Campo rotulo="Data de término" required ajuda={erros.encerraEm}>
            <input type="date" {...ligar('encerraEm')} />
          </Campo>
          <Campo
            rotulo="Meta financeira (R$)"
            required
            ajuda={erros.meta ?? `${formatarMoeda(campanha.arrecadado)} já recebidos (${percentual(campanha.arrecadado, campanha.meta)}% da meta).`}
          >
            <input inputMode="decimal" {...ligar('meta')} />
          </Campo>
          {resultado && (
            <div className="campo--inteiro">
              <Aviso erro={resultado.erro}>{resultado.texto}</Aviso>
            </div>
          )}
          <div className="acoes campo--inteiro">
            <Botao para="/campanhas" secundario>Cancelar</Botao>
            <Botao type="submit" disabled={!editavel || salvando}>
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </Botao>
          </div>
        </form>
      </Secao>
    </>
  )
}
