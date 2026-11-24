// Regras do cadastro de doador (POST /doadores). O backend valida obrigatoriedade, senha,
// idade e duplicidade, mas não confere os dígitos de CPF/CNPJ: isso fica aqui.
import { validarCnpj } from './gestao'

export function validarCpf(valor) {
  const d = String(valor ?? '').replace(/\D/g, '')
  if (!/^\d{11}$/.test(d) || /^(\d)\1+$/.test(d)) return false
  const digito = (n) => {
    const soma = d.slice(0, n).split('').reduce((s, c, i) => s + Number(c) * (n + 1 - i), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

// Anos completos entre a data de nascimento (yyyy-mm-dd) e hoje (yyyy-mm-dd).
export function idade(nascimento, hoje) {
  const [a, m, d] = nascimento.split('-').map(Number)
  const [ah, mh, dh] = hoje.split('-').map(Number)
  return ah - a - (mh < m || (mh === m && dh < d) ? 1 : 0)
}

// Retorna { campo: mensagem } com os mesmos nomes de campo da API.
export function validarCadastroDoador(f, hoje) {
  const erros = {}
  if (!f.nome?.trim()) erros.nome = 'Nome é obrigatório.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email?.trim() ?? '')) erros.email = 'E-mail inválido.'
  if ((f.senha ?? '').length < 8) erros.senha = 'Senha deve ter no mínimo 8 caracteres.'
  if (f.senha !== f.confirmacao) erros.confirmacao = 'As senhas não conferem.'
  if (String(f.telefone ?? '').replace(/\D/g, '').length < 10) erros.telefone = 'Informe o telefone com DDD.'
  if (f.tipo === 'PESSOA_FISICA') {
    if (!validarCpf(f.cpf)) erros.cpf = 'CPF inválido.'
    if (!f.dataNascimento) erros.dataNascimento = 'Data de nascimento é obrigatória.'
    else if (idade(f.dataNascimento, hoje) < 18) erros.dataNascimento = 'Idade mínima de 18 anos.'
  } else {
    if (!validarCnpj(f.cnpj)) erros.cnpj = 'CNPJ inválido.'
    if (!f.razaoSocial?.trim()) erros.razaoSocial = 'Razão social é obrigatória.'
  }
  return erros
}

// O banco exige CPF/CNPJ com máscara (CHECK de 14 e 18 caracteres) e o backend não normaliza:
// sem máscara o INSERT falha com 500. Por isso o envio sempre formata.
const soDigitos = (v) => String(v ?? '').replace(/\D/g, '')
export const formatarCpf = (v) => soDigitos(v).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
export const formatarCnpj = (v) => soDigitos(v).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

// Corpo de POST /doadores: só os campos do tipo escolhido.
export function corpoCadastroDoador(f) {
  const base = { tipo: f.tipo, nome: f.nome.trim(), email: f.email.trim(), senha: f.senha, telefone: f.telefone.trim() }
  return f.tipo === 'PESSOA_FISICA'
    ? { ...base, cpf: formatarCpf(f.cpf), dataNascimento: f.dataNascimento }
    : { ...base, cnpj: formatarCnpj(f.cnpj), razaoSocial: f.razaoSocial.trim() }
}
