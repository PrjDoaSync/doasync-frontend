import { Aviso, Botao, Campo, Icon } from '../Ui'

const OPCOES = [
  ['conta', 'Já tenho uma conta', 'enviar', 'Acesse sua conta para acompanhar suas doações.'],
  ['rapido', 'Cadastro rápido', 'doadores', 'Identifique esta contribuição sem criar uma senha.'],
  ['anonimo', 'Doação anônima', 'doadores', 'Continue sem exibir seu nome na campanha.'],
]

export default function IdentificacaoDoador({ valor, onEscolher, doador, financeira, erro, onVoltar, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="doa-identificacao-form">
      <fieldset className="doa-identificacao-cards">
        <legend className="sr-only">Identificação do doador</legend>
        {OPCOES.map(([id, titulo, icone, descricao]) => (
          <div className={`cartao doa-identificacao-card ${valor === id ? 'selecionado' : ''}`} key={id}>
            <label className="doa-identificacao-escolha">
              <Icon nome={icone} />
              <input type="radio" name="identificacao" value={id} checked={valor === id} onChange={() => onEscolher(id)} />
              <strong>{titulo}</strong>
            </label>
            <p>{descricao}</p>
            {valor === id && id !== 'anonimo' && (
              <>
                <Campo rotulo="Nome completo" name="nome" required defaultValue={doador.nome} autoComplete="name" />
                <Campo rotulo="E-mail" name="email" type="email" required defaultValue={doador.email} autoComplete="email" />
              </>
            )}
            {id === 'conta' && <Aviso>A autenticação ainda não está integrada. Aqui você continua apenas na demonstração, sem informar senha.</Aviso>}
            {id === 'anonimo' && <Aviso>Seu nome não será exibido. Não pedimos nome, e-mail ou senha nesta opção. Sem e-mail, nenhum comprovante é enviado.</Aviso>}
            {id === 'rapido' && <small>Os dados ficam nesta sessão. Nenhuma conta é criada ou mensagem enviada.</small>}
          </div>
        ))}
      </fieldset>
      {erro && <Aviso erro>{erro}</Aviso>}
      <div className="acoes">
        <Botao secundario onClick={onVoltar}>{financeira ? 'Voltar à contribuição' : 'Voltar aos itens'}</Botao>
        <Botao type="submit">{financeira ? 'Continuar para o pagamento' : 'Continuar para o agendamento'} <Icon nome="seta" /></Botao>
      </div>
    </form>
  )
}
