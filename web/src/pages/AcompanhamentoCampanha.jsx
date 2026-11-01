import { Link, useParams } from 'react-router-dom'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Botao, Secao, Vazio } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { formatarData, formatarMoeda, percentual } from '../utils/format'

const LIMITE = 10
// [DEV-CAM-09] Acompanhamento da campanha (#93). Só doações confirmadas entram
// nos totais. Sem contrato/dados ainda: timeline, publicar atualização, famílias
// beneficiadas, progresso por item recebido e filtros por modalidade/período.
export default function AcompanhamentoCampanha() {
  const { id } = useParams()
  const { dados } = useDemo()
  const c = dados.campanhas.find((item) => item.id === Number(id))

  if (!c)
    return (
      <>
        <Vazio titulo="Campanha não encontrada" principal>
          Verifique o endereço ou volte para a lista de campanhas.
        </Vazio>
        <Botao para="/campanhas">Voltar para campanhas</Botao>
      </>
    )

  const daCampanha = dados.doacoes.filter((d) => d.campanhaId === c.id)
  const recebidas = daCampanha
    .filter((d) => d.status === 'Confirmada')
    .sort((a, b) => b.data.localeCompare(a.data))
  const pendentes = daCampanha.filter((d) => d.status === 'Pendente').length
  const pct = percentual(c.arrecadado, c.meta)
  const pctItens = percentual(c.itensRecebidos, c.itensMeta)

  const colunas = [
    { chave: 'doador', titulo: 'Doador' },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'detalhe', titulo: 'Contribuição', render: (d) => <strong>{d.detalhe}</strong> },
    { chave: 'data', titulo: 'Recebida em', render: (d) => formatarData(d.data) },
  ]

  return (
    <>
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/campanhas">Campanhas</Link> / <span>{c.nome}</span> / Acompanhamento
      </nav>
      <PageHeader titulo="Acompanhamento da campanha" descricao={c.nome}>
        {c.status === 'Ativa' && <Botao para={`/campanhas/${c.id}/editar`} secundario>Editar</Botao>}
        <Botao para={`/campanhas/${c.id}`} secundario>Ver campanha</Botao>
      </PageHeader>
      <p>
        <StatusBadge valor={c.status} /> Encerra em {formatarData(c.encerraEm)}
      </p>

      <section className="kpis">
        <KpiCard rotulo="Arrecadação financeira" valor={formatarMoeda(c.arrecadado)} detalhe={`${pct}% da meta de ${formatarMoeda(c.meta)}`} />
        <KpiCard rotulo="Itens recebidos" valor={`${c.itensRecebidos} de ${c.itensMeta}`} detalhe={`${pctItens}% da meta de itens`} />
        <KpiCard rotulo="Doações confirmadas" valor={String(recebidas.length)} detalhe={`${pendentes} pendente(s) fora dos totais`} />
      </section>

      <Secao titulo="Doações recebidas" descricao="Contribuições confirmadas nesta campanha.">
        <DataTable colunas={colunas} linhas={recebidas.slice(0, LIMITE)} vazio="Nenhuma doação confirmada ainda." />
        {recebidas.length > 0 && (
          <small>Mostrando {Math.min(LIMITE, recebidas.length)} de {recebidas.length} doações confirmadas.</small>
        )}
      </Secao>

      <Secao titulo="Itens necessários" descricao="Metas por item. Recursos financeiros e itens têm metas independentes.">
        <DataTable
          colunas={[{ chave: 'nome', titulo: 'Item' }, { chave: 'meta', titulo: 'Meta (un.)' }]}
          linhas={c.necessidades.map((n) => ({ id: n.nome, ...n }))}
          vazio="Esta campanha não possui itens necessários cadastrados."
        />
      </Secao>
    </>
  )
}
