import { useState } from 'react'
import PaginacaoApi from '../components/PaginacaoApi'
import RequestState from '../components/RequestState'
import { Botao, Campo, Secao } from '../components/Ui'
import { useRequest } from '../hooks/useRequest'
import { entidadesService } from '../services/entidadesService'

export default function EntidadesPublicas() {
  const [termo, setTermo] = useState('')
  const [pagina, setPagina] = useState(1)
  const request = useRequest(entidadesService.publicas, [])
  const limite = 10

  function buscar(event) {
    event.preventDefault()
    const termo = String(new FormData(event.currentTarget).get('busca')).trim()
    setTermo(termo.toLocaleLowerCase('pt-BR'))
    setPagina(1)
  }

  return (
    <section className="public-section">
      <div className="public-page-title">
        <h1>Entidades assistenciais</h1>
        <p>Encontre uma entidade aprovada para apoiar diretamente.</p>
        <Botao para="/cadastro-entidade" secundario>Cadastrar entidade</Botao>
      </div>
      <form className="cartao form-grid" onSubmit={buscar}>
        <Campo rotulo="Buscar entidade" type="search" name="busca" />
        <div><Botao type="submit">Buscar</Botao></div>
      </form>
      <RequestState {...request}>{(entidades) => {
        const filtradas = entidades.filter((e) => `${e.nome} ${e.descricao}`.toLocaleLowerCase('pt-BR').includes(termo))
        return <>
          {filtradas.length === 0 && <p role="status">Nenhuma entidade encontrada.</p>}
          <div className="form-grid">
            {filtradas.slice((pagina - 1) * limite, pagina * limite).map((e) => <Secao key={e.id} titulo={e.nome}>
              {e.descricao && <p>{e.descricao}</p>}
              <Botao para={`/doar/entidade/${e.id}`}>Apoiar entidade</Botao>
            </Secao>)}
          </div>
          <PaginacaoApi dados={{ pagina, totalPaginas: Math.ceil(filtradas.length / limite) }} ocupado={request.loading} selecionar={setPagina} />
        </>
      }}</RequestState>
    </section>
  )
}
