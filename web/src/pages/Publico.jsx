import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CampanhaCard, { Progresso } from '../components/CampanhaCard'
import { Aviso, Botao, Campo, Icon, Vazio } from '../components/Ui'
import { formatarData, formatarMoeda } from '../utils/format'
import { useCampanhaPublica, useCampanhasPublicas } from '../hooks/useCampanhasPublicas'
import RequestState from '../components/RequestState'
import '../styles/cam-publico.css'

const hojeISO = () => new Date().toISOString().slice(0, 10)

export function Home() {
  const request = useCampanhasPublicas()
  return <RequestState {...request}>{(campanhas) => <HomeConteudo campanhas={campanhas} />}</RequestState>
}

function HomeConteudo({ campanhas }) {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const destaques = campanhas
    .filter((c) => c.status === 'Ativa')
    .slice(0, 3)
  return (
    <div className="cam-publico cam-home">
      <section className="public-intro">
        <div>
        <h1>Encontre uma causa. Faça a diferença.</h1>
        <p>
          Apoie campanhas e entidades com doações financeiras.
        </p>
        </div>
        <form className="cam-busca" onSubmit={(event) => {
          event.preventDefault()
          const params = new URLSearchParams()
          if (busca.trim()) params.set('busca', busca.trim())
          navigate(`/explorar${params.size ? `?${params}` : ''}`)
        }}>
          <Icon nome="busca" />
          <input name="busca" type="search" aria-label="Buscar uma campanha ou entidade" placeholder="Busque uma campanha ou entidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <button type="submit" aria-label="Explorar campanhas"><Icon nome="seta" /></button>
        </form>
      </section>
      {destaques[0] && (
        <section className="destaque">
          <img src={destaques[0].imagem} alt="Alimentos destinados à doação" />
          <div className="destaque__conteudo">
            <span className="badge">Campanha em destaque</span>
            <h2>{destaques[0].nome}</h2>
            <p>{destaques[0].descricao}</p>
            <Progresso
              atual={destaques[0].arrecadado}
              meta={destaques[0].meta}
            />
            <Botao para={`/campanhas/${destaques[0].id}`}>
              Conhecer e doar <Icon nome="seta" />
            </Botao>
          </div>
        </section>
      )}
      <section className="public-section">
        <div className="secao__cabecalho">
          <div>
            <h2>Mais causas para apoiar</h2>
          </div>
          <Link className="link-azul" to="/explorar">
            Ver todas as campanhas →
          </Link>
        </div>
        <div className="cards-grid">
          {destaques.map((c) => (
            <CampanhaCard key={c.id} campanha={c} />
          ))}
        </div>
      </section>
      <details className="como-ajudar">
        <summary>Como ajudar</summary>
        <h2>Fazer o bem é mais simples do que parece</h2>
        <div className="tres-colunas">
          {[
            [
              '01',
              'Encontre uma causa',
              'Escolha uma campanha com a qual você se identifica.',
            ],
            [
              '02',
              'Escolha como ajudar',
              'Contribua com uma doação financeira ou com itens.',
            ],
            [
              '03',
              'Acompanhe o impacto',
              'Consulte as informações e atualizações da campanha.',
            ],
          ].map(([numero, titulo, texto]) => (
            <div key={numero}>
              <span>{numero}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

export function Explorar() {
  const request = useCampanhasPublicas()
  return <RequestState {...request}>{(campanhas) => <ExplorarConteudo todas={campanhas} />}</RequestState>
}

// Ordem "recentes": ids numéricos na demonstração; UUIDs da API ordenam pela data de criação.
function maisRecentePrimeiro(a, b) {
  if (typeof a.id === 'number' && typeof b.id === 'number') return b.id - a.id
  return (b.criadaEm ?? '').localeCompare(a.criadaEm ?? '')
}

function ExplorarConteudo({ todas }) {
  const [params, setParams] = useSearchParams(),
    [pagina, setPagina] = useState(1)
  const busca = params.get('busca') ?? '',
    categoria = params.get('categoria') ?? '',
    cidade = params.get('cidade') ?? '',
    entidade = params.get('entidade') ?? '',
    status = params.get('status') ?? 'Ativa',
    urgencia = params.get('urgencia') ?? '',
    ordem = params.get('ordem') ?? 'recentes'
  function filtrar(chave, valor) {
    const nova = new URLSearchParams(params)
    if (valor) nova.set(chave, valor)
    else nova.delete(chave)
    setParams(nova)
    setPagina(1)
  }
  const HOJE = hojeISO()
  const cidades = [...new Set(todas.map((c) => c.cidade).filter(Boolean))]
  const campanhas = useMemo(
    () =>
      todas
        .filter(
          (c) =>
            ['Ativa', 'Encerrada'].includes(c.status) &&
            (!status || c.status === status) &&
            (!entidade || c.entidade === entidade) &&
            (!urgencia || (c.status === 'Ativa' && c.encerraEm >= HOJE && (Date.parse(c.encerraEm) - Date.parse(HOJE)) / 86400000 <= 14)) &&
            (!categoria || c.categoria === categoria) &&
            (!cidade || c.cidade === cidade) &&
            `${c.nome} ${c.entidade}`
              .toLowerCase()
              .includes(busca.trim().toLowerCase()),
        )
        .sort((a, b) =>
          ordem === 'meta'
            ? b.arrecadado / b.meta - a.arrecadado / a.meta
            : maisRecentePrimeiro(a, b),
        ),
    [todas, busca, categoria, cidade, entidade, status, urgencia, ordem, HOJE],
  )
  return (
    <section className="public-section cam-publico cam-explorar">
      <div className="breadcrumb">
        <Link to="/">Início</Link>
        <span>/</span>Explorar campanhas
      </div>
      <div className="public-page-title">
        <h1>Campanhas para transformar realidades</h1>
        <p>Encontre uma causa por entidade, categoria{cidades.length > 0 && ' ou localização'}.</p>
      </div>
      <div className="cartao filtros-publicos">
        <Campo rotulo="Buscar campanha">
          <div className="busca-com-icone">
            <Icon nome="busca" />
            <input
              type="search"
              value={busca}
              onChange={(e) => filtrar('busca', e.target.value)}
              placeholder="Campanha ou entidade"
              aria-label="Buscar campanha"
            />
          </div>
        </Campo>
        <Campo rotulo="Entidade">
          <select value={entidade} onChange={(e) => filtrar('entidade', e.target.value)}>
            <option value="">Todas as entidades</option>
            {[...new Set(todas.filter((c) => c.status !== 'Rascunho').map((c) => c.entidade))].map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Status da campanha">
          <select value={status} onChange={(e) => filtrar('status', e.target.value)}>
            <option value="Ativa">Ativas</option>
            <option value="Encerrada">Encerradas</option>
          </select>
        </Campo>
        <Campo rotulo="Prazo da campanha">
          <select value={urgencia} onChange={(e) => filtrar('urgencia', e.target.value)}>
            <option value="">Qualquer prazo</option>
            <option value="14">Encerra em até 14 dias</option>
          </select>
        </Campo>
        <Campo rotulo="Categoria">
          <select
            value={categoria}
            onChange={(e) => filtrar('categoria', e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {[...new Set(todas.map((c) => c.categoria).filter(Boolean))].sort().map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Campo>
        {/* A API ainda não informa a cidade da campanha: o filtro só aparece quando houver dados. */}
        {cidades.length > 0 && (
          <Campo rotulo="Localização">
            <select
              value={cidade}
              onChange={(e) => filtrar('cidade', e.target.value)}
            >
              <option value="">Todas as cidades</option>
              {cidades.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Campo>
        )}
        <Botao
          secundario
          onClick={() => {
            setParams({})
            setPagina(1)
          }}
        >
          Limpar filtros
        </Botao>
      </div>
      <div className="secao__cabecalho resultados">
        <p role="status">
          <strong>{campanhas.length}</strong> campanhas encontradas
        </p>
        <label>
          Ordenar por{' '}
          <select
            value={ordem}
            onChange={(e) => filtrar('ordem', e.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="meta">Mais próximas da meta</option>
          </select>
        </label>
      </div>
      {campanhas.length ? (
        <>
          <div className="cards-grid">
            {campanhas.slice((pagina - 1) * 6, pagina * 6).map((c) => (
              <CampanhaCard key={c.id} campanha={c} />
            ))}
          </div>
          <div className="paginacao">
            <Botao
              secundario
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </Botao>
            <span>
              Página {pagina} de {Math.ceil(campanhas.length / 6)}
            </span>
            <Botao
              secundario
              disabled={pagina * 6 >= campanhas.length}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </Botao>
          </div>
        </>
      ) : (
        <Vazio />
      )}
    </section>
  )
}

export function DetalheCampanha() {
  const { id } = useParams()
  const request = useCampanhaPublica(id)
  if (!request.loading && !request.error && !request.data)
    return (
      <Vazio principal titulo="Campanha não encontrada">
        <Link to="/explorar">Voltar para as campanhas</Link>
      </Vazio>
    )
  return (
    <RequestState {...request}>
      {(campanha) => <DetalheConteudo key={campanha.id} campanha={campanha} />}
    </RequestState>
  )
}

function DetalheConteudo({ campanha }) {
  const [params] = useSearchParams(),
    [aba, setAba] = useState(
      params.get('aba') === 'itens' ? 'Itens necessários' : 'Sobre a campanha',
    )
  const abas = ['Sobre a campanha', 'Itens necessários', 'Atualizações']
  return (
    <section className="public-section cam-publico cam-detalhe">
      <div className="breadcrumb">
        <Link to="/explorar">Campanhas</Link>
        <span>/</span>
        {campanha.categoria || campanha.nome}
      </div>
      {campanha.categoria && <span className="badge badge--sucesso">{campanha.categoria}</span>}
      <div className="public-page-title">
        <h1>{campanha.nome}</h1>
        <p>
          Uma iniciativa de <strong>{campanha.entidade}</strong>
          {campanha.cidade && <> · {campanha.cidade}</>}
        </p>
      </div>
      <div className="detalhe-grid">
        <div>
          <img
            className="campanha-capa"
            src={campanha.imagem}
            alt="Doações que apoiam a comunidade"
          />
          {campanha.galeria?.length > 0 && <div className="galeria-campanha">{campanha.galeria.map((foto, indice) => <figure key={`${foto.nome}-${indice}`}><img src={foto.url} alt={foto.nome} /><figcaption>{foto.nome}</figcaption></figure>)}</div>}
          <div
            className="abas"
            role="tablist"
            aria-label="Informações da campanha"
          >
            {abas.map((a, i) => (
              <button
                key={a}
                role="tab"
                id={`aba-${i}`}
                aria-controls="painel-campanha"
                aria-selected={a === aba}
                tabIndex={a === aba ? 0 : -1}
                onClick={() => setAba(a)}
                onKeyDown={(e) => {
                  if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
                    e.preventDefault()
                    const indice = (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3
                    setAba(abas[indice])
                    document.getElementById(`aba-${indice}`)?.focus()
                  }
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <div
            className="detalhe-texto"
            role="tabpanel"
            tabIndex={0}
            id="painel-campanha"
            aria-labelledby={`aba-${abas.indexOf(aba)}`}
          >
            {aba === abas[0] ? (
              <>
                <h2>Juntos, podemos ir mais longe</h2>
                <p>{campanha.descricao}</p>
                <p>
                  Acompanhe o objetivo e o progresso da arrecadação. Cada
                  contribuição conta para que essa iniciativa alcance mais
                  pessoas.
                </p>
                <h3>Como sua doação ajuda</h3>
                <p>
                  As doações são destinadas à campanha, conforme as necessidades
                  informadas pela entidade responsável.
                </p>
              </>
            ) : aba === abas[1] ? (
              <>
                <h2>Necessidades da campanha</h2>
                {campanha.necessidades?.length ? (
                  campanha.necessidades.map((item) => (
                    <div className="lista-linha" key={item.nome}>
                      <span>{item.nome}</span>
                      <span>Meta: {item.meta} unidades</span>
                    </div>
                  ))
                ) : (
                  <p>
                    A entidade ainda não informou as necessidades de itens desta
                    campanha.
                  </p>
                )}
              </>
            ) : (
              <Vazio titulo="Nenhuma atualização publicada">
                As novidades da campanha aparecerão aqui.
              </Vazio>
            )}
          </div>
        </div>
        <aside className="doar-resumo cartao">
          <span className="badge badge--sucesso">{campanha.status}</span>
          <h2>Faça parte dessa história</h2>
          <Progresso atual={campanha.arrecadado} meta={campanha.meta} />
          <div className="lista-linha">
            <span>Encerramento</span>
            <strong>{formatarData(campanha.encerraEm)}</strong>
          </div>
          {campanha.status === 'Ativa' ? (
            <Botao para={`/doar/${campanha.id}`}>
              Quero doar <Icon nome="doacoes" />
            </Botao>
          ) : (
            <Aviso>Esta campanha está encerrada.</Aviso>
          )}
          <small>Você escolhe como e quanto deseja contribuir.</small>
          {/* Doação de itens não existe na API: sem o atalho "Doar itens necessários". */}
          {campanha.ultimasDoacoes?.length > 0 && (
            <>
              <hr />
              <h3>Últimas doações</h3>
              {campanha.ultimasDoacoes.map((d, i) => (
                <div className="lista-linha" key={`${d.data}-${i}`}>
                  <span>{d.doador}</span>
                  <strong>{formatarMoeda(d.valor)}</strong>
                </div>
              ))}
            </>
          )}
          <hr />
          <h3>Sobre a entidade</h3>
          <strong>{campanha.entidade}</strong>
          {campanha.cidade && <p>{campanha.cidade}</p>}
          <Aviso>
            Dados reais da campanha. O pagamento ainda não está integrado.
          </Aviso>
        </aside>
      </div>
    </section>
  )
}
