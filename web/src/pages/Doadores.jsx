import { useState } from 'react'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import { Botao, Secao, Vazio } from '../components/Ui'
import { formatarData, formatarMoeda } from '../utils/format'

export default function Doadores() {
  const { dados } = useDemo(),
    [busca, setBusca] = useState(''),
    [selecionado, setSelecionado] = useState('')
  const doacoesEntidade = dados.doacoes.filter(
    (d) => d.entidadeId === dados.entidade.id,
  )
  const nomes = [...new Set(doacoesEntidade.map((d) => d.doador))]
  const doadores = nomes
    .filter((n) => n.toLowerCase().includes(busca.toLowerCase().trim()))
    .map((nome) => {
      const doacoes = doacoesEntidade.filter((d) => d.doador === nome)
      return {
        id: nome,
        nome,
        total: doacoes
          .filter((d) => d.status === 'Confirmada')
          .reduce((s, d) => s + (d.valor || 0), 0),
        quantidade: doacoes.length,
        ultima: doacoes
          .map((d) => d.data)
          .sort()
          .at(-1),
      }
    })
  const historico = doacoesEntidade.filter((d) => d.doador === selecionado)
  return (
    <>
      <div className="breadcrumb">
        Doadores <span>/</span> Relacionamento
      </div>
      <PageHeader
        titulo="Doadores e histórico"
        descricao="Conheça as pessoas e organizações que fazem parte dessa transformação."
      />
      <div className={selecionado ? 'dashboard-grid' : ''}>
        <Secao titulo="Doadores da entidade">
          <Filtros
            busca={busca}
            onBusca={setBusca}
            placeholder="Buscar doador pelo nome"
          />
          <DataTable
            linhas={doadores}
            colunas={[
              { chave: 'nome', titulo: 'Doador' },
              { chave: 'quantidade', titulo: 'Contribuições' },
              {
                chave: 'total',
                titulo: 'Financeiro confirmado',
                render: (d) => formatarMoeda(d.total),
              },
              {
                chave: 'ultima',
                titulo: 'Última contribuição',
                render: (d) => formatarData(d.ultima),
              },
              {
                chave: 'acao',
                titulo: 'Histórico',
                render: (d) => (
                  <button
                    type="button"
                    className="link-botao"
                    onClick={() => setSelecionado(d.nome)}
                    aria-label={`Ver histórico de ${d.nome}`}
                  >
                    Ver histórico
                  </button>
                ),
              },
            ]}
          />
        </Secao>
        {selecionado && (
          <Secao
            titulo="Perfil do doador"
            descricao={selecionado}
            acao={
              <Botao secundario onClick={() => setSelecionado('')}>
                Fechar
              </Botao>
            }
          >
            {historico.length ? (
              historico.map((d) => (
                <div className="historico-item" key={d.id}>
                  <small>{formatarData(d.data)}</small>
                  <strong>{d.detalhe}</strong>
                  <p>{d.campanha}</p>
                  <span className="badge badge--neutro">{d.status}</span>
                </div>
              ))
            ) : (
              <Vazio />
            )}
          </Secao>
        )}
      </div>
    </>
  )
}
