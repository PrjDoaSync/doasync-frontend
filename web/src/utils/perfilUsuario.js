// Validação de Minha conta (PATCH /usuarios/me): nome obrigatório, telefone opcional e
// troca de senha só com a senha atual, nova senha de 8+ caracteres e confirmação igual.
export function validarPerfilUsuario({ nome, telefone, senhaAtual, novaSenha, confirmacao }) {
  const erros = {}
  if (!String(nome ?? '').trim()) erros.nome = 'Informe seu nome.'
  const digitos = String(telefone ?? '').replace(/\D/g, '')
  if (String(telefone ?? '').trim() && (digitos.length < 10 || digitos.length > 13))
    erros.telefone = 'Informe o telefone com DDD.'
  const trocando = Boolean(senhaAtual || novaSenha || confirmacao)
  if (trocando) {
    if (!senhaAtual) erros.senhaAtual = 'Informe a senha atual para trocar a senha.'
    if (String(novaSenha ?? '').length < 8) erros.novaSenha = 'A nova senha deve ter pelo menos 8 caracteres.'
    else if (novaSenha === senhaAtual) erros.novaSenha = 'A nova senha deve ser diferente da atual.'
    if (confirmacao !== novaSenha) erros.confirmacao = 'A confirmação não confere com a nova senha.'
  }
  return erros
}
