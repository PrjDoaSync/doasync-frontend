import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import CampanhaCard, { Progresso } from '../components/CampanhaCard'
import { Aviso, Botao, Campo, Icon, Vazio } from '../components/Ui'
import { categorias } from '../mocks/gestao'
import { formatarData } from '../utils/format'

export function Home() {
  const { dados } = useDemo()
  const destaques = dados.campanhas
    .filter((c) => c.status === 'Ativa')
    .slice(0, 3)
  return (
    <>
      <section className="public-intro">
        <span className="sobretitulo">SOLIDARIEDADE QUE CONECTA</span>
        <h1>
          Pequenos gestos.
          <br />
          Grandes <span>transformações.</span>
        </h1>
        <p>
          Encontre uma causa que toca o seu coração.
          <br />
          Doe com confiança e acompanhe o impacto da sua ajuda.
        </p>
        <Botao para="/explorar">
          Explorar campanhas <Icon nome="seta" />
        </Botao>
      </section>
      {destaques[0] && (
        <section className="destaque">
          <img src={destaques[0].imagem} alt="Alimentos destinados à doação" />
          <div className="destaque__conteudo">
            <span className="sobretitulo">CAMPANHA EM DESTAQUE</span>
            <h2>{destaques[0].nome}</h2>
            <p>{destaques[0].descricao}</p>
            <Progresso
              atual={destaques[0].arrecadado}
              meta={destaques[0].meta}
            />
            <Botao para={`/campanhas/${destaques[0].id}`}>
              Quero ajudar <Icon nome="seta" />
            </Botao>
          </div>
        </section>
      )}
      <section className="public-section">
        <div className="secao__cabecalho">
          <div>
            <h2>Encontre uma causa para apoiar</h2>
            <p>Cada campanha é uma oportunidade de fazer a diferença.</p>
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
      <section className="como-ajudar">
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
      </section>
    </>
  )
}

export function Explorar() {
  const { dados } = useDemo(),
    [params, setParams] = useSearchParams(),
    [pagina, setPagina] = useState(1)
  const busca = params.get('busca') ?? '',
    categoria = params.get('categoria') ?? '',
    cidade = params.get('cidade') ?? '',
    ordem = params.get('ordem') ?? 'recentes'
  function filtrar(chave, valor) {
    const nova = new URLSearchParams(params)
    valor ? nova.set(chave, valor) : nova.delete(chave)
    setParams(nova)
    setPagina(1)
  }
  const campanhas = useMemo(
    () =>
      dados.campanhas
        .filter(
          (c) =>
            c.status === 'Ativa' &&
            (!categoria || c.categoria === categoria) &&
            (!cidade || c.cidade === cidade) &&
            `${c.nome} ${c.entidade}`
              .toLowerCase()
              .includes(busca.trim().toLowerCase()),
        )
        .sort((a, b) =>
          ordem === 'meta'
            ? b.arrecadado / b.meta - a.arrecadado / a.meta
            : b.id - a.id,
        ),
    [dados.campanhas, busca, categoria, cidade, ordem],
  )
  return (
    <section className="public-section">
      <div className="breadcrumb">
        <Link to="/">Início</Link>
        <span>/</span>Explorar campanhas
      </div>
      <div className="public-page-title">
        <h1>Encontre sua próxima boa ação</h1>
        <p>Descubra campanhas e ajude a transformar histórias.</p>
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
        <Campo rotulo="Categoria">
          <select
            value={categoria}
            onChange={(e) => filtrar('categoria', e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Localização">
          <select
            value={cidade}
            onChange={(e) => filtrar('cidade', e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {[...new Set(dados.campanhas.map((c) => c.cidade))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Campo>
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
  const { id } = useParams(),
    { dados } = useDemo(),
    [params] = useSearchParams(),
    [aba, setAba] = useState(
      params.get('aba') === 'itens' ? 'Itens necessários' : 'Sobre a campanha',
    )
  const campanha = dados.campanhas.find(
    (c) => String(c.id) === id && c.status !== 'Rascunho',
  )
  if (!campanha)
    return (
      <Vazio principal titulo="Campanha não encontrada">
        <Link to="/explorar">Voltar para as campanhas</Link>
      </Vazio>
    )
  const abas = ['Sobre a campanha', 'Itens necessários', 'Atualizações']
  return (
    <section className="public-section">
      <div className="breadcrumb">
        <Link to="/explorar">Campanhas</Link>
        <span>/</span>
        {campanha.categoria}
      </div>
      <span className="badge badge--sucesso">{campanha.categoria}</span>
      <div className="public-page-title">
        <h1>{campanha.nome}</h1>
        <p>
          Uma iniciativa de <strong>{campanha.entidade}</strong> ·{' '}
          {campanha.cidade}
        </p>
      </div>
      <div className="detalhe-grid">
        <div>
          <img
            className="campanha-capa"
            src={campanha.imagem}
            alt="Doações que apoiam a comunidade"
          />
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
          <hr />
          <h3>Sobre a entidade</h3>
          <strong>{campanha.entidade}</strong>
          <p>{campanha.cidade}</p>
          <Aviso>
            Este é um protótipo funcional com dados de demonstração. Nenhum
            pagamento é realizado.
          </Aviso>
        </aside>
      </div>
    </section>
  )
}
