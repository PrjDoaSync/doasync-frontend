import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Campo, Secao, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { formatarData, formatarMoeda, percentual } from '../utils/format'
import { checklist, paraNumero, prestacaoInicial, totalAplicado, validarDespesa } from '../utils/prestacao'

// [DEV-CAM-10] Encerramento e prestação de contas (#94). Persiste só na sessão
// de demonstração (dentro da campanha). SEM CONTRATO na API: despesas, relato,
// comprovantes (upload) e publicação. Anexos guardam só nome e tamanho, sem envio.
export default function PrestacaoContas() {
  const { id } = useParams()
  const { dados, atualizar } = useDemo()
  const campanha = dados.campanhas.find((c) => c.id === Number(id))
  const [prestacao, setPrestacao] = useState(() => campanha?.prestacao ?? prestacaoInicial())
  const [despesa, setDespesa] = useState({ descricao: '', valor: '', comprovante: '' })
  const [erros, setErros] = useState({})
  const [declaracao, setDeclaracao] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!campanha)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>Verifique o endereço ou volte para a lista de campanhas.</Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const encerrada = campanha.status === 'Encerrada'
  const bloqueada = !encerrada || prestacao.publicada
  const aplicado = totalAplicado(prestacao.despesas)
  const saldo = campanha.arrecadado - aplicado
  const itens = checklist(prestacao, declaracao)
  const pronta = itens.every((i) => i.ok)

  function persistir(proxima, texto) {
    setPrestacao(proxima)
    atualizar('campanhas', dados.campanhas.map((c) => (c.id === campanha.id ? { ...c, prestacao: proxima } : c)))
    setResultado({ erro: false, texto })
  }

  function adicionarDespesa(e) {
    e.preventDefault()
    const novos = validarDespesa(despesa, campanha, prestacao.despesas)
    setErros(novos)
    if (Object.keys(novos).length) return
    const nova = { id: Date.now(), descricao: despesa.descricao.trim(), valor: paraNumero(despesa.valor), comprovante: despesa.comprovante.trim() || '—' }
    persistir({ ...prestacao, despesas: [...prestacao.despesas, nova] }, 'Despesa adicionada.')
    setDespesa({ descricao: '', valor: '', comprovante: '' })
  }

  function anexar(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    const anexo = { id: Date.now(), nome: arquivo.name, tamanhoKb: Math.max(1, Math.round(arquivo.size / 1024)) }
    persistir({ ...prestacao, anexos: [...prestacao.anexos, anexo] }, `Comprovante ${arquivo.name} anexado.`)
    e.target.value = ''
  }

  const colunas = [
    { chave: 'descricao', titulo: 'Aplicação dos recursos' },
    { chave: 'valor', titulo: 'Valor aplicado', render: (d) => <strong>{formatarMoeda(d.valor)}</strong> },
    { chave: 'comprovante', titulo: 'Comprovante' },
  ]

  return (
    <>
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{campanha.nome}</span> / Prestação de contas
      </nav>
      <PageHeader titulo="Encerramento e prestação de contas" descricao={`${campanha.nome} · Mostre como cada contribuição foi aplicada.`}>
        <Botao para={`/campanhas/${campanha.id}`} secundario>Ver campanha pública</Botao>
      </PageHeader>
      <p>
        <StatusBadge valor={campanha.status} /> {encerrada ? `Encerrada em ${formatarData(campanha.encerraEm)}` : ''}
        {prestacao.publicada && ' · Prestação de contas publicada'}
      </p>
      {!encerrada ? (
        <Aviso>A prestação de contas só está disponível para campanhas encerradas. Status atual: {campanha.status}.</Aviso>
      ) : prestacao.publicada ? (
        <Aviso>Prestação de contas publicada. O relatório ficou visível na campanha e não pode mais ser alterado.</Aviso>
      ) : (
        <Aviso>A campanha não recebe mais doações. Revise o relatório e os comprovantes para publicar a prestação de contas.</Aviso>
      )}

      <section className="kpis">
        <KpiCard rotulo="Total arrecadado" valor={formatarMoeda(campanha.arrecadado)} detalhe={`${percentual(campanha.arrecadado, campanha.meta)}% da meta de ${formatarMoeda(campanha.meta)}`} />
        <KpiCard rotulo="Recursos aplicados" valor={formatarMoeda(aplicado)} detalhe={`${percentual(aplicado, campanha.arrecadado)}% do valor arrecadado`} />
        <KpiCard rotulo="Saldo restante" valor={formatarMoeda(saldo)} detalhe={saldo === 0 ? 'Não há recursos pendentes de aplicação' : 'Recursos ainda sem aplicação registrada'} />
      </section>

      <Secao titulo="Como os recursos foram aplicados" descricao="Despesas vinculadas exclusivamente a esta campanha.">
        <DataTable colunas={colunas} linhas={prestacao.despesas} vazio="Nenhuma despesa registrada ainda." />
        {!bloqueada && (
          <form onSubmit={adicionarDespesa} className="form-grid" noValidate>
            <Campo rotulo="Descrição da despesa" required ajuda={erros.descricao}>
              <input value={despesa.descricao} aria-invalid={!!erros.descricao} onChange={(e) => setDespesa({ ...despesa, descricao: e.target.value })} />
            </Campo>
            <Campo rotulo="Valor (R$)" required ajuda={erros.valor}>
              <input inputMode="decimal" value={despesa.valor} aria-invalid={!!erros.valor} onChange={(e) => setDespesa({ ...despesa, valor: e.target.value })} />
            </Campo>
            <Campo rotulo="Nº do comprovante" ajuda="Ex.: NF 0821">
              <input value={despesa.comprovante} onChange={(e) => setDespesa({ ...despesa, comprovante: e.target.value })} />
            </Campo>
            <div className="acoes campo--inteiro"><Botao type="submit" secundario>Adicionar despesa</Botao></div>
          </form>
        )}
      </Secao>

      <Secao titulo="Resultados e impacto">
        <Campo rotulo="Relato de aplicação dos recursos" required className="campo--inteiro">
          <textarea rows={4} value={prestacao.relato} disabled={bloqueada} onChange={(e) => setPrestacao({ ...prestacao, relato: e.target.value })} />
        </Campo>
      </Secao>

      <Secao titulo="Comprovantes anexados" descricao="Os comprovantes serão disponibilizados junto ao relatório público.">
        <DataTable
          colunas={[{ chave: 'nome', titulo: 'Arquivo' }, { chave: 'tamanhoKb', titulo: 'Tamanho', render: (a) => `${a.tamanhoKb} KB` }]}
          linhas={prestacao.anexos}
          vazio="Nenhum comprovante anexado ainda."
        />
        {!bloqueada && (
          <Campo rotulo="Anexar documento" ajuda="PDF, JPG ou PNG. Na demonstração o arquivo não é enviado.">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={anexar} />
          </Campo>
        )}
      </Secao>

      <Secao titulo="Pronto para prestar contas">
        <ul>
          {itens.map((i) => (
            <li key={i.chave}>{i.ok ? '✓' : '○'} {i.texto}</li>
          ))}
        </ul>
        {!bloqueada && (
          <>
            <label>
              <input type="checkbox" checked={declaracao} onChange={(e) => setDeclaracao(e.target.checked)} />{' '}
              Declaro que o relatório e os comprovantes refletem a aplicação dos recursos recebidos.
            </label>
            <div className="acoes">
              <Botao secundario onClick={() => persistir(prestacao, 'Relatório salvo nesta sessão de demonstração.')}>Salvar relatório</Botao>
              <Botao disabled={!pronta} onClick={() => persistir({ ...prestacao, publicada: true }, 'Prestação de contas publicada.')}>
                Publicar prestação de contas
              </Botao>
            </div>
            <small>Ao publicar, o relatório ficará visível na campanha e os doadores serão notificados.</small>
          </>
        )}
        {resultado && <Aviso erro={resultado.erro}>{resultado.texto}</Aviso>}
      </Secao>
    </>
  )
}
