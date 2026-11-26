// Carga de dados fictícios pela API real em um ambiente local de demonstração.
const api = new URL(process.env.DOASYNC_DEMO_API_URL
  ?? `http://127.0.0.1:${process.env.DOASYNC_PORT || 8080}/api/v1`)
if (api.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(api.hostname)
  || api.username || api.password || api.pathname !== '/api/v1' || api.search || api.hash) {
  throw new Error('A carga de demonstração exige uma API HTTP local em /api/v1.')
}
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@doasync.local', senha: process.env.ADMIN_PASSWORD }
const SENHA = process.env.DOASYNC_DEMO_PASSWORD
if (!ADMIN.senha || !SENHA || SENHA.length < 8 || SENHA === ADMIN.senha) {
  throw new Error('Defina ADMIN_PASSWORD e uma DOASYNC_DEMO_PASSWORD distinta com pelo menos 8 caracteres.')
}
const hoje = new Date()
const dia = (deslocamento) => new Date(hoje.getTime() + deslocamento * 86400000).toISOString().slice(0, 10)

const entidades = [
  {
    chave: 'apae',
    nome: 'Associação Exemplo de Inclusão',
    cnpj: '11.111.111/0001-11',
    campanhas: [
      { titulo: 'Cadeiras de rodas solidárias', descricao: 'Compra de 10 cadeiras de rodas adaptadas para os atendidos.', metaValor: 15000, dataInicio: dia(-20), dataFim: dia(30), categoria: 'Saúde' },
      { titulo: 'Natal solidário de demonstração', descricao: 'Presentes e ceia de Natal para as famílias atendidas.', metaValor: 5000, dataInicio: dia(-5), dataFim: dia(10), categoria: 'Assistência social' },
    ],
  },
  {
    chave: 'amor',
    nome: 'Associação Exemplo de Educação',
    cnpj: '22.222.222/0001-22',
    campanhas: [
      { titulo: 'Material pedagógico inclusivo', descricao: 'Livros e jogos adaptados para crianças com deficiência.', metaValor: 8000, dataInicio: dia(-30), dataFim: dia(60), categoria: 'Educação' },
      { titulo: 'Rascunho que não deve aparecer', descricao: 'Campanha em rascunho: nunca exibida na vitrine.', metaValor: 100, dataInicio: dia(-1), dataFim: dia(30), rascunho: true },
    ],
  },
]

async function chamar(metodo, caminho, corpo, token, chaveIdempotencia) {
  const resposta = await fetch(api.href + caminho, {
    method: metodo,
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(chaveIdempotencia && { 'Idempotency-Key': chaveIdempotencia }),
    },
    body: corpo && JSON.stringify(corpo),
  })
  const json = await resposta.json().catch(() => null)
  return { status: resposta.status, json }
}

async function login(email, senha) {
  const r = await chamar('POST', '/auth/login', { email, senha })
  if (r.status !== 200) throw new Error(`login ${email}: HTTP ${r.status}`)
  return r.json.data
}

const admin = await login(ADMIN.email, ADMIN.senha)
for (const e of entidades) {
  const email = `${e.chave}@doasync.local`
  const cadastro = await chamar('POST', '/entidades', {
    nome: e.nome, email, senha: SENHA, telefone: '48999990000', cnpj: e.cnpj,
    razaoSocial: e.nome, nomeFantasia: e.nome, descricao: `${e.nome} — entidade de teste.`,
  })
  if (cadastro.status !== 201 && cadastro.status !== 409) {
    throw new Error(`cadastro ${e.nome}: HTTP ${cadastro.status}`)
  }
  let sessao = await login(email, SENHA)
  if (sessao.usuario.statusEntidade !== 'APROVADA') {
    const aprovacao = await chamar('PATCH', `/entidades/${sessao.usuario.entidadeId}/status`, { status: 'APROVADA' }, admin.token)
    if (aprovacao.status !== 200) throw new Error(`aprovação ${e.nome}: HTTP ${aprovacao.status}`)
    sessao = await login(email, SENHA)
  }
  console.log(`✔ ${e.nome} (${email}) — ${sessao.usuario.statusEntidade}`)

  for (const c of e.campanhas) {
    const status = c.rascunho ? 'RASCUNHO' : 'ATIVA'
    const query = new URLSearchParams({ entidadeId: sessao.usuario.entidadeId, status, limit: '50' })
    const lista = await chamar('GET', `/campanhas?${query}`, undefined, sessao.token)
    if (lista.status !== 200) throw new Error(`listagem de campanhas: HTTP ${lista.status}`)
    if (lista.json.data.some(({ titulo }) => titulo === c.titulo)) continue
    const r = await chamar('POST', '/campanhas', c, sessao.token)
    if (r.status !== 201) throw new Error(`campanha ${c.titulo}: HTTP ${r.status}`)
    console.log(`  + ${c.titulo} → ${r.json.data.status}`)
  }
}

// Doador PF com dois registros demonstrativos na primeira campanha, sem movimentação bancária.
const doador = { email: 'maria@doasync.local', nome: 'Maria Souza' }
const cadastroDoador = await chamar('POST', '/doadores', {
  tipo: 'PESSOA_FISICA', nome: doador.nome, email: doador.email, senha: SENHA,
  telefone: '48988887777', cpf: '529.982.247-25', dataNascimento: '1990-05-15',
})
if (cadastroDoador.status !== 201 && cadastroDoador.status !== 409) {
  throw new Error(`cadastro doador: HTTP ${cadastroDoador.status}`)
}
const sessaoDoador = await login(doador.email, SENHA)
console.log(`✔ ${doador.nome} (${doador.email}) — doador`)
const vitrine = await chamar('GET', '/campanhas?limit=50')
if (vitrine.status !== 200) throw new Error(`vitrine: HTTP ${vitrine.status}`)
const alvo = vitrine.json.data.find((c) => c.titulo === entidades[0].campanhas[0].titulo)
if (alvo) {
  for (const [valor, anonima] of [[150, false], [80, true]]) {
    const r = await chamar('POST', '/doacoes', { campanhaId: alvo.id, valor, formaPagamento: 'PIX', anonima },
      sessaoDoador.token, `doasync-demo-${alvo.id}-${valor}`)
    if (r.status !== 201 && r.status !== 200) throw new Error(`doação: HTTP ${r.status}`)
    if (r.status === 201) console.log(`  + registro de demonstração de R$ ${valor}${anonima ? ' (anônimo)' : ''}`)
  }
}

const final = await chamar('GET', '/campanhas?limit=50')
if (final.status !== 200) throw new Error(`vitrine após carga: HTTP ${final.status}`)
console.log(`\nVitrine pública: ${final.json.data.length} campanha(s)`)
for (const c of final.json.data) console.log(`  • ${c.titulo} — ${c.status} — R$ ${c.valorArrecadado} (${c.percentualAtingido}%) — /campanhas/${c.id}`)
