import { Link } from 'react-router-dom'
import { Aviso, Botao, Secao } from '../components/Ui'

const titulos = { ajuda: 'Ajuda', privacidade: 'Privacidade', termos: 'Termos de uso' }

export default function Informacoes({ pagina }) {
  return (
    <section className="public-section info-publica">
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span>{titulos[pagina]}</div>
      <div className="public-page-title"><h1>{titulos[pagina]}</h1><p>Informações sobre o ambiente demonstrativo do DoaSync.</p></div>
      {pagina === 'ajuda' ? (
        <Secao titulo="Como testar a aplicação">
          <details open><summary>Como faço uma doação?</summary><p>Explore as campanhas, abra uma causa e clique em “Quero doar”. Escolha o valor, entre com sua conta de doador (ou crie uma) e confirme a doação via PIX. O comprovante fica disponível em Minhas doações.</p></details>
          <details><summary>Como acesso a gestão?</summary><p>Use Entrar e escolha o acesso demonstrativo. No Dashboard, acompanhe campanhas, doações, doadores, estoque, relatórios e configurações.</p></details>
          <details><summary>Os dados ficam salvos?</summary><p>As mudanças permanecem somente enquanto esta aplicação estiver aberta. Recarregar a página reinicia a amostra. Não é necessário iniciar um backend para testar os fluxos.</p></details>
          <details><summary>Por que alguns documentos estão indisponíveis?</summary><p>Comprovantes oficiais, cobranças e envio de mensagens dependem de serviços futuros. A interface informa quando uma operação não está disponível. As exportações locais de relatório usam somente a amostra.</p></details>
        </Secao>
      ) : pagina === 'privacidade' ? (
        <Secao titulo="Dados na demonstração">
          <p>Use apenas dados fictícios nos formulários. As alterações de campanhas, entidade, doações e equipe ficam na memória desta sessão; não são enviadas a um backend de produção.</p>
          <p>Arquivos selecionados servem para testar a interface. Não envie documentos pessoais, dados bancários ou informações de terceiros.</p>
          <p>A fonte e as imagens são servidas junto com o frontend. Para reiniciar os dados de teste, recarregue a página.</p>
          <Aviso>Esta página descreve o protótipo atual. A política de privacidade do serviço de produção deverá ser definida pela equipe antes da publicação.</Aviso>
        </Secao>
      ) : (
        <Secao titulo="Uso do protótipo">
          <p>O DoaSync apresentado aqui é um projeto demonstrativo para testar campanhas solidárias e sua gestão. Todas as pessoas, valores e operações da amostra são fictícios.</p>
          <p>Não há cobrança, transferência de dinheiro, confirmação bancária, envio de convites ou emissão de comprovante oficial. Registros e permissões alterados na interface não concedem acesso a sistemas reais.</p>
          <Aviso>Não use este ambiente para doações reais. Os termos do serviço de produção ainda serão definidos pela equipe.</Aviso>
        </Secao>
      )}
      <div className="acoes"><Botao para="/explorar">Explorar campanhas</Botao><Botao secundario para="/minhas-doacoes">Minhas doações</Botao></div>
    </section>
  )
}
