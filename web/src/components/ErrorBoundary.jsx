import { Component } from 'react'
import { Link } from 'react-router-dom'

// Última rede de proteção: um erro de renderização mostra uma tela amigável em vez de página em branco.
export default class ErrorBoundary extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro inesperado na interface:', erro, info?.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <section className="public-section">
        <div className="vazio" role="alert">
          <h1>Algo deu errado</h1>
          <p>Ocorreu um erro inesperado ao exibir esta página. Você pode tentar novamente ou voltar ao início.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button type="button" className="botao" onClick={() => this.setState({ erro: null })}>
            Tentar novamente
          </button>
          <Link to="/" className="botao botao--secundario">Voltar ao início</Link>
        </div>
      </section>
    )
  }
}
