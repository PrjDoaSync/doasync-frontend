import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CampanhaCard from '../components/CampanhaCard'
import Paginacao from '../components/Paginacao'
import RequestState from '../components/RequestState'
import { Botao, Campo, Icon, Secao, Vazio } from '../components/Ui'
import { useRequest } from '../hooks/useRequest'
import { campanhasService } from '../services/campanhasService'
import { entidadesService } from '../services/entidadesService'
import { filtrarEntidadesPublicas } from '../utils/entidadesPublicas'
import { fatiar } from '../utils/paginacao'
import '../styles/cam-publico.css'

const POR_PAGINA = 9

const localDaEntidade = (e) => [e.endereco?.cidade, e.endereco?.uf].filter(Boolean).join(', ')

// Entidades aprovadas (RF-009, página pública): GET /entidades devolve todas as APROVADA, sem
// paginação nem busca na API — busca, filtro e paginação ficam na tela.
export default function EntidadesPublicas() {
  const request = useRequest((config) => entidadesService.aprovadas(config), [])
  return (
    <section className="public-section cam-publico entidades-publicas">
      <div className="breadcrumb">
        <Link to="/">Início</Link>
        <span>/</span>Entidades
      </div>
      <div className="public-page-title">
        <h1>Entidades que transformam realidades</h1>
        <p>Conheça as entidades aprovadas na plataforma e apoie diretamente quem faz a diferença.</p>
      </div>
      <RequestState {...request}>{(entidades) => <Lista entidades={entidades} />}</RequestState>
      <Secao titulo="Sua entidade ainda não está aqui?" descricao="Cadastre a entidade para publicar campanhas depois da análise da equipe DoaSync.">
        <Botao para="/cadastro-entidade" secundario>Cadastrar entidade</Botao>
      </Secao>
    </section>
  )
}

function Lista({ entidades }) {
  const [busca, setBusca] = useState('')
  const [area, setArea] = useState('')
  const [pagina, setPagina] = useState(1)
  const areas = [...new Set(entidades.map((e) => e.areaAtuacao).filter(Boolean))].sort()
  const filtradas = filtrarEntidadesPublicas(entidades, { busca, area })
  const filtrar = (definir) => (e) => {
    definir(e.target.value)
    setPagina(1)
  }

  return (
    <>
      <div className="cartao filtros-publicos">
        <Campo rotulo="Buscar entidade">
          <div className="busca-com-icone">
            <Icon nome="busca" />
            <input type="search" value={busca} onChange={filtrar(setBusca)} placeholder="Nome, área ou cidade" aria-label="Buscar entidade" />
          </div>
        </Campo>
        {areas.length > 0 && (
          <Campo rotulo="Área de atuação">
            <select value={area} onChange={filtrar(setArea)}>
              <option value="">Todas as áreas</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Campo>
        )}
      </div>
      <div className="secao__cabecalho resultados">
        <p role="status">
          <strong>{filtradas.length}</strong> {filtradas.length === 1 ? 'entidade encontrada' : 'entidades encontradas'}
        </p>
      </div>
      {filtradas.length === 0 ? (
        <Vazio titulo="Nenhuma entidade encontrada">
          {entidades.length === 0 ? 'Ainda não há entidades aprovadas na plataforma.' : 'Experimente buscar por outro nome ou área.'}
        </Vazio>
      ) : (
        <>
          <ul className="entidades-grid">
            {fatiar(filtradas, pagina, POR_PAGINA).map((e) => (
              <li key={e.id} className="cartao entidade-card">
                <div className="entidade-card__topo">
                  <span className="entidade-card__logo" aria-hidden="true">
                    {e.logoUrl ? <img src={e.logoUrl} alt="" loading="lazy" /> : e.nome.slice(0, 1)}
                  </span>
                  <div>
                    <h2>
                      <Link to={`/entidades-publicas/${e.id}`}>{e.nome}</Link>
                    </h2>
                    <small>{[e.areaAtuacao, localDaEntidade(e)].filter(Boolean).join(' · ') || 'Entidade aprovada'}</small>
                  </div>
                </div>
                {e.descricao && <p>{e.descricao}</p>}
                <div className="acoes">
                  <Botao secundario para={`/entidades-publicas/${e.id}`} aria-label={`Ver perfil de ${e.nome}`}>Ver perfil</Botao>
                  <Botao para={`/doar/entidade/${e.id}`} aria-label={`Apoiar ${e.nome}`}>Apoiar</Botao>
                </div>
              </li>
            ))}
          </ul>
          <Paginacao pagina={pagina} total={filtradas.length} porPagina={POR_PAGINA} onPagina={setPagina} rotulo="Paginação das entidades" />
        </>
      )}
    </>
  )
}

// Perfil público de uma entidade aprovada: GET /entidades/{id} e GET /campanhas?entidadeId=.
export function PerfilEntidadePublico() {
  const { id } = useParams()
  const request = useRequest((config) => entidadesService.buscarPublica(id, config), [id])
  return (
    <RequestState
      {...request}
      naoEncontrado={
        <Vazio principal titulo="Entidade não encontrada">
          Ela pode não estar aprovada ou o endereço está incorreto. <Link to="/entidades-publicas">Ver entidades</Link>
        </Vazio>
      }
    >
      {(e) => <Perfil entidade={e} />}
    </RequestState>
  )
}

function Perfil({ entidade: e }) {
  const campanhas = useRequest((config) => campanhasService.daEntidadePublica(e.id, config), [e.id])
  const contatos = [
    ['Site', e.site, e.site && (/^https?:\/\//.test(e.site) ? e.site : `https://${e.site}`)],
    ['E-mail', e.emailContato, e.emailContato && `mailto:${e.emailContato}`],
    ['Telefone', e.telefoneContato, null],
  ].filter(([, valor]) => valor)
  return (
    <section className="public-section cam-publico entidade-publica">
      <div className="breadcrumb">
        <Link to="/entidades-publicas">Entidades</Link>
        <span>/</span>
        {e.nome}
      </div>
      <span className="badge badge--sucesso">Entidade aprovada</span>
      <div className="public-page-title">
        <h1>{e.nome}</h1>
        <p>{[e.areaAtuacao, localDaEntidade(e)].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="detalhe-grid">
        <div className="pilha">
          <Secao titulo="Sobre a entidade">
            <p>{e.descricao || 'A entidade ainda não publicou uma descrição.'}</p>
          </Secao>
          <Secao titulo="Campanhas ativas">
            <RequestState {...campanhas} vazio="Esta entidade não tem campanhas ativas no momento.">
              {(lista) => (
                <div className="cards-grid">
                  {lista.map((c) => (
                    <CampanhaCard key={c.id} campanha={c} />
                  ))}
                </div>
              )}
            </RequestState>
          </Secao>
        </div>
        <aside className="cartao doar-resumo">
          <h2>Apoie diretamente</h2>
          <p>A doação vai para a entidade, sem uma campanha específica.</p>
          <Botao para={`/doar/entidade/${e.id}`}>
            Apoiar {e.nome} <Icon nome="seta" />
          </Botao>
          {contatos.length > 0 && (
            <>
              <hr />
              <h3>Contato</h3>
              <dl className="entidade-contatos">
                {contatos.map(([rotulo, valor, href]) => (
                  <div key={rotulo}>
                    <dt>{rotulo}</dt>
                    <dd>{href ? <a href={href} target={rotulo === 'Site' ? '_blank' : undefined} rel="noreferrer">{valor}</a> : valor}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
