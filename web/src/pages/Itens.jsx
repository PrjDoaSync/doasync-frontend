import { useState } from 'react'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import DataTable from '../components/DataTable'
import { Aviso, Botao, Campo, Icon, Modal, Secao } from '../components/Ui'
import { movimentarEstoque } from '../utils/estoque'
import { formatarData } from '../utils/format'

export default function Itens() {
  const { dados, atualizar, notificar } = useDemo(),
    [modal, setModal] = useState(false),
    [erro, setErro] = useState(''),
    [tipo, setTipo] = useState('Saída')
  const recebido = dados.itens.reduce((s, i) => s + i.recebido, 0),
    destinado = dados.itens.reduce((s, i) => s + i.destinado, 0)
  function salvar(e) {
    e.preventDefault()
    try {
      const f = Object.fromEntries(new FormData(e.currentTarget))
      const resultado = movimentarEstoque(dados, f)
      atualizar('itens', resultado.itens)
      atualizar('movimentos', [resultado.movimento, ...dados.movimentos])
      setModal(false)
      setErro('')
      notificar('Movimentação registrada na demonstração.')
    } catch (error) {
      setErro(error.message)
    }
  }
  return (
    <>
      <div className="breadcrumb">
        Doações <span>/</span> Controle de itens
      </div>
      <PageHeader
        titulo="Controle de itens doados"
        descricao="Registre entradas, acompanhe saldos e consulte o histórico de itens."
      >
        <Botao
          onClick={() => {
            setModal(true)
            setErro('')
          }}
        >
          <Icon nome="mais" />
          Registrar movimentação
        </Botao>
      </PageHeader>
      <section className="kpis">
        <KpiCard rotulo="Total recebido" valor={`${recebido} unidades`} />
        <KpiCard rotulo="Total destinado" valor={`${destinado} unidades`} />
        <KpiCard
          rotulo="Saldo disponível"
          valor={`${recebido - destinado} unidades`}
        />
      </section>
      <Secao titulo="Saldo por item">
        <DataTable
          linhas={dados.itens}
          colunas={[
            { chave: 'nome', titulo: 'Item' },
            { chave: 'recebido', titulo: 'Recebido' },
            { chave: 'destinado', titulo: 'Destinado' },
            {
              chave: 'saldo',
              titulo: 'Saldo',
              render: (i) => (
                <strong>
                  {i.recebido - i.destinado} {i.unidade}
                </strong>
              ),
            },
          ]}
        />
      </Secao>
      <Secao titulo="Registro de movimentações">
        <DataTable
          linhas={dados.movimentos}
          colunas={[
            {
              chave: 'data',
              titulo: 'Data',
              render: (m) => formatarData(m.data),
            },
            { chave: 'item', titulo: 'Item' },
            { chave: 'tipo', titulo: 'Movimentação' },
            { chave: 'quantidade', titulo: 'Quantidade' },
            { chave: 'destino', titulo: 'Origem / destino' },
          ]}
        />
      </Secao>
      <Aviso>
        Controle local de demonstração. Nenhum saldo de estoque real é alterado.
      </Aviso>
      {modal && (
        <Modal titulo="Registrar movimentação" fechar={() => setModal(false)}>
          <form className="pilha" onSubmit={salvar}>
            <Campo rotulo="Item">
              <select name="itemId" required>
                {dados.itens.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} · saldo {i.recebido - i.destinado}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tipo">
              <select
                name="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option>Saída</option>
                <option>Entrada</option>
              </select>
            </Campo>
            <Campo
              rotulo="Quantidade"
              name="quantidade"
              type="number"
              min="1"
              step="1"
              required
            />
            <Campo
              rotulo={tipo === 'Saída' ? 'Destino' : 'Origem'}
              name="destino"
              required
            />
            <Campo rotulo="Data" name="data" type="date" required />
            {erro && <Aviso erro>{erro}</Aviso>}
            <Botao type="submit">Confirmar na demonstração</Botao>
          </form>
        </Modal>
      )}
    </>
  )
}
