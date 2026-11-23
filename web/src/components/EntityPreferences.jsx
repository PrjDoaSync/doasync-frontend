import { Aviso, Campo, Secao } from './Ui'

const notificacoes = ['Doações confirmadas', 'Entregas de itens agendadas', 'Metas e fim de campanha', 'Convites e mudanças de acesso', 'Resumo semanal', 'Novidades do DoaSync']

export default function EntityPreferences({ form, setForm }) {
  const alterar = (event) => setForm((atual) => ({ ...atual, [event.target.name]: event.target.value }))
  return (
    <>
      <div className="form-grid">
        <Secao titulo="Recebimento financeiro" descricao="Configuração demonstrativa, sem cobrança ou transferência.">
          <Aviso>Use apenas dados fictícios para testar. Nenhuma conta bancária é verificada.</Aviso>
          <Campo rotulo="Banco de demonstração" name="bancoDemo" value={form.bancoDemo ?? ''} onChange={alterar} maxLength={100} placeholder="Banco de exemplo" />
          <Campo rotulo="Titular de demonstração" name="titularDemo" value={form.titularDemo ?? ''} onChange={alterar} maxLength={150} />
          <Campo rotulo="Chave PIX de demonstração" name="pixDemo" value={form.pixDemo ?? ''} onChange={alterar} maxLength={150} ajuda="Não informe uma chave real. Não é usada para gerar cobranças." />
        </Secao>
        <Secao titulo="Recebimento de itens" descricao="Ponto de referência para entregas demonstrativas.">
          <Campo rotulo="Local de recebimento" name="localRecebimento" value={form.localRecebimento ?? ''} onChange={alterar} maxLength={150} placeholder="Sede da entidade" />
          <Campo rotulo="Endereço de demonstração" name="enderecoRecebimento" value={form.enderecoRecebimento ?? ''} onChange={alterar} maxLength={200} />
          <Campo rotulo="Horário de entrega" name="horarioRecebimento" value={form.horarioRecebimento ?? ''} onChange={alterar} maxLength={100} placeholder="Segunda a sexta, das 9h às 17h" />
          <Campo rotulo="Orientações de entrega"><textarea name="orientacoesRecebimento" value={form.orientacoesRecebimento ?? ''} onChange={alterar} rows={3} maxLength={500} /></Campo>
        </Secao>
      </div>
      <Secao titulo="Notificações da entidade" descricao="Preferências locais; nenhuma mensagem é enviada.">
        <div className="form-grid">
          {notificacoes.map((nome) => (
            <label className="preferencia" key={nome}>
              <span>{nome}</span>
              <input type="checkbox" role="switch" checked={form.preferencias?.[nome] ?? false} onChange={(event) => {
                const checked = event.target.checked
                setForm((atual) => ({ ...atual, preferencias: { ...atual.preferencias, [nome]: checked } }))
              }} />
            </label>
          ))}
        </div>
      </Secao>
    </>
  )
}
