import { formatarMoeda } from './format'

// Validação da edição de campanha publicada (issue #92).
// Regras do protótipo: meta não pode ser menor que o total já recebido e o
// término não pode ser anterior ao início (que não é editável após publicar).
export function validarEdicao(form, campanha) {
  const erros = {}
  const meta = Number(String(form.meta).replace(',', '.'))
  if (!form.nome.trim()) erros.nome = 'Título não pode ser vazio.'
  if (!form.descricao.trim()) erros.descricao = 'Descrição não pode ser vazia.'
  if (!(meta > 0)) erros.meta = 'Meta deve ser maior que zero.'
  else if (meta < campanha.arrecadado)
    erros.meta = `A meta não pode ser menor que o total recebido (${formatarMoeda(campanha.arrecadado)}).`
  if (!form.encerraEm) erros.encerraEm = 'Data de término é obrigatória.'
  else if (form.encerraEm < campanha.criadaEm)
    erros.encerraEm = 'Data de término deve ser igual ou posterior à data de início.'
  return erros
}
