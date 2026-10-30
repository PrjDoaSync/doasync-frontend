import { useState } from 'react'
import { useDemo } from '../context/DemoContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import { Aviso, Botao, Campo, Icon, Secao } from '../components/Ui'
import {
  calcularIndicadores,
  filtrarRegistros,
  validarPeriodo,
} from '../utils/gestao'
import { formatarData, formatarMoeda } from '../utils/format'

const inicial = { inicio: '', fim: '', campanhaId: '', status: '', tipo: '' }
export default function Relatorios() {
  const { dados } = useDemo(),
    [form, setForm] = useState(inicial),
    [filtros, setFiltros] = useState(inicial),
    [erro, setErro] = useState(''),
    [aviso, setAviso] = useState('')
  const registros = filtrarRegistros(dados.doacoes, {
      ...filtros,
      entidadeId: dados.entidade.id,
    }),
    indicadores = calcularIndicadores(dados.campanhas, registros)
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  function aplicar(e) {
    e.preventDefault()
    const mensagem = validarPeriodo(form.inicio, form.fim)
    setErro(mensagem)
    if (!mensagem) {
      setFiltros({ ...form })
      setAviso('Prévia atualizada para os filtros selecionados.')
    }
  }
  return (
    <>
      <div className="breadcrumb">
        Relatórios <span>/</span> Prévia e exportação
      </div>
      <PageHeader
        titulo="Relatórios e exportação"
        descricao="Consulte os resultados e acompanhe as informações de prestação de contas."
      />
      <Secao
        titulo="Selecione o escopo do relatório"
        descricao={`Entidade: ${dados.entidade.nome}. Aplique os filtros em Gerar prévia antes de exportar.`}
      >
        <form onSubmit={aplicar} className="form-filtros">
          <Campo
            rotulo="Data inicial"
            name="inicio"
            type="date"
            value={form.inicio}
            onChange={alterar}
          />
          <Campo
            rotulo="Data final"
            name="fim"
            type="date"
            value={form.fim}
            min={form.inicio || undefined}
            onChange={alterar}
          />
          <Campo rotulo="Campanha">
            <select
              name="campanhaId"
              value={form.campanhaId}
              onChange={alterar}
            >
              <option value="">Todas as campanhas</option>
              {dados.campanhas
                .filter((c) => c.entidadeId === dados.entidade.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
            </select>
          </Campo>
          <Campo rotulo="Status">
            <select name="status" value={form.status} onChange={alterar}>
              <option value="">Todos os status</option>
              {['Confirmada', 'Pendente', 'Cancelada'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Tipo">
            <select name="tipo" value={form.tipo} onChange={alterar}>
              <option value="">Todos os tipos</option>
              <option>Financeira</option>
              <option>Itens</option>
            </select>
          </Campo>
          <div className="acoes">
            <Botao type="submit">
              <Icon nome="relatorios" />
              Gerar prévia
            </Botao>
            <Botao
              secundario
              onClick={() => {
                setForm(inicial)
                setFiltros(inicial)
                setErro('')
                setAviso('Filtros limpos.')
              }}
            >
              Limpar
            </Botao>
          </div>
        </form>
        {erro && <Aviso erro>{erro}</Aviso>}
        {aviso && <Aviso>{aviso}</Aviso>}
      </Secao>
      <section className="kpis">
        <KpiCard
          rotulo="Financeiro confirmado"
          valor={formatarMoeda(indicadores.arrecadado)}
        />
        <KpiCard
          rotulo="Itens recebidos"
          valor={`${indicadores.itens} unidades`}
        />
        <KpiCard rotulo="Doadores identificados" valor={indicadores.doadores} />
      </section>
      <div className="dashboard-grid">
        <Secao
          titulo="Prévia do relatório"
          descricao={`${registros.length} registros · ${filtros.inicio ? formatarData(filtros.inicio) : 'Início do histórico'} até ${filtros.fim ? formatarData(filtros.fim) : 'o último registro'}`}
        >
          <DataTable
            linhas={registros}
            vazio="Nenhum registro para os filtros selecionados."
            colunas={[
              {
                chave: 'data',
                titulo: 'Data',
                render: (d) => formatarData(d.data),
              },
              { chave: 'doador', titulo: 'Doador' },
              { chave: 'detalhe', titulo: 'Contribuição' },
              { chave: 'status', titulo: 'Status' },
            ]}
          />
        </Secao>
        <Secao titulo="Exportar relatório">
          <h3>PDF · prestação de contas</h3>
          <p>
            O relatório oficial será disponibilizado após a integração com o
            serviço de exportação.
          </p>
          <Botao secundario disabled aria-describedby="exportacao-pendente">
            <Icon nome="download" />
            Baixar PDF
          </Botao>
          <hr />
          <h3>CSV · dados para análise</h3>
          <p>
            O arquivo será disponibilizado pelo serviço de exportação após a
            integração.
          </p>
          <Botao secundario disabled aria-describedby="exportacao-pendente">
            <Icon nome="download" />
            Baixar CSV
          </Botao>
          <Aviso>
            <span id="exportacao-pendente">
              Exportações oficiais indisponíveis: o serviço de geração de
              arquivos ainda não foi integrado.
            </span>
          </Aviso>
        </Secao>
      </div>
    </>
  )
}
