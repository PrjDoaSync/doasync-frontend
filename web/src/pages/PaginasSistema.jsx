import { useNavigate } from 'react-router-dom'
import { Botao, Vazio } from '../components/Ui'
import { useAuth } from '../hooks/useAuth'

function Acoes({ children }) {
  return (
    <div className="acoes" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
      {children}
    </div>
  )
}

export function NaoEncontrada() {
  return (
    <section className="public-section">
      <Vazio principal titulo="Página não encontrada">
        O endereço que você acessou não existe ou foi movido.
      </Vazio>
      <Acoes>
        <Botao para="/">Voltar ao início</Botao>
        <Botao para="/explorar" secundario>Explorar campanhas</Botao>
      </Acoes>
    </section>
  )
}

export function AcessoRestrito() {
  const { usuario, autenticado, sair } = useAuth()
  const navigate = useNavigate()
  return (
    <section className="public-section">
      <Vazio principal titulo="Acesso restrito">
        A área de gestão é exclusiva para entidades e administradores.
      </Vazio>
      <Acoes>
        <Botao para="/">Voltar ao início</Botao>
        <Botao para="/explorar" secundario>Explorar campanhas</Botao>
        {usuario?.tipo === 'DOADOR' && (
          <Botao para="/minhas-doacoes" secundario>Minhas doações</Botao>
        )}
        {autenticado && (
          <Botao
            secundario
            onClick={() => {
              sair()
              navigate('/login')
            }}
          >
            Sair e entrar com outra conta
          </Botao>
        )}
      </Acoes>
    </section>
  )
}

export function ServicoIndisponivel() {
  const navigate = useNavigate()
  return (
    <section className="public-section">
      <Vazio principal titulo="Serviço indisponível">
        Não conseguimos falar com o servidor agora. Ele pode estar fora do ar ou em manutenção. Tente novamente em instantes.
      </Vazio>
      <Acoes>
        <Botao onClick={() => navigate(-1)}>Tentar novamente</Botao>
        <Botao para="/" secundario>Voltar ao início</Botao>
      </Acoes>
    </section>
  )
}
