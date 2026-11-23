// Popula o backend local (H2 em memória) com entidades aprovadas e campanhas de teste.
// Uso: node scripts/popular-api.mjs   (backend rodando em http://localhost:8080)
// Pode ser executado de novo: entidades e campanhas já existentes são reaproveitadas.
const API = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
const ADMIN = { email: 'admin@doasync.local', senha: 'admin12345' }
const SENHA = 'senha1234'
const hoje = new Date()
const dia = (deslocamento) => new Date(hoje.getTime() + deslocamento * 86400000).toISOString().slice(0, 10)

const entidades = [
  {
    chave: 'apae',
    nome: 'APAE Florianópolis',
    cnpj: '11.111.111/0001-11',
    campanhas: [
      { titulo: 'Cadeiras de rodas para a APAE', descricao: 'Compra de 10 cadeiras de rodas adaptadas para os atendidos.', metaValor: 15000, dataInicio: dia(-20), dataFim: dia(30), categoria: 'Saúde' },
      { titulo: 'Natal solidário APAE', descricao: 'Presentes e ceia de Natal para as famílias atendidas.', metaValor: 5000, dataInicio: dia(-5), dataFim: dia(10), categoria: 'Assistência social' },
    ],
  },
  {
    chave: 'amor',
    nome: 'Associação Amor Inclusivo',
    cnpj: '22.222.222/0001-22',
    campanhas: [
      { titulo: 'Material pedagógico inclusivo', descricao: 'Livros e jogos adaptados para crianças com deficiência.', metaValor: 8000, dataInicio: dia(-30), dataFim: dia(60), categoria: 'Educação' },
      { titulo: 'Rascunho que não deve aparecer', descricao: 'Campanha em rascunho: nunca exibida na vitrine.', metaValor: 100, dataInicio: dia(-1), dataFim: dia(30), rascunho: true },
    ],
  },
]

async function chamar(metodo, caminho, corpo, token) {
  const resposta = await fetch(API + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: corpo && JSON.stringify(corpo),
  })
  const json = await resposta.json().catch(() => null)
  return { status: resposta.status, json }
}

async function login(email, senha) {
  const r = await chamar('POST', '/auth/login', { email, senha })
  if (r.status !== 200) throw new Error(`login ${email}: HTTP ${r.status} ${JSON.stringify(r.json)}`)
  return r.json.data
}

const admin = await login(ADMIN.email, ADMIN.senha)
const vitrine = (await chamar('GET', '/campanhas?limit=50')).json?.data ?? []
const titulosExistentes = new Set(vitrine.map((c) => c.titulo))

for (const e of entidades) {
  const email = `${e.chave}@doasync.local`
  const cadastro = await chamar('POST', '/entidades', {
    nome: e.nome, email, senha: SENHA, telefone: '48999990000', cnpj: e.cnpj,
    razaoSocial: e.nome, nomeFantasia: e.nome, descricao: `${e.nome} — entidade de teste.`,
  })
  if (cadastro.status !== 201 && cadastro.status !== 409) {
    throw new Error(`cadastro ${e.nome}: HTTP ${cadastro.status} ${JSON.stringify(cadastro.json)}`)
  }
  let sessao = await login(email, SENHA)
  if (sessao.usuario.statusEntidade !== 'APROVADA') {
    await chamar('PATCH', `/entidades/${sessao.usuario.entidadeId}/status`, { status: 'APROVADA' }, admin.token)
    sessao = await login(email, SENHA)
  }
  console.log(`✔ ${e.nome} (${email} / ${SENHA}) — ${sessao.usuario.statusEntidade}`)

  for (const c of e.campanhas) {
    if (titulosExistentes.has(c.titulo) || c.rascunho) {
      // Rascunhos não aparecem na vitrine; só cria na primeira execução (quando a entidade é nova).
      if (!(c.rascunho && cadastro.status === 201)) continue
    }
    const r = await chamar('POST', '/campanhas', c, sessao.token)
    if (r.status !== 201) throw new Error(`campanha ${c.titulo}: HTTP ${r.status} ${JSON.stringify(r.json)}`)
    console.log(`  + ${c.titulo} → ${r.json.data.status}`)
  }
}

// Doador PF com duas doações PIX (uma anônima) na primeira campanha, se ela ainda não arrecadou.
const doador = { email: 'maria@doasync.local', nome: 'Maria Souza' }
const cadastroDoador = await chamar('POST', '/doadores', {
  tipo: 'PESSOA_FISICA', nome: doador.nome, email: doador.email, senha: SENHA,
  telefone: '48988887777', cpf: '529.982.247-25', dataNascimento: '1990-05-15',
})
if (cadastroDoador.status !== 201 && cadastroDoador.status !== 409) {
  throw new Error(`cadastro doador: HTTP ${cadastroDoador.status} ${JSON.stringify(cadastroDoador.json)}`)
}
const sessaoDoador = await login(doador.email, SENHA)
console.log(`✔ ${doador.nome} (${doador.email} / ${SENHA}) — doador`)
const alvo = (await chamar('GET', '/campanhas?limit=50')).json.data.find((c) => c.titulo === entidades[0].campanhas[0].titulo)
if (alvo && Number(alvo.valorArrecadado) === 0) {
  for (const [valor, anonima] of [[150, false], [80, true]]) {
    const r = await chamar('POST', '/doacoes', { campanhaId: alvo.id, valor, formaPagamento: 'PIX', anonima }, sessaoDoador.token)
    if (r.status !== 201) throw new Error(`doação: HTTP ${r.status} ${JSON.stringify(r.json)}`)
    console.log(`  + doação R$ ${valor}${anonima ? ' (anônima)' : ''} em "${alvo.titulo}"`)
  }
}

const final = (await chamar('GET', '/campanhas?limit=50')).json.data
console.log(`\nVitrine pública: ${final.length} campanha(s)`)
for (const c of final) console.log(`  • ${c.titulo} — ${c.status} — R$ ${c.valorArrecadado} (${c.percentualAtingido}%) — /campanhas/${c.id}`)
