import { useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import RequestState from '../components/RequestState'
import SeletorEntidade from '../components/SeletorEntidade'
import StatusBadge from '../components/StatusBadge'
import { Aviso, Botao, Secao } from '../components/Ui'
import { useEntidadeGestao } from '../hooks/useEntidadeGestao'
import { useRequest } from '../hooks/useRequest'
import { doacoesService } from '../services/doacoesService'
import { formatarData, formatarMoeda } from '../utils/format'
import { agruparDoadores } from '../utils/gestao'

// [DEV-GES-06] Doadores e histórico (#110). Não há rota de doadores no MVP (contrato: fora do
// MVP); a lista é derivada de GET /entidades/{id}/doacoes. Doações anônimas não identificam o
// doador para a entidade (LGPD) e aparecem só no total.
export default function Doadores() {
  const { admin, entidadeId, escolher } = useEntidadeGestao()
  return (
    <div className="ges-doadores pilha">
      <div className="breadcrumb">
        Doadores <span>/</span> Relacionamento
      </div>
      <PageHeader titulo="Doadores e histórico" descricao="Conheça as pessoas e organizações que apoiam a entidade." />
      {admin && <SeletorEntidade valor={entidadeId} onChange={escolher} />}
      {entidadeId ? <Relacionamento key={entidadeId} entidadeId={entidadeId} /> : <Aviso>Escolha uma entidade para ver os doadores.</Aviso>}
    </div>
  )
}

function Relacionamento({ entidadeId }) {
  const request = useRequest((config) => doacoesService.recebidas(entidadeId, {}, config), [entidadeId])
  return <RequestState {...request}>{(doacoes) => <Lista doacoes={doacoes} />}</RequestState>
}

function Lista({ doacoes }) {
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const doadores = useMemo(() => agruparDoadores(doacoes), [doacoes])
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrados = doadores.filter((d) => !termo || d.nome.toLocaleLowerCase('pt-BR').includes(termo))
  const anonimas = doacoes.filter((d) => d.anonima || !d.doadorId).length

  return (
    <>
      <section className="kpis" aria-label="Resumo do relacionamento">
        <KpiCard icone="doadores" rotulo="Doadores identificados" valor={doadores.length} />
        <KpiCard icone="doacoes" rotulo="Doações anônimas" valor={anonimas} detalhe="O doador não é identificado para a entidade" />
        <KpiCard
          icone="carteira"
          rotulo="Financeiro confirmado"
          valor={formatarMoeda(doacoes.filter((d) => d.status === 'Confirmada').reduce((s, d) => s + d.valor, 0))}
          detalhe="Inclui doações anônimas"
        />
      </section>
      <div className={selecionado ? 'dashboard-grid' : ''}>
        <Secao titulo="Doadores da entidade">
          <Filtros busca={busca} onBusca={setBusca} placeholder="Buscar doador pelo nome" />
          <DataTable
            nome="Doadores da entidade"
            linhas={filtrados}
            vazio={doadores.length ? 'Nenhum doador encontrado com esse nome.' : 'Nenhum doador identificado ainda.'}
            colunas={[
              {
                chave: 'nome',
                titulo: 'Doador',
                render: (d) => (
                  <>
                    <span className="ges-avatar" aria-hidden="true" data-iniciais={d.nome.split(' ').slice(0, 2).map((p) => p[0]).join('')} />
                    <strong>{d.nome}</strong>
                  </>
                ),
              },
              { chave: 'quantidade', titulo: 'Contribuições' },
              { chave: 'total', titulo: 'Financeiro confirmado', render: (d) => formatarMoeda(d.total) },
              { chave: 'ultima', titulo: 'Última contribuição', render: (d) => (d.ultima ? formatarData(d.ultima) : '—') },
              {
                chave: 'acao',
                titulo: 'Histórico',
                render: (d) => (
                  <button type="button" className="link-botao" onClick={() => setSelecionado(d)} aria-label={`Ver histórico de ${d.nome}`}>
                    Ver histórico
                  </button>
                ),
              },
            ]}
          />
        </Secao>
        {selecionado && (
          <Secao titulo="Perfil do doador" descricao={selecionado.nome} acao={<Botao secundario onClick={() => setSelecionado(null)}>Fechar</Botao>}>
            {selecionado.doacoes.map((d) => (
              <div className="historico-item" key={d.id}>
                <small>{formatarData(String(d.data).slice(0, 10))}</small>
                <strong>{formatarMoeda(d.valor)} · {d.formaPagamento}</strong>
                <p>{d.campanha || 'Doação direta à entidade'}</p>
                <StatusBadge valor={d.status} />
              </div>
            ))}
          </Secao>
        )}
      </div>
    </>
  )
}
