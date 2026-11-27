import { Botao, Vazio } from './Ui'

// Estado de campanha inexistente (ou sem acesso) nas telas de gestão.
export default function CampanhaNaoEncontrada() {
  return (
    <>
      <Vazio titulo="Campanha não encontrada" principal>
        Verifique o endereço ou volte para a lista de campanhas.
      </Vazio>
      <Botao para="/campanhas">Voltar para campanhas</Botao>
    </>
  )
}
