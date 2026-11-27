// Regras do cadastro de entidade (POST /entidades). O backend valida os obrigatórios,
// a senha, o par responsável nome+CPF (RN46) e a duplicidade, mas NÃO valida endereço,
// CEP, UF nem formatos: sem isso o banco rejeita o INSERT com 500. Por isso fica tudo aqui.
import { validarCnpj } from './gestao'
import { formatarCnpj, formatarCpf, validarCpf } from './cadastroDoador'

const soDigitos = (v) => String(v ?? '').replace(/\D/g, '')
const preenchido = (v) => String(v ?? '').trim().length > 0
export const AREAS_ATUACAO = ['Assistência social e alimentação', 'Educação', 'Saúde', 'Meio ambiente', 'Proteção animal', 'Outros']

export const formatarCep = (v) => soDigitos(v).replace(/^(\d{5})(\d{3})$/, '$1-$2')

// Campos do endereço obrigatórios no banco (o complemento é opcional).
const CAMPOS_ENDERECO = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf']
const temEndereco = (f) => [...CAMPOS_ENDERECO, 'complemento'].some((c) => preenchido(f[c]))

// Retorna { campo: mensagem }. Os nomes seguem a API; o endereço usa os nomes do formulário.
export function validarCadastroEntidade(f) {
  const erros = {}
  if (!preenchido(f.nome)) erros.nome = 'Nome da entidade é obrigatório.'
  if (!preenchido(f.razaoSocial)) erros.razaoSocial = 'Razão social é obrigatória.'
  if (!validarCnpj(f.cnpj)) erros.cnpj = 'CNPJ inválido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email?.trim() ?? '')) erros.email = 'E-mail inválido.'
  if ((f.senha ?? '').length < 8) erros.senha = 'Senha deve ter no mínimo 8 caracteres.'
  if (f.senha !== f.confirmacao) erros.confirmacao = 'As senhas não conferem.'
  const digitosTelefone = soDigitos(f.telefone).length
  if (digitosTelefone < 10 || String(f.telefone).trim().length > 20) erros.telefone = 'Informe o telefone com DDD.'
  if (!preenchido(f.descricao)) erros.descricao = 'Descrição é obrigatória.'
  return { ...erros, ...validarResponsavelEEndereco(f) }
}

// Responsável (RN46: nome e CPF juntos) e endereço (tudo ou nada). Usado no cadastro e no perfil.
export function validarResponsavelEEndereco(f) {
  const erros = {}
  if (preenchido(f.responsavelNome) || preenchido(f.responsavelCpf)) {
    if (!preenchido(f.responsavelNome)) erros.responsavelNome = 'Informe o nome do responsável junto com o CPF.'
    if (!validarCpf(f.responsavelCpf)) erros.responsavelCpf = 'CPF do responsável inválido.'
  }
  if (temEndereco(f)) {
    for (const campo of CAMPOS_ENDERECO) if (!preenchido(f[campo])) erros[campo] = 'Obrigatório ao informar o endereço.'
    if (preenchido(f.cep) && soDigitos(f.cep).length !== 8) erros.cep = 'CEP deve ter 8 dígitos.'
    if (preenchido(f.uf) && !/^[A-Za-z]{2}$/.test(f.uf.trim())) erros.uf = 'Use a sigla do estado (ex.: SC).'
  }
  return erros
}

// Endereço no formato da API, ou undefined quando o formulário não tem endereço.
export function corpoEndereco(f) {
  if (!temEndereco(f)) return undefined
  return {
    logradouro: f.logradouro.trim(),
    numero: f.numero.trim(),
    complemento: preenchido(f.complemento) ? f.complemento.trim() : undefined,
    bairro: f.bairro.trim(),
    cidade: f.cidade.trim(),
    uf: f.uf.trim().toUpperCase(),
    cep: formatarCep(f.cep),
  }
}

// Corpo de POST /entidades: formata CNPJ/CPF/CEP, normaliza a UF e omite opcionais vazios.
export function corpoCadastroEntidade(f) {
  const opcional = (v) => (preenchido(v) ? v.trim() : undefined)
  const corpo = {
    nome: f.nome.trim(),
    email: f.email.trim(),
    senha: f.senha,
    telefone: f.telefone.trim(),
    cnpj: formatarCnpj(f.cnpj),
    razaoSocial: f.razaoSocial.trim(),
    descricao: f.descricao.trim(),
    // O nome público da entidade (vitrine, campanhas) vem de nomeFantasia.
    nomeFantasia: f.nome.trim(),
    areaAtuacao: opcional(f.areaAtuacao),
    site: opcional(f.site),
  }
  if (preenchido(f.responsavelNome)) {
    corpo.responsavelNome = f.responsavelNome.trim()
    corpo.responsavelCpf = formatarCpf(f.responsavelCpf)
  }
  const endereco = corpoEndereco(f)
  if (endereco) corpo.endereco = endereco
  return corpo
}
