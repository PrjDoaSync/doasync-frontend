// Suíte E2E da API REAL do DoaSync (sem dependências: Node 22+, fetch nativo).
//
// Uso:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/e2e-api.mjs            # suíte completa
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/e2e-api.mjs --seed     # só dados de homologação
//
// Variáveis: API_URL (padrão http://localhost:8090/api/v1 — Nginx do Docker; local: http://localhost:8080/api/v1),
//            ADMIN_EMAIL e ADMIN_PASSWORD (obrigatórias; nunca grave a senha no arquivo).
// Idempotente: cada execução usa um sufixo único em e-mails/documentos. Nenhum pagamento real é feito
// (a API apenas registra o PIX). Dados 100% fictícios; CPF/CNPJ gerados por algoritmo.
import assert from 'node:assert/strict'
import { randomBytes, randomInt } from 'node:crypto'

const API = (process.env.API_URL ?? 'http://localhost:8090/api/v1').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SEED = process.argv.includes('--seed')

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.')
  process.exit(2)
}

const sufixo = `${Date.now().toString(36)}${randomBytes(2).toString('hex')}`
const senhaTeste = `Tst${randomBytes(6).toString('hex')}!`
const dia = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10)
const UUID_INEXISTENTE = '00000000-0000-4000-8000-000000000000'

// ---------- geradores de documentos válidos ----------
function digitosCpf() {
  const n = Array.from({ length: 9 }, () => randomInt(0, 10))
  if (n.every((x) => x === n[0])) n[0] = (n[0] + 1) % 10
  for (const tam of [9, 10]) {
    const soma = n.reduce((a, d, i) => a + d * (tam + 1 - i), 0)
    const r = (soma * 10) % 11
    n.push(r === 10 ? 0 : r)
  }
  return n.join('')
}
function digitosCnpj() {
  const n = [...Array.from({ length: 8 }, () => randomInt(0, 10)), 0, 0, 0, 1]
  for (const pesos of [[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]]) {
    const soma = pesos.reduce((a, p, i) => a + p * n[i], 0)
    const r = soma % 11
    n.push(r < 2 ? 0 : 11 - r)
  }
  return n.join('')
}
const trocarUltimo = (d) => `${d.slice(0, -1)}${(Number(d.at(-1)) + 1) % 10}`
const cpfInvalido = () => fmtCpf(trocarUltimo(digitosCpf()))
const cnpjInvalido = () => fmtCnpj(trocarUltimo(digitosCnpj()))
const fmtCpf = (d) => `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
const fmtCnpj = (d) => `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`

// ---------- cliente HTTP ----------
const achados500 = []
async function chamar(metodo, caminho, { corpo, token, headers } = {}) {
  const resposta = await fetch(API + caminho, {
    method: metodo,
    headers: {
      ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  })
  const texto = await resposta.text()
  let json = null
  try { json = JSON.parse(texto) } catch { /* corpo não JSON */ }
  if (resposta.status >= 500) achados500.push({ metodo, caminho, status: resposta.status, corpo: texto.slice(0, 300) })
  return { status: resposta.status, json, texto }
}
const dados = (r) => r.json?.data

async function login(email, senha) {
  const r = await chamar('POST', '/auth/login', { corpo: { email, senha } })
  assert.equal(r.status, 200, `login ${email}: HTTP ${r.status} ${r.texto.slice(0, 200)}`)
  return { token: dados(r).token, usuario: dados(r).usuario }
}

// ---------- cadastros reutilizáveis ----------
function corpoEntidade(rotulo) {
  const cnpj = fmtCnpj(digitosCnpj())
  return {
    nome: `Entidade ${rotulo} ${sufixo}`, email: `e2e.ent.${rotulo}.${sufixo}@example.test`, senha: senhaTeste,
    telefone: '48999990000', cnpj, razaoSocial: `Entidade ${rotulo} ${sufixo} LTDA`,
    nomeFantasia: `Entidade ${rotulo} ${sufixo}`, descricao: 'Entidade fictícia de teste E2E.',
  }
}
const corpoCampanha = (titulo, extra = {}) => ({
  titulo: `${titulo} ${sufixo}`, descricao: 'Campanha fictícia criada pela suíte E2E.', metaValor: 1000,
  dataInicio: dia(-1), dataFim: dia(30), categoria: 'Teste', ...extra,
})

// ---------- framework de passos ----------
const resultados = []
async function passo(nome, esperado, fn) {
  try {
    await fn()
    resultados.push({ nome, esperado, ok: true, detalhe: 'OK' })
  } catch (e) {
    resultados.push({ nome, esperado, ok: false, detalhe: String(e.message).split('\n')[0].slice(0, 220) })
  }
}
function esperar(r, status, rotulo = '') {
  assert.equal(r.status, status, `${rotulo} esperado HTTP ${status}, recebido ${r.status}: ${r.texto.slice(0, 200)}`)
}

// ---------- modo seed ----------
async function seed() {
  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
  const contas = []
  const criarEntidade = async (rotulo, aprovar) => {
    const c = corpoEntidade(rotulo)
    const r = await chamar('POST', '/entidades', { corpo: c })
    assert.equal(r.status, 201, `cadastro entidade ${rotulo}: ${r.status} ${r.texto.slice(0, 200)}`)
    const id = dados(r).id
    if (aprovar) {
      const a = await chamar('PATCH', `/entidades/${id}/status`, { corpo: { status: 'APROVADA' }, token: admin.token })
      assert.equal(a.status, 200, `aprovar ${rotulo}: ${a.status} ${a.texto.slice(0, 200)}`)
    }
    contas.push({ perfil: `entidade ${aprovar ? 'APROVADA' : 'PENDENTE'}`, email: c.email, senha: senhaTeste })
    return aprovar ? login(c.email, senhaTeste) : null
  }
  const entA = await criarEntidade('seedA', true)
  const entB = await criarEntidade('seedB', true)
  await criarEntidade('seedPendente', false)

  const novaCampanha = async (sessao, titulo, extra, status) => {
    const r = await chamar('POST', '/campanhas', { corpo: corpoCampanha(titulo, extra), token: sessao.token })
    assert.equal(r.status, 201, `campanha ${titulo}: ${r.status} ${r.texto.slice(0, 200)}`)
    let c = dados(r)
    if (status) {
      const s = await chamar('PATCH', `/campanhas/${c.id}/status`, { corpo: { status }, token: sessao.token })
      assert.equal(s.status, 200, `status ${titulo}->${status}: ${s.status} ${s.texto.slice(0, 200)}`)
      c = dados(s)
    }
    console.log(`  campanha "${c.titulo}" -> ${c.status}`)
    return c
  }
  const ativa = await novaCampanha(entA, 'Seed ativa', {})
  await novaCampanha(entA, 'Seed rascunho', { rascunho: true })
  await novaCampanha(entB, 'Seed agendada', { dataInicio: dia(15), dataFim: dia(60) })
  const aEncerrar = await novaCampanha(entB, 'Seed encerrada', {})

  const doador = { email: `e2e.doador.seed.${sufixo}@example.test`, senha: senhaTeste }
  const cad = await chamar('POST', '/doadores', {
    corpo: { tipo: 'PESSOA_FISICA', nome: `Doador Seed ${sufixo}`, ...doador, telefone: '48988887777', cpf: fmtCpf(digitosCpf()), dataNascimento: '1990-05-15' },
  })
  assert.equal(cad.status, 201, `cadastro doador: ${cad.status} ${cad.texto.slice(0, 200)}`)
  contas.push({ perfil: 'doador PF', ...doador })
  const d = await login(doador.email, doador.senha)
  for (const [valor, anonima, campanhaId] of [[150, false, ativa.id], [80, true, ativa.id], [60, false, aEncerrar.id]]) {
    const r = await chamar('POST', '/doacoes', { corpo: { campanhaId, valor, formaPagamento: 'PIX', anonima }, token: d.token, headers: { 'Idempotency-Key': `seed-${sufixo}-${valor}` } })
    assert.equal(r.status, 201, `doação ${valor}: ${r.status} ${r.texto.slice(0, 200)}`)
    console.log(`  doação R$ ${valor}${anonima ? ' (anônima)' : ''}`)
  }
  const enc = await chamar('PATCH', `/campanhas/${aEncerrar.id}/status`, { corpo: { status: 'ENCERRADA' }, token: entB.token })
  console.log(`  campanha "${aEncerrar.titulo}" -> ${dados(enc)?.status ?? `HTTP ${enc.status}`}`)

  console.log('\nContas de homologação criadas (senhas fictícias geradas nesta execução):')
  for (const c of contas) console.log(`  ${c.perfil.padEnd(20)} ${c.email}  /  ${c.senha}`)
}

// ---------- suíte ----------
async function suite() {
  const ctx = {}
  const hoje = dia(0)

  await passo('1. GET /campanhas público', '200 {data, meta}', async () => {
    const r = await chamar('GET', '/campanhas?limit=5')
    esperar(r, 200)
    assert.ok(Array.isArray(r.json.data), 'data deve ser array')
    assert.ok(r.json.meta && typeof r.json.meta.total === 'number', 'meta.total ausente')
  })

  // 2. doadores
  ctx.pf = { email: `e2e.pf.${sufixo}@example.test`, cpf: fmtCpf(digitosCpf()) }
  await passo('2a. POST /doadores (PF)', '201', async () => {
    const r = await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_FISICA', nome: `Doador PF ${sufixo}`, email: ctx.pf.email, senha: senhaTeste, telefone: '48988887777', cpf: ctx.pf.cpf, dataNascimento: '1990-05-15' } })
    esperar(r, 201)
    assert.ok(!JSON.stringify(r.json).includes(senhaTeste), 'resposta não pode vazar a senha')
  })
  await passo('2b. POST /doadores (PJ)', '201', async () => {
    const r = await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_JURIDICA', nome: `Doador PJ ${sufixo}`, email: `e2e.pj.${sufixo}@example.test`, senha: senhaTeste, telefone: '48988887777', cnpj: fmtCnpj(digitosCnpj()), razaoSocial: `Doadora PJ ${sufixo} LTDA` } })
    esperar(r, 201)
  })
  await passo('2c. POST /doadores e-mail duplicado', '409', async () => {
    const r = await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_FISICA', nome: 'Dup', email: ctx.pf.email, senha: senhaTeste, telefone: '48988887777', cpf: fmtCpf(digitosCpf()), dataNascimento: '1990-05-15' } })
    esperar(r, 409)
  })

  // 3. entidades
  ctx.entA = corpoEntidade('A')
  ctx.entB = corpoEntidade('B')
  ctx.entC = corpoEntidade('C')
  for (const [rot, c] of [['A', ctx.entA], ['B', ctx.entB], ['C', ctx.entC]]) {
    await passo(`3${rot.toLowerCase()}. POST /entidades (${rot})`, '201 PENDENTE', async () => {
      const r = await chamar('POST', '/entidades', { corpo: c })
      esperar(r, 201)
      c.id = dados(r).id
      assert.ok(c.id, 'id ausente')
      assert.match(String(dados(r).status ?? 'PENDENTE'), /PENDENTE/i)
    })
  }

  // 4. admin
  await passo('4a. Login ADMIN', '200', async () => { ctx.admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD); assert.equal(ctx.admin.usuario.tipo, 'ADMIN') })
  await passo('4b. Entidade PENDENTE tenta criar campanha', '403/409/422', async () => {
    const s = await login(ctx.entA.email, senhaTeste)
    const r = await chamar('POST', '/campanhas', { corpo: corpoCampanha('Pendente'), token: s.token })
    assert.ok([403, 409, 422].includes(r.status), `esperado 403/409/422, recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  for (const rot of ['A', 'B']) {
    const c = ctx[`ent${rot}`]
    await passo(`4c. PATCH /entidades/{id}/status APROVADA (${rot})`, '200', async () => {
      const r = await chamar('PATCH', `/entidades/${c.id}/status`, { corpo: { status: 'APROVADA' }, token: ctx.admin.token })
      esperar(r, 200)
    })
  }
  await passo('4d. Reprovar sem motivo', '422', async () => {
    const r = await chamar('PATCH', `/entidades/${ctx.entC.id}/status`, { corpo: { status: 'REPROVADA' }, token: ctx.admin.token })
    esperar(r, 422)
  })
  await passo('4e. Reprovar com motivo', '200', async () => {
    const r = await chamar('PATCH', `/entidades/${ctx.entC.id}/status`, { corpo: { status: 'REPROVADA', motivo: 'Documentação ilegível (teste E2E).' }, token: ctx.admin.token })
    esperar(r, 200)
  })
  await passo('4f. Doador tenta aprovar entidade', '403', async () => {
    const d = await login(ctx.pf.email, senhaTeste)
    esperar(await chamar('PATCH', `/entidades/${ctx.entC.id}/status`, { corpo: { status: 'APROVADA' }, token: d.token }), 403)
  })

  // 5. campanhas
  await passo('5a. Login entidades A e B aprovadas', '200', async () => {
    ctx.sA = await login(ctx.entA.email, senhaTeste)
    ctx.sB = await login(ctx.entB.email, senhaTeste)
    assert.equal(ctx.sA.usuario.statusEntidade, 'APROVADA')
  })
  await passo('5b. POST /campanhas rascunho', '201', async () => {
    const r = await chamar('POST', '/campanhas', { corpo: corpoCampanha('Rascunho A', { rascunho: true }), token: ctx.sA.token })
    esperar(r, 201)
    ctx.campA = dados(r)
    assert.ok(ctx.campA.id)
  })
  await passo('5c. Rascunho de B para teste de privacidade', '201', async () => {
    const r = await chamar('POST', '/campanhas', { corpo: corpoCampanha('Rascunho B', { rascunho: true }), token: ctx.sB.token })
    esperar(r, 201)
    ctx.campB = dados(r)
  })
  await passo('5d. GET detalhe (dono) + PATCH com versao', '200', async () => {
    const g = await chamar('GET', `/campanhas/${ctx.campA.id}`, { token: ctx.sA.token })
    esperar(g, 200, 'GET')
    ctx.versao0 = dados(g).versao
    assert.notEqual(ctx.versao0, undefined, 'campo versao ausente no detalhe')
    const r = await chamar('PATCH', `/campanhas/${ctx.campA.id}`, { token: ctx.sA.token, corpo: { ...corpoCampanha('Editada A'), titulo: `Campanha A editada ${sufixo}`, metaValor: 2000, versao: ctx.versao0 } })
    esperar(r, 200, 'PATCH')
    assert.equal(dados(r).titulo, `Campanha A editada ${sufixo}`)
  })
  await passo('5e. PATCH com versao antiga', '409', async () => {
    const r = await chamar('PATCH', `/campanhas/${ctx.campA.id}`, { token: ctx.sA.token, corpo: { ...corpoCampanha('Conflito'), versao: ctx.versao0 } })
    esperar(r, 409)
  })
  await passo('5f. PATCH /campanhas/{id}/status -> ATIVA', '200 ATIVA', async () => {
    const r = await chamar('PATCH', `/campanhas/${ctx.campA.id}/status`, { token: ctx.sA.token, corpo: { status: 'ATIVA' } })
    esperar(r, 200)
    assert.equal(dados(r).status, 'ATIVA')
  })

  // 6. vitrine
  await passo('6a. Vitrine lista campanha ativa', '200 contém', async () => {
    const r = await chamar('GET', `/campanhas?entidadeId=${ctx.entA.id}&limit=50`)
    esperar(r, 200)
    assert.ok(r.json.data.some((c) => c.id === ctx.campA.id), 'campanha ativa ausente da vitrine')
  })
  await passo('6b. Detalhe público da campanha ativa', '200', async () => esperar(await chamar('GET', `/campanhas/${ctx.campA.id}`), 200))
  await passo('6c. Rascunho não aparece na vitrine', '200 ausente', async () => {
    const r = await chamar('GET', `/campanhas?entidadeId=${ctx.entB.id}&limit=50`)
    esperar(r, 200)
    assert.ok(!r.json.data.some((c) => c.id === ctx.campB.id), 'rascunho vazou na vitrine')
  })
  await passo('6d. Detalhe público de rascunho', '404', async () => esperar(await chamar('GET', `/campanhas/${ctx.campB.id}`), 404))
  await passo('6e. Rascunho invisível para outra entidade', '404', async () => esperar(await chamar('GET', `/campanhas/${ctx.campB.id}`, { token: ctx.sA.token }), 404))

  // 7. doações
  await passo('7a. Login doador PF', '200', async () => { ctx.d = await login(ctx.pf.email, senhaTeste) })
  ctx.chave = `e2e-${sufixo}-1`
  await passo('7b. POST /doacoes com Idempotency-Key', '201', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, headers: { 'Idempotency-Key': ctx.chave }, corpo: { campanhaId: ctx.campA.id, valor: 150, formaPagamento: 'PIX', anonima: false } })
    esperar(r, 201)
    ctx.doacao = dados(r)
    assert.ok(ctx.doacao.id && ctx.doacao.codigoComprovante, 'id/codigoComprovante ausentes')
  })
  await passo('7c. Repetir mesma Idempotency-Key', '200 mesmo id', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, headers: { 'Idempotency-Key': ctx.chave }, corpo: { campanhaId: ctx.campA.id, valor: 150, formaPagamento: 'PIX', anonima: false } })
    esperar(r, 200)
    assert.equal(dados(r).id, ctx.doacao.id)
  })
  await passo('7d. GET /doacoes/{id} (comprovante)', '200', async () => {
    const r = await chamar('GET', `/doacoes/${ctx.doacao.id}`, { token: ctx.d.token })
    esperar(r, 200)
    assert.equal(Number(dados(r).valor), 150)
  })
  await passo('7e. Anônima na campanha', '201', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, headers: { 'Idempotency-Key': `e2e-${sufixo}-2` }, corpo: { campanhaId: ctx.campA.id, valor: 50, formaPagamento: 'PIX', anonima: true } })
    esperar(r, 201)
    ctx.doacaoAnon = dados(r)
  })
  await passo('7f. Doação direta à entidade (entidadeId)', '201', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, headers: { 'Idempotency-Key': `e2e-${sufixo}-3` }, corpo: { entidadeId: ctx.entA.id, valor: 25.5, formaPagamento: 'PIX' } })
    esperar(r, 201)
    ctx.doacaoDireta = dados(r)
  })
  await passo('7g. GET /usuarios/me/doacoes contém a doação', '200', async () => {
    const r = await chamar('GET', '/usuarios/me/doacoes?limit=50', { token: ctx.d.token })
    esperar(r, 200)
    assert.ok(r.json.data.some((x) => x.id === ctx.doacao.id), 'doação ausente do histórico')
    assert.equal(r.json.data.length, 3)
  })
  await passo('7h. Doação em campanha em rascunho', '404/422/409', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, corpo: { campanhaId: ctx.campB.id, valor: 10, formaPagamento: 'PIX' } })
    assert.ok([404, 409, 422].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('7i. Doação com valor 0', '422', async () => {
    esperar(await chamar('POST', '/doacoes', { token: ctx.d.token, corpo: { campanhaId: ctx.campA.id, valor: 0, formaPagamento: 'PIX' } }), 422)
  })

  // 8. visão da entidade
  await passo('8a. GET /entidades/{id}/doacoes', '200 3 doações', async () => {
    const r = await chamar('GET', `/entidades/${ctx.entA.id}/doacoes?limit=50`, { token: ctx.sA.token })
    esperar(r, 200)
    assert.equal(r.json.data.length, 3)
  })
  await passo('8b. Doador anônimo não identificado', '200 sem id/nome', async () => {
    const r = await chamar('GET', `/entidades/${ctx.entA.id}/doacoes?limit=50`, { token: ctx.sA.token })
    const anon = r.json.data.find((x) => x.id === ctx.doacaoAnon.id)
    assert.ok(anon, 'doação anônima ausente')
    assert.equal(anon.doador.id ?? null, null)
    assert.ok(!JSON.stringify(anon.doador).includes(`Doador PF ${sufixo}`), 'nome do doador anônimo vazou')
  })
  await passo('8c. GET /entidades/{id}/arrecadacao', '200 total 225.50', async () => {
    const r = await chamar('GET', `/entidades/${ctx.entA.id}/arrecadacao?dataInicio=${dia(-1)}&dataFim=${dia(1)}`, { token: ctx.sA.token })
    esperar(r, 200)
    assert.equal(Number(dados(r).totalArrecadado), 225.5)
    assert.equal(dados(r).quantidadeDoacoes, 3)
  })
  await passo('8d. Entidade B lê doações da A', '403/404', async () => {
    const r = await chamar('GET', `/entidades/${ctx.entA.id}/doacoes`, { token: ctx.sB.token })
    assert.ok([403, 404].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('8e. Campanha ativa reflete valorArrecadado', '200 200.00', async () => {
    const r = await chamar('GET', `/campanhas/${ctx.campA.id}`)
    esperar(r, 200)
    assert.equal(Number(dados(r).valorArrecadado), 200)
  })

  // 9. admin
  await passo('9a. GET /dashboard/kpis (ADMIN)', '200', async () => esperar(await chamar('GET', '/dashboard/kpis', { token: ctx.admin.token }), 200))
  await passo('9b. GET /usuarios (ADMIN)', '200 paginado', async () => {
    const r = await chamar('GET', '/usuarios?limit=5', { token: ctx.admin.token })
    esperar(r, 200)
    assert.ok(r.json.meta)
    assert.ok(!JSON.stringify(r.json).match(/"senha|hash/i), 'resposta expõe senha/hash')
  })
  await passo('9c. Desativar usuário e login bloqueado', '200 / login 401|403', async () => {
    const lista = await chamar('GET', `/usuarios?limit=50&tipo=PESSOA_FISICA`, { token: ctx.admin.token })
    let alvo = lista.json.data.find((u) => u.email === ctx.pf.email)
    if (!alvo) { // pode estar em outra página: busca varrendo
      for (let p = 2; p <= (lista.json.meta?.totalPages ?? 1) && !alvo; p++) {
        alvo = (await chamar('GET', `/usuarios?limit=50&page=${p}&tipo=PESSOA_FISICA`, { token: ctx.admin.token })).json.data.find((u) => u.email === ctx.pf.email)
      }
    }
    assert.ok(alvo, 'usuário PF de teste não localizado em /usuarios')
    ctx.alvoId = alvo.id
    esperar(await chamar('PATCH', `/usuarios/${alvo.id}/status`, { token: ctx.admin.token, corpo: { status: 'INATIVO' } }), 200, 'desativar')
    const l = await chamar('POST', '/auth/login', { corpo: { email: ctx.pf.email, senha: senhaTeste } })
    assert.ok([401, 403].includes(l.status), `login de inativo deveria ser negado, recebido ${l.status}`)
  })
  await passo('9d. Reativar usuário', '200 / login 200', async () => {
    esperar(await chamar('PATCH', `/usuarios/${ctx.alvoId}/status`, { token: ctx.admin.token, corpo: { status: 'ATIVO' } }), 200)
    ctx.d = await login(ctx.pf.email, senhaTeste)
  })
  await passo('9e. Status de usuário inválido', '422', async () => {
    esperar(await chamar('PATCH', `/usuarios/${ctx.alvoId}/status`, { token: ctx.admin.token, corpo: { status: 'XPTO' } }), 422)
  })

  // 10. perfil
  await passo('10a. GET /usuarios/me', '200', async () => {
    const r = await chamar('GET', '/usuarios/me', { token: ctx.d.token })
    esperar(r, 200)
    assert.equal(dados(r).email, ctx.pf.email)
  })
  await passo('10b. PATCH /usuarios/me nome/telefone', '200', async () => {
    const r = await chamar('PATCH', '/usuarios/me', { token: ctx.d.token, corpo: { nome: `Doador PF Editado ${sufixo}`, telefone: '48977776666' } })
    esperar(r, 200)
    assert.equal(dados(r).nome, `Doador PF Editado ${sufixo}`)
  })
  const novaSenha = `${senhaTeste}9`
  await passo('10c. Troca de senha com senha atual errada', '422', async () => {
    esperar(await chamar('PATCH', '/usuarios/me', { token: ctx.d.token, corpo: { senhaAtual: 'errada-errada', novaSenha } }), 422)
  })
  await passo('10d. Troca de senha correta + login', '200', async () => {
    esperar(await chamar('PATCH', '/usuarios/me', { token: ctx.d.token, corpo: { senhaAtual: senhaTeste, novaSenha } }), 200)
    ctx.d = await login(ctx.pf.email, novaSenha)
    const antiga = await chamar('POST', '/auth/login', { corpo: { email: ctx.pf.email, senha: senhaTeste } })
    assert.ok([401, 403].includes(antiga.status), `senha antiga ainda funciona (HTTP ${antiga.status})`)
  })

  // 11. controle de acesso
  await passo('11a. Rota privada sem token', '401', async () => esperar(await chamar('GET', '/usuarios/me'), 401))
  await passo('11b. Token inválido', '401', async () => esperar(await chamar('GET', '/usuarios/me', { token: 'abc.def.ghi' }), 401))
  await passo('11c. Token adulterado', '401', async () => {
    const t = ctx.d.token
    const adulterado = `${t.slice(0, -4)}${t.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA'}`
    esperar(await chamar('GET', '/usuarios/me', { token: adulterado }), 401)
  })
  await passo('11d. Doador em rota ADMIN (/usuarios, /dashboard/kpis)', '403', async () => {
    esperar(await chamar('GET', '/usuarios', { token: ctx.d.token }), 403, '/usuarios')
    esperar(await chamar('GET', '/dashboard/kpis', { token: ctx.d.token }), 403, '/kpis')
  })
  await passo('11e. Entidade em rota ADMIN', '403', async () => esperar(await chamar('GET', '/usuarios', { token: ctx.sA.token }), 403))
  await passo('11f. Entidade A edita campanha da B', '403/404', async () => {
    const r = await chamar('PATCH', `/campanhas/${ctx.campB.id}`, { token: ctx.sA.token, corpo: { ...corpoCampanha('Invasão'), versao: 0 } })
    assert.ok([403, 404].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('11g. Entidade A encerra campanha da B', '403/404', async () => {
    const r = await chamar('PATCH', `/campanhas/${ctx.campB.id}/status`, { token: ctx.sA.token, corpo: { status: 'ENCERRADA' } })
    assert.ok([403, 404].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('11h. Doador cria campanha', '403', async () => esperar(await chamar('POST', '/campanhas', { token: ctx.d.token, corpo: corpoCampanha('Doador') }), 403))
  await passo('11i. Entidade realiza doação', '403', async () => {
    esperar(await chamar('POST', '/doacoes', { token: ctx.sA.token, corpo: { campanhaId: ctx.campA.id, valor: 10, formaPagamento: 'PIX' } }), 403)
  })
  await passo('11j. Doador alheio lê comprovante', '403/404', async () => {
    const outro = { email: `e2e.pf2.${sufixo}@example.test` }
    esperar(await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_FISICA', nome: 'Outro Doador', ...outro, senha: senhaTeste, telefone: '48988887777', cpf: fmtCpf(digitosCpf()), dataNascimento: '1991-01-01' } }), 201, 'cadastro')
    const s = await login(outro.email, senhaTeste)
    const r = await chamar('GET', `/doacoes/${ctx.doacao.id}`, { token: s.token })
    assert.ok([403, 404].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('11k. Entidade A encerra a própria campanha', '200 ENCERRADA', async () => {
    const r = await chamar('PATCH', `/campanhas/${ctx.campA.id}/status`, { token: ctx.sA.token, corpo: { status: 'ENCERRADA' } })
    esperar(r, 200)
    assert.equal(dados(r).status, 'ENCERRADA')
  })
  await passo('11l. Doar em campanha encerrada', '409/422', async () => {
    const r = await chamar('POST', '/doacoes', { token: ctx.d.token, corpo: { campanhaId: ctx.campA.id, valor: 10, formaPagamento: 'PIX' } })
    assert.ok([409, 422].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })

  // 12. validações
  await passo('12a. CPF inválido', '422', async () => {
    esperar(await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_FISICA', nome: 'X', email: `e2e.cpf.${sufixo}@example.test`, senha: senhaTeste, telefone: '48988887777', cpf: cpfInvalido(), dataNascimento: '1990-05-15' } }), 422)
  })
  await passo('12b. E-mail inválido / senha curta', '422', async () => {
    esperar(await chamar('POST', '/doadores', { corpo: { tipo: 'PESSOA_FISICA', nome: 'X', email: 'nao-e-email', senha: '123', telefone: '1', cpf: fmtCpf(digitosCpf()), dataNascimento: '1990-05-15' } }), 422)
  })
  await passo('12c. CNPJ inválido em entidade', '422', async () => {
    esperar(await chamar('POST', '/entidades', { corpo: { ...corpoEntidade('X'), cnpj: cnpjInvalido() } }), 422)
  })
  await passo('12d. Meta negativa', '422', async () => {
    esperar(await chamar('POST', '/campanhas', { token: ctx.sB.token, corpo: corpoCampanha('Meta', { metaValor: -5 }) }), 422)
  })
  await passo('12e. dataFim anterior a dataInicio', '422', async () => {
    esperar(await chamar('POST', '/campanhas', { token: ctx.sB.token, corpo: corpoCampanha('Datas', { dataInicio: dia(10), dataFim: dia(2) }) }), 422)
  })
  await passo('12f. Login com credenciais inválidas', '401', async () => esperar(await chamar('POST', '/auth/login', { corpo: { email: ctx.pf.email, senha: 'incorreta123' } }), 401))
  await passo('12g. Campanha inexistente', '404', async () => esperar(await chamar('GET', `/campanhas/${UUID_INEXISTENTE}`), 404))
  await passo('12h. Status de campanha inexistente', '404', async () => esperar(await chamar('PATCH', `/campanhas/${UUID_INEXISTENTE}/status`, { token: ctx.sB.token, corpo: { status: 'ATIVA' } }), 404))
  await passo('12i. Comprovante inexistente', '404', async () => esperar(await chamar('GET', `/doacoes/${UUID_INEXISTENTE}`, { token: ctx.d.token }), 404))
  await passo('12j. Entidade inexistente', '404', async () => esperar(await chamar('GET', `/entidades/${UUID_INEXISTENTE}`), 404))
  await passo('12k. UUID malformado', '400/404/422', async () => {
    const r = await chamar('GET', '/campanhas/nao-e-uuid')
    assert.ok([400, 404, 422].includes(r.status), `recebido ${r.status}: ${r.texto.slice(0, 200)}`)
  })
  await passo('12l. Status de campanha inválido', '422', async () => {
    esperar(await chamar('PATCH', `/campanhas/${ctx.campB.id}/status`, { token: ctx.sB.token, corpo: { status: 'XPTO' } }), 422)
  })
  await passo('12m. JSON malformado', '400', async () => {
    const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' })
    assert.ok(r.status >= 400 && r.status < 500, `esperado 4xx, recebido ${r.status}`)
    if (r.status >= 500) achados500.push({ metodo: 'POST', caminho: '/auth/login (JSON malformado)', status: r.status, corpo: '' })
  })
  await passo('12n. Nenhuma resposta 5xx na suíte', '0 respostas 500', async () => {
    assert.equal(achados500.length, 0, achados500.map((a) => `${a.metodo} ${a.caminho} -> ${a.status} ${a.corpo}`).join(' | '))
  })

  void hoje
}

// ---------- execução ----------
console.log(`API: ${API}\nSufixo da execução: ${sufixo}\n`)
if (SEED) {
  try { await seed() } catch (e) { console.error(`Seed falhou: ${e.message}`); process.exit(1) }
  process.exit(0)
}

await suite()
const larg = Math.max(...resultados.map((r) => r.nome.length))
console.log(`${'Passo'.padEnd(larg)}  Esperado            Resultado`)
for (const r of resultados) {
  console.log(`${r.nome.padEnd(larg)}  ${r.esperado.padEnd(18)}  ${r.ok ? 'PASS' : 'FAIL'}${r.ok ? '' : ` -> ${r.detalhe}`}`)
}
const falhas = resultados.filter((r) => !r.ok).length
console.log(`\nTotal: ${resultados.length} | PASS: ${resultados.length - falhas} | FAIL: ${falhas}`)
if (achados500.length) console.log('Respostas 5xx:', JSON.stringify(achados500, null, 2))
process.exit(falhas ? 1 : 0)
