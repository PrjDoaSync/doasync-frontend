import { useState } from 'react'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import { Aviso, Botao, Campo, Icon, Modal } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { movimentarEstoque } from '../utils/estoque'
import { formatarData } from '../utils/format'
import '../styles/itens.css'

const vazio = { itemId: '', quantidade: '', destino: '', data: '', observacao: '' }
const soma = (lista, campo) => lista.reduce((s, i) => s + i[campo], 0)

// [DEV-GES-07] Controle de itens doados (#111). Persiste só na sessão de demonstração.
// SEM CONTRATO na API: estoque, entradas, saídas e destinação (itens estão fora do MVP).
// Códigos EN-/SA-, responsável e recibo são de demonstração; "Anexar recibo" fica desabilitado.
export default function Itens() {
  const { dados, atualizar } = useDemo()
  const primeiro = String(dados.itens[0]?.id ?? '')
  const [saida, setSaida] = useState({ ...vazio, itemId: primeiro })
  const [entrada, setEntrada] = useState(null)
  const [erroSaida, setErroSaida] = useState('')
  const [erroEntrada, setErroEntrada] = useState('')
  const [aviso, setAviso] = useState('')
  const [filtro, setFiltro] = useState({ tipo: '', itemId: '', data: '' })

  const entradas = soma(dados.itens, 'recebido')
  const saidas = soma(dados.itens, 'destinado')
  const rotaIndex = dados.movimentos.map((m, i) => ({ ...m, _i: i }))
  // Código sequencial por tipo, na ordem cronológica (a lista guarda os mais novos primeiro).
  const codigos = {}
  const contador = { Entrada: 0, Saída: 0 }
  ;[...rotaIndex]
    .sort((a, b) => a.data.localeCompare(b.data) || b._i - a._i)
    .forEach((m) => {
      contador[m.tipo] += 1
      codigos[m.id] = `${m.tipo === 'Entrada' ? 'EN' : 'SA'}-${String(contador[m.tipo]).padStart(4, '0')}`
    })
  const movimentos = rotaIndex
    .filter((m) => (!filtro.tipo || m.tipo === filtro.tipo) && (!filtro.itemId || String(m.itemId) === filtro.itemId) && (!filtro.data || m.data === filtro.data))
    .sort((a, b) => b.data.localeCompare(a.data) || a._i - b._i)
  const destinoDe = (item) => dados.movimentos.find((m) => m.itemId === item.id && m.tipo === 'Saída')?.destino ?? '—'

  function registrar(tipo, campos, mostrarErro, aoSucesso) {
    try {
      if (!campos.data) throw new Error('Informe a data da movimentação.')
      const r = movimentarEstoque(dados, { ...campos, tipo })
      atualizar('itens', r.itens)
      atualizar('movimentos', [{ ...r.movimento, responsavel: 'Ana Silva', observacao: campos.observacao?.trim() || undefined }, ...dados.movimentos])
      mostrarErro('')
      setAviso('Movimentação registrada na demonstração.')
      aoSucesso()
    } catch (e) {
      mostrarErro(e.message)
    }
  }

  const colunasSaldo = [
    { chave: 'nome', titulo: 'Item / unidade', render: (i) => <strong>{i.nome} · {i.unidade}</strong> },
    { chave: 'inicial', titulo: 'Inicial', render: () => '0' },
    { chave: 'recebido', titulo: 'Entradas' },
    { chave: 'destinado', titulo: 'Saídas' },
    { chave: 'saldo', titulo: 'Saldo', render: (i) => <strong>{i.recebido - i.destinado}</strong> },
    { chave: 'destino', titulo: 'Destinação das saídas', render: destinoDe },
  ]
  const colunasMov = [
    { chave: 'data', titulo: 'Data / registro', render: (m) => <><strong>{formatarData(m.data)}</strong><small>{codigos[m.id]}</small></> },
    { chave: 'tipo', titulo: 'Movimentação', render: (m) => (m.tipo === 'Entrada' ? 'Entrada conferida' : 'Saída destinada') },
    { chave: 'quantidade', titulo: 'Quantidade', render: (m) => <><strong>{m.quantidade}</strong><small>{m.item}</small></> },
    { chave: 'destino', titulo: 'Origem / destino', render: (m) => <>{m.destino}{m.observacao && <small>{m.observacao}</small>}</> },
    { chave: 'responsavel', titulo: 'Responsável', render: (m) => m.responsavel ?? 'Ana Silva' },
  ]
  const mudarFiltro = (campo) => (e) => setFiltro({ ...filtro, [campo]: e.target.value })
  const ligar = (estado, setEstado, campo) => ({ value: estado[campo], onChange: (e) => setEstado({ ...estado, [campo]: e.target.value }) })

  return (
    <div className="itn">
      <div>
        <nav className="breadcrumb" aria-label="Você está em">Doações <span>/</span> Estoque e destinação</nav>
        <PageHeader titulo="Controle de itens doados" descricao="Registre entradas, acompanhe o saldo e comprove a entrega às famílias.">
          <Botao onClick={() => { setEntrada({ ...vazio, itemId: primeiro }); setErroEntrada('') }}><Icon nome="mais" size={16} /> Registrar entrada</Botao>
        </PageHeader>
      </div>

      <div className="itn-topo">
        <span className="itn-camp">Mesa solidária</span>
        <span className="itn-topo__periodo">01 a 06/10/2026 · Atualizado em 06/10, às 16:00</span>
      </div>
      {aviso && <Aviso>{aviso}</Aviso>}

      <section className="itn-kpis">
        <KpiCard rotulo="Entradas confirmadas" valor={`${entradas} unidades`} detalhe="Somente entregas conferidas pela entidade" />
        <KpiCard rotulo="Saídas destinadas" valor={`${saidas} unidades`} detalhe="Entregues às famílias · recibo de destinação" />
        <KpiCard rotulo="Saldo em estoque" valor={`${entradas - saidas} unidades`} detalhe={`Saldo inicial 0 + ${entradas} entradas − ${saidas} saídas`} />
      </section>

      <section className="itn-card" aria-labelledby="itn-saldo">
        <div><h2 id="itn-saldo">Saldo por item</h2><p className="itn-sub">Depósito da sede · Unidades físicas, sem conversão para valores financeiros.</p></div>
        <DataTable colunas={colunasSaldo} linhas={dados.itens} vazio="Nenhum item cadastrado." />
        <div className="itn-total"><span>Total: {entradas} entradas · {saidas} saídas · {entradas - saidas} em estoque</span><span className="badge badge--sucesso">Saldo conferido</span></div>
      </section>

      <section className="itn-card" aria-labelledby="itn-mov">
        <div><h2 id="itn-mov">Registro de movimentações</h2><p className="itn-sub">Entradas e saídas recentes · Mesa solidária · Histórico completo disponível por item.</p></div>
        <div className="itn-filtros">
          <select aria-label="Tipo de movimentação" value={filtro.tipo} onChange={mudarFiltro('tipo')}>
            <option value="">Todas as movimentações</option><option value="Entrada">Entradas</option><option value="Saída">Saídas</option>
          </select>
          <select aria-label="Item" value={filtro.itemId} onChange={mudarFiltro('itemId')}>
            <option value="">Todos os itens</option>{dados.itens.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
          <input type="date" aria-label="Data da movimentação" value={filtro.data} onChange={mudarFiltro('data')} />
        </div>
        <DataTable colunas={colunasMov} linhas={movimentos} vazio="Nenhuma movimentação encontrada com esses filtros." />
      </section>

      <section className="itn-card" aria-labelledby="itn-saida">
        <div><h2 id="itn-saida">Registrar saída e destinação</h2><p className="itn-sub">Nova movimentação em rascunho · Não altera o saldo até a confirmação.</p></div>
        <div className="itn-saida">
          <Campo rotulo="Item"><select {...ligar(saida, setSaida, 'itemId')}>{dados.itens.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</select></Campo>
          <Campo rotulo="Quantidade"><input inputMode="numeric" {...ligar(saida, setSaida, 'quantidade')} /></Campo>
          <Campo rotulo="Destino"><input {...ligar(saida, setSaida, 'destino')} /></Campo>
          <Campo rotulo="Data prevista"><input type="date" {...ligar(saida, setSaida, 'data')} /></Campo>
        </div>
        <div className="itn-saida__obs">
          <Campo rotulo="Comprovante / observação"><input placeholder="Anexar recibo após a entrega às famílias" {...ligar(saida, setSaida, 'observacao')} /></Campo>
          <button type="button" className="itn-botao" disabled aria-disabled="true"><Icon nome="download" size={15} /> Anexar recibo</button>
          <Botao onClick={() => registrar('Saída', saida, setErroSaida, () => setSaida({ ...vazio, itemId: saida.itemId }))}><Icon nome="check" size={16} /> Confirmar saída</Botao>
        </div>
        {erroSaida && <Aviso erro>{erroSaida}</Aviso>}
      </section>

      <Aviso>Dados demonstrativos. Receber itens não registra automaticamente uma saída ou destinação. Entradas e saídas valem somente nesta sessão.</Aviso>

      {entrada && (
        <Modal titulo="Registrar entrada" fechar={() => setEntrada(null)}>
          <form className="pilha" onSubmit={(e) => { e.preventDefault(); registrar('Entrada', entrada, setErroEntrada, () => setEntrada(null)) }}>
            <Campo rotulo="Item"><select {...ligar(entrada, setEntrada, 'itemId')}>{dados.itens.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</select></Campo>
            <Campo rotulo="Quantidade" required><input inputMode="numeric" {...ligar(entrada, setEntrada, 'quantidade')} /></Campo>
            <Campo rotulo="Origem" required><input {...ligar(entrada, setEntrada, 'destino')} /></Campo>
            <Campo rotulo="Data" required><input type="date" {...ligar(entrada, setEntrada, 'data')} /></Campo>
            {erroEntrada && <Aviso erro>{erroEntrada}</Aviso>}
            <Botao type="submit">Confirmar na demonstração</Botao>
          </form>
        </Modal>
      )}
    </div>
  )
}
