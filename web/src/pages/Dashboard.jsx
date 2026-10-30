import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Grafico from '../components/Grafico'
import { Aviso, Botao, Campo, Icon, Secao, Vazio } from '../components/Ui'
import { Progresso } from '../components/CampanhaCard'
import {
  calcularIndicadores,
  filtrarRegistros,
  validarPeriodo,
} from '../utils/gestao'
import { formatarMoeda, percentual } from '../utils/format'

export default function Dashboard({ analitico = false }) {
  const { dados } = useDemo(),
    [params, setParams] = useSearchParams()
  const [inicio, setInicio] = useState(''),
    [fim, setFim] = useState('')
  const campanhasEntidade = dados.campanhas.filter(
    (c) => c.entidadeId === dados.entidade.id,
  )
  const campanhaId =
    params.get('campanha') ?? String(campanhasEntidade[0]?.id ?? '')
  const campanha = campanhasEntidade.find((c) => String(c.id) === campanhaId)
  const erro = validarPeriodo(inicio, fim)
  const doacoes = erro
    ? []
    : filtrarRegistros(dados.doacoes, {
        inicio,
        fim,
        entidadeId: dados.entidade.id,
        campanhaId: analitico ? campanhaId : '',
      })
  const campanhas = analitico
    ? campanhasEntidade.filter((c) => String(c.id) === campanhaId)
    : campanhasEntidade
  const indicadores = calcularIndicadores(campanhas, doacoes)
  return (
    <>
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        {analitico ? 'Análise por campanha' : 'Visão geral'}
      </div>
      <PageHeader
        titulo={
          analitico
            ? 'Análise por campanha'
            : `Visão geral da ${dados.entidade.nome}`
        }
        descricao={
          analitico
            ? 'Entenda a evolução da arrecadação e dos itens recebidos no período selecionado.'
            : 'Um panorama das campanhas e do impacto que construímos juntos.'
        }
      >
        {!analitico && (
          <Botao para="/relatorios" secundario>
            <Icon nome="download" />
            Ver relatórios
          </Botao>
        )}
      </PageHeader>
      <div className="filtros-dashboard">
        {analitico && (
          <Campo rotulo="Campanha">
            <select
              value={campanhaId}
              onChange={(e) => setParams({ campanha: e.target.value })}
            >
              {campanhasEntidade.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Campo>
        )}
        <Campo
          rotulo="Data inicial"
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
        />
        <Campo
          rotulo="Data final"
          type="date"
          value={fim}
          min={inicio || undefined}
          onChange={(e) => setFim(e.target.value)}
        />
        <Botao
          secundario
          onClick={() => {
            setInicio('')
            setFim('')
          }}
        >
          Todo o período
        </Botao>
      </div>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="atualizacao">
        <span />
        Dados da amostra ·{' '}
        {inicio || fim ? 'Período selecionado' : 'Todo o período'}
      </div>
      <section className="kpis">
        <KpiCard
          rotulo="Arrecadação financeira"
          valor={formatarMoeda(indicadores.arrecadado)}
          detalhe="Somente pagamentos confirmados"
        />
        <KpiCard
          rotulo="Doadores"
          valor={indicadores.doadores}
          detalhe="Pessoas e organizações com doações confirmadas"
        />
        {analitico ? (
          <>
            <KpiCard
              rotulo="Itens recebidos"
              valor={`${indicadores.itens} unidades`}
              detalhe="Doações de itens confirmadas"
            />
            <KpiCard
              rotulo="Situação da campanha"
              valor={campanha?.status ?? '—'}
              detalhe={campanha?.categoria}
            />
          </>
        ) : (
          <>
            <KpiCard
              rotulo="Campanhas ativas"
              valor={indicadores.ativas}
              detalhe={`${campanhas.length} campanhas cadastradas`}
            />
            <KpiCard
              rotulo="Taxa de conclusão"
              valor={`${indicadores.concluidas}%`}
              detalhe="Campanhas encerradas / total cadastrado"
            />
          </>
        )}
      </section>
      {analitico && !campanha ? (
        <Vazio titulo="Campanha não encontrada" />
      ) : (
        <>
          <div className="dashboard-grid">
            <Secao
              titulo={
                analitico ? 'Evolução financeira' : 'Arrecadação no período'
              }
              descricao="Evolução acumulada de pagamentos confirmados"
            >
              <strong className="numero-destaque">
                {formatarMoeda(indicadores.arrecadado)}
              </strong>
              <Grafico doacoes={doacoes} />
            </Secao>
            <Secao
              titulo={
                analitico ? 'Progresso da campanha' : 'O que precisa de atenção'
              }
            >
              {analitico ? (
                <>
                  <Progresso atual={campanha.arrecadado} meta={campanha.meta} />
                  <p>A meta considera o histórico completo da campanha.</p>
                  <Botao para={`/campanhas/${campanha.id}`} secundario>
                    Ver campanha <Icon nome="externo" />
                  </Botao>
                </>
              ) : (
                <>
                  {campanhasEntidade.some((c) => c.status === 'Ativa') ? (
                    <>
                      <span className="badge badge--alerta">
                        Campanhas em andamento
                      </span>
                      <h3>
                        {
                          campanhasEntidade.find((c) => c.status === 'Ativa')
                            .nome
                        }
                      </h3>
                      <p>Acompanhe as metas e as contribuições recebidas.</p>
                      <Botao
                        para={`/dashboard/campanha?campanha=${campanhasEntidade.find((c) => c.status === 'Ativa').id}`}
                      >
                        <Icon nome="relatorios" />
                        Analisar campanha
                      </Botao>
                    </>
                  ) : (
                    <p>Nenhuma campanha ativa no momento.</p>
                  )}
                  <hr />
                  <p>
                    {
                      campanhasEntidade.filter((c) => c.status === 'Rascunho')
                        .length
                    }{' '}
                    campanha(s) em rascunho.
                  </p>
                  <Link className="link-azul" to="/campanhas">
                    Ver minhas campanhas →
                  </Link>
                </>
              )}
            </Secao>
          </div>
          {analitico && (
            <div className="dashboard-grid">
              <Secao
                titulo="Evolução de itens"
                descricao="Recebimentos confirmados no período selecionado."
              >
                <Grafico doacoes={doacoes} medida="itens" id="itens-campanha" />
              </Secao>
              <Secao
                titulo="Progresso por item"
                descricao="Metas da campanha e recebimentos do período."
              >
                {campanha.necessidades?.length ? (
                  campanha.necessidades.map((item) => {
                    const recebido = doacoes
                      .filter((d) => d.status === 'Confirmada')
                      .flatMap((d) => d.itens ?? [])
                      .filter((i) => i.nome === item.nome)
                      .reduce((s, i) => s + i.quantidade, 0)
                    return (
                      <div className="progresso-item" key={item.nome}>
                        <div className="lista-linha">
                          <strong>{item.nome}</strong>
                          <small>
                            {recebido} de {item.meta}
                          </small>
                        </div>
                        <div
                          className="progresso"
                          role="progressbar"
                          aria-label={item.nome}
                          aria-valuenow={Math.min(recebido, item.meta)}
                          aria-valuemin={0}
                          aria-valuemax={item.meta}
                        >
                          <div
                            className="progresso__barra"
                            style={{
                              width: `${percentual(recebido, item.meta)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p>Nenhuma meta de itens informada para esta campanha.</p>
                )}
              </Secao>
            </div>
          )}
          <Secao
            titulo={
              analitico ? 'Contribuições da campanha' : 'Campanhas da entidade'
            }
            descricao={
              analitico
                ? 'Registros correspondentes ao período selecionado.'
                : 'O progresso considera o histórico completo de cada campanha.'
            }
          >
            {analitico ? (
              <DataTable
                linhas={doacoes}
                colunas={[
                  { chave: 'doador', titulo: 'Doador' },
                  { chave: 'detalhe', titulo: 'Contribuição' },
                  { chave: 'data', titulo: 'Data' },
                  {
                    chave: 'status',
                    titulo: 'Status',
                    render: (d) => <StatusBadge valor={d.status} />,
                  },
                ]}
              />
            ) : (
              <DataTable
                linhas={campanhas}
                colunas={[
                  {
                    chave: 'nome',
                    titulo: 'Campanha',
                    render: (c) => (
                      <Link to={`/dashboard/campanha?campanha=${c.id}`}>
                        {c.nome}
                      </Link>
                    ),
                  },
                  {
                    chave: 'meta',
                    titulo: 'Arrecadado / meta',
                    render: (c) => (
                      <Progresso atual={c.arrecadado} meta={c.meta} />
                    ),
                  },
                  {
                    chave: 'status',
                    titulo: 'Status',
                    render: (c) => <StatusBadge valor={c.status} />,
                  },
                ]}
              />
            )}
          </Secao>
        </>
      )}
      <Aviso>
        Os indicadores refletem somente a amostra de demonstração. Registros
        pendentes ou cancelados não entram na arrecadação confirmada.
      </Aviso>
    </>
  )
}
