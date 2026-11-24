import { useLocation } from 'react-router-dom'
import { Aviso, Botao, Campo, Icon } from '../Ui'
import { useAuth } from '../../hooks/useAuth'
import { ehDoador } from '../../utils/auth'

// POST /doacoes exige um doador (pessoa física ou jurídica) autenticado.
export default function IdentificacaoDoador({ anonima, onAnonima, observacao, onObservacao, onVoltar, onContinuar }) {
  const { usuario, sair } = useAuth()
  const { pathname } = useLocation()

  if (!usuario)
    return (
      <div className="pilha">
        <Aviso>Para doar, entre com a sua conta de doador ou crie uma. Depois você volta direto para esta doação.</Aviso>
        <div className="acoes">
          <Botao secundario onClick={onVoltar}>Voltar à contribuição</Botao>
          <Botao secundario para="/cadastro-doador" state={{ de: pathname }}>
            Criar conta de doador
          </Botao>
          <Botao para="/login" state={{ de: pathname }}>
            Entrar para doar <Icon nome="seta" />
          </Botao>
        </div>
      </div>
    )

  if (!ehDoador(usuario.tipo))
    return (
      <div className="pilha">
        <Aviso erro>Doações são feitas por contas de doador (pessoa física ou jurídica). Você entrou como {usuario.nome}.</Aviso>
        <div className="acoes">
          <Botao secundario onClick={onVoltar}>Voltar à contribuição</Botao>
          <Botao secundario onClick={sair}>Sair e entrar como doador</Botao>
        </div>
      </div>
    )

  return (
    <form
      className="pilha"
      onSubmit={(e) => {
        e.preventDefault()
        onContinuar()
      }}
    >
      <p>
        Doando como <strong>{usuario.nome}</strong> ({usuario.email})
      </p>
      <label className="doa-anonima">
        <input type="checkbox" checked={anonima} onChange={(e) => onAnonima(e.target.checked)} />
        Doação anônima: meu nome não aparece para a entidade nem na campanha
      </label>
      <Campo
        rotulo="Mensagem para a entidade (opcional)"
        maxLength={500}
        value={observacao}
        onChange={(e) => onObservacao(e.target.value)}
      />
      <div className="acoes">
        <Botao secundario onClick={onVoltar}>Voltar à contribuição</Botao>
        <Botao type="submit">
          Revisar doação <Icon nome="seta" />
        </Botao>
      </div>
    </form>
  )
}
