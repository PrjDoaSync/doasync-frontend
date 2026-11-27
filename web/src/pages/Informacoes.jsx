import { Link } from 'react-router-dom'
import { Aviso, Botao, Secao } from '../components/Ui'

const titulos = { ajuda: 'Ajuda', privacidade: 'Privacidade', termos: 'Termos de uso' }
const descricoes = {
  ajuda: 'Respostas rápidas sobre o uso do DoaSync.',
  privacidade: 'Como o DoaSync trata os dados informados nesta versão.',
  termos: 'Condições de uso desta versão do DoaSync.',
}

export default function Informacoes({ pagina }) {
  return (
    <section className="public-section info-publica">
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span>{titulos[pagina]}</div>
      <div className="public-page-title"><h1>{titulos[pagina]}</h1><p>{descricoes[pagina]}</p></div>
      {pagina === 'ajuda' ? (
        <Secao titulo="Perguntas frequentes">
          <details open><summary>Como faço uma doação?</summary><p>Explore as campanhas, abra uma causa e clique em “Quero doar”. Escolha o valor, entre com sua conta de doador (ou crie uma) e confirme a doação via PIX. A doação é registrada na campanha e o comprovante fica disponível em Minhas doações. Nesta versão, o PIX é apenas registrado: nenhuma cobrança real é feita.</p></details>
          <details><summary>Como acesso a gestão?</summary><p>Entre com o e-mail e a senha da conta da entidade. Depois da aprovação do cadastro, o painel permite criar e acompanhar campanhas, ver as doações recebidas, os doadores e os dashboards.</p></details>
          <details><summary>Meus dados ficam salvos?</summary><p>Sim. Conta, campanhas e doações são gravadas na API do DoaSync. Apenas as telas identificadas como demonstração (controle de itens, equipe da entidade e prestação de contas) usam dados de exemplo que valem só durante a sessão e somem ao recarregar a página.</p></details>
          <details><summary>O que ainda não está disponível?</summary><p>Doação de itens, pagamento por cartão ou boleto, controle de estoque, convite de equipe, prestação de contas, envio de mensagens e emissão de comprovantes oficiais dependem de integrações futuras. A interface avisa quando uma tela ou operação ainda não está integrada.</p></details>
        </Secao>
      ) : pagina === 'privacidade' ? (
        <Secao titulo="Seus dados no DoaSync">
          <p>Para criar uma conta, o DoaSync trata os dados que você informa no cadastro (como nome, e-mail e, no caso de entidades, os dados da organização) e o histórico das doações registradas. Esses dados são usados apenas para autenticar o acesso, exibir campanhas e doações e gerar os painéis da gestão.</p>
          <p>Nas telas identificadas como demonstração, os dados são fictícios e permanecem apenas na memória do navegador durante a sessão; não são enviados à API. Não informe documentos pessoais, dados bancários ou dados de terceiros em campos de teste.</p>
          <p>Nos termos da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018), você pode solicitar acesso, correção ou exclusão dos seus dados à equipe responsável pelo projeto.</p>
          <Aviso>Esta página resume o tratamento de dados da versão atual. A política de privacidade completa e o canal oficial de atendimento ao titular ainda serão definidos pela equipe antes da publicação.</Aviso>
        </Secao>
      ) : (
        <Secao titulo="Condições de uso">
          <p>O DoaSync conecta doadores, entidades e campanhas solidárias. Esta versão é um projeto de extensão acadêmica e está em fase de validação: use-a apenas para avaliar os fluxos de campanhas e de gestão.</p>
          <p>As doações via PIX são apenas registradas na campanha: não há cobrança, transferência de dinheiro nem confirmação bancária, e o comprovante não tem valor oficial. Doação de itens, cartão, boleto, controle de estoque, equipe e prestação de contas dependem de integrações futuras.</p>
          <Aviso>Não use este ambiente para doações reais. Os termos de uso do serviço em produção ainda serão definidos pela equipe.</Aviso>
        </Secao>
      )}
      <div className="acoes"><Botao para="/explorar">Explorar campanhas</Botao><Botao secundario para="/minhas-doacoes">Minhas doações</Botao></div>
    </section>
  )
}
