import { formatarMoeda } from './format'

export const paraNumero = (valor) => Number(String(valor).replace(',', '.'))
export const prestacaoInicial = () => ({ despesas: [], relato: '', anexos: [], publicada: false })
export const totalAplicado = (despesas) => despesas.reduce((soma, d) => soma + d.valor, 0)

// Validação de uma nova despesa (#94): vinculada à campanha e limitada ao arrecadado.
export function validarDespesa(form, campanha, despesas) {
  const erros = {}
  const valor = paraNumero(form.valor)
  if (!form.descricao.trim()) erros.descricao = 'Informe a aplicação do recurso.'
  if (!(valor > 0)) erros.valor = 'Valor deve ser maior que zero.'
  else if (totalAplicado(despesas) + valor > campanha.arrecadado)
    erros.valor = `O total aplicado não pode passar do arrecadado (${formatarMoeda(campanha.arrecadado)}).`
  return erros
}

// Itens do checklist "Pronto para prestar contas". Publicar exige todos.
export function checklist(prestacao, declaracao) {
  return [
    { chave: 'despesas', texto: 'Ao menos uma despesa registrada', ok: prestacao.despesas.length > 0 },
    { chave: 'relato', texto: 'Relato de aplicação dos recursos preenchido', ok: prestacao.relato.trim().length > 0 },
    { chave: 'anexos', texto: 'Comprovante anexado', ok: prestacao.anexos.length > 0 },
    { chave: 'declaracao', texto: 'Declaração de veracidade confirmada', ok: declaracao },
  ]
}
