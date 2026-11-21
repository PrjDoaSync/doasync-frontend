import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Aviso, Botao, Campo, Icon } from '../components/Ui'
import { useDemo } from '../context/DemoContext'
import { categorias } from '../mocks/gestao'
import {
  NOTIFICACOES, ULTIMA_ATUALIZACAO_DEMO, agoraFormatado, configuracaoPadrao,
  mascararCnpj, validarRecebimentoItens,
} from '../utils/configuracoes'
import '../styles/perfil.css'

// [DEV-GES-10] Perfil da entidade e configurações (#114).
// SEM CONTRATO na API: recebimento de itens, notificações e recebimento financeiro
// (PATCH /entidades/{id} só aceita os dados cadastrais). O CNPJ é exibido mascarado
// e não é editável. Persiste só na sessão de demonstração.
export default function PerfilEntidade() {
  const { dados, atualizar } = useDemo()
  const inicial = () => ({ ...dados.entidade, ...configuracaoPadrao(dados.entidade) })
  const [form, setForm] = useState(inicial)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const itens = (chave) => ({
    value: form.recebimentoItens[chave],
    onChange: (e) => setForm({ ...form, recebimentoItens: { ...form.recebimentoItens, [chave]: e.target.value } }),
  })

  async function salvar() {
    if (salvando) return // evita submissão duplicada
    setSucesso(false)
    if (!form.nome.trim() || !form.responsavel.trim()) return setErro('Informe o nome da entidade e do responsável.')
    if (!form.email.includes('@')) return setErro('Informe um e-mail institucional válido.')
    const erroItens = validarRecebimentoItens(form.recebimentoItens)
    if (erroItens) return setErro(erroItens)
    setSalvando(true)
    setErro('')
    try {
      await new Promise((r) => setTimeout(r, 300)) // latência simulada
      const salvo = { ...form, nome: form.nome.trim(), responsavel: form.responsavel.trim(), atualizadoEm: agoraFormatado() }
      atualizar('entidade', salvo)
      setForm(salvo)
      setSucesso(true)
    } catch {
      setErro('Não foi possível salvar as informações. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }
  function descartar() {
    setForm(inicial())
    setErro('')
    setSucesso(false)
  }

  const botaoSalvar = (
    <Botao onClick={salvar} disabled={salvando}>
      {salvando ? 'Salvando…' : <><Icon nome="check" size={16} /> Salvar alterações</>}
    </Botao>
  )

  return (
    <div className="perfil">
      <div>
        <nav className="breadcrumb" aria-label="Você está em">Configurações / Perfil da entidade</nav>
        <PageHeader titulo="Perfil da entidade e configurações" descricao={`Mantenha os dados da ${form.nome}, os recebimentos e as notificações em dia.`}>
          {botaoSalvar}
        </PageHeader>
      </div>

      <section className="perfil-card" aria-labelledby="perfil-identidade">
        <div>
          <h2 id="perfil-identidade">Identidade e contato</h2>
          <p className="perfil-sub">Informações exibidas na vitrine pública. Dados sensíveis ficam restritos à administração.</p>
        </div>
        <div className="perfil-cab">
          <div><strong>{form.nome}</strong><br /><span className="perfil-sub">{form.area} · {form.cidade}</span></div>
          <div className="perfil-cab__acoes">
            <span className="badge badge--sucesso">Cadastro atualizado</span>
            <Botao para="/explorar" secundario><Icon nome="externo" size={16} /> Ver vitrine</Botao>
          </div>
        </div>
        <div className="perfil-grade3">
          <Campo rotulo="Nome da entidade" required><input name="nome" value={form.nome} onChange={alterar} /></Campo>
          <Campo rotulo="CNPJ" required ajuda="Não editável após o cadastro."><input value={mascararCnpj(form.cnpj)} disabled readOnly /></Campo>
          <Campo rotulo="Área de atuação" required>
            <select name="area" value={form.area} onChange={alterar}>
              {[...new Set([form.area, ...categorias])].map((a) => <option key={a}>{a}</option>)}
            </select>
          </Campo>
          <Campo rotulo="E-mail institucional" required><input type="email" name="email" value={form.email} onChange={alterar} /></Campo>
          <Campo rotulo="Telefone" required><input name="telefone" value={form.telefone} onChange={alterar} /></Campo>
          <Campo rotulo="Responsável legal" required><input name="responsavel" value={form.responsavel} onChange={alterar} /></Campo>
        </div>
        <Campo rotulo="Apresentação pública"><input name="descricao" value={form.descricao} onChange={alterar} /></Campo>
      </section>

      <div className="perfil-grade2">
        <section className="perfil-card" aria-labelledby="perfil-financeiro">
          <div>
            <h2 id="perfil-financeiro">Recebimento financeiro</h2>
            <p className="perfil-sub">Configuração demonstrativa. Não use estes dados para transferências.</p>
          </div>
          <span className="perfil-aviso-fic">Dados fictícios e mascarados</span>
          <div className="perfil-campos perfil-campos--2">
            <Campo rotulo="Banco"><input value="Banco de exemplo" disabled readOnly /></Campo>
            <Campo rotulo="Titular"><input value={form.nome} disabled readOnly /></Campo>
            <Campo rotulo="Agência"><input value="••••" disabled readOnly /></Campo>
            <Campo rotulo="Conta corrente"><input value="•••••-•" disabled readOnly /></Campo>
            <Campo rotulo="Chave Pix institucional" className="inteiro"><input value={`CNPJ · ${mascararCnpj(form.cnpj)}`} disabled readOnly /></Campo>
          </div>
          <p className="perfil-sub">Pix e cartão disponíveis nas campanhas. Pagamentos são confirmados pelo provedor; os repasses não registram a destinação dos recursos.</p>
          <div><button type="button" className="perfil-botao" disabled aria-disabled="true">Alterar dados de recebimento</button></div>
        </section>

        <section className="perfil-card" aria-labelledby="perfil-itens">
          <div>
            <h2 id="perfil-itens">Recebimento de itens</h2>
            <p className="perfil-sub">Ponto de entrega e orientações para os doadores.</p>
          </div>
          <div className="perfil-campos">
            <Campo rotulo="Local de recebimento"><input {...itens('local')} /></Campo>
            <Campo rotulo="Endereço demonstrativo"><input {...itens('endereco')} /></Campo>
            <div className="perfil-campos perfil-campos--2">
              <Campo rotulo="Horário de entrega"><input {...itens('horario')} /></Campo>
              <Campo rotulo="Responsável"><input {...itens('responsavel')} /></Campo>
            </div>
            <Campo rotulo="Orientações de entrega"><input {...itens('orientacoes')} /></Campo>
          </div>
          <p className="perfil-sub">Itens aceitos em Mesa solidária: cestas básicas, kits de higiene e leite em pó. A equipe confere a entrega antes de registrar a entrada.</p>
        </section>
      </div>

      <section className="perfil-card" aria-labelledby="perfil-notificacoes">
        <div>
          <h2 id="perfil-notificacoes">Notificações da entidade</h2>
          <p className="perfil-sub">Preferências de {form.responsavel} nesta entidade · Central do DoaSync e e-mail institucional.</p>
        </div>
        <div className="perfil-notif">
          {NOTIFICACOES.map((n) => {
            const ativa = form.notificacoes[n.chave]
            return (
              <div className="perfil-notif__item" key={n.chave}>
                <div><strong>{n.titulo}</strong><small>{n.detalhe}</small></div>
                <div className="perfil-notif__controle">
                  <span className={`perfil-notif__estado${ativa ? ' perfil-notif__estado--on' : ''}`}>{ativa ? 'Ativada' : 'Desativada'}</span>
                  <label className="perfil-switch">
                    <input
                      type="checkbox" role="switch" className="sr-only" aria-label={n.titulo} checked={ativa}
                      onChange={(e) => setForm({ ...form, notificacoes: { ...form.notificacoes, [n.chave]: e.target.checked } })}
                    />
                    <span className="perfil-switch__trilho" aria-hidden="true" />
                  </label>
                </div>
              </div>
            )
          })}
        </div>
        <p className="perfil-sub">Alertas críticos de segurança e alterações dos dados de recebimento são obrigatórios e não podem ser desativados.</p>
      </section>

      {erro && <Aviso erro>{erro}</Aviso>}
      {sucesso && <Aviso>Informações salvas na demonstração. As alterações valem somente nesta sessão.</Aviso>}
      <div className="perfil-rodape">
        <span className="perfil-sub">Última atualização: {form.atualizadoEm ?? ULTIMA_ATUALIZACAO_DEMO} · {form.responsavel}</span>
        <div className="perfil-rodape__acoes">
          <Botao secundario onClick={descartar}>Descartar alterações</Botao>
          {botaoSalvar}
        </div>
      </div>
      <Aviso>Ambiente demonstrativo. Dados financeiros fictícios e mascarados; endereço de recebimento ilustrativo. Alterações de conta exigem validação da administradora antes de entrar em vigor. <Link to="/cadastro-entidade">Ver cadastro e documentos</Link></Aviso>
    </div>
  )
}
