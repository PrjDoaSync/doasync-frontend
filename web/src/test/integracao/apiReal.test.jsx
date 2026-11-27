// Integração REAL dos serviços e mappers do frontend com o backend (sem simulador).
// Só roda quando API_REAL_URL está definida, por exemplo:
//   API_REAL_URL=http://localhost:8090/api/v1 ADMIN_EMAIL=... ADMIN_PASSWORD=... npx vitest run src/test/integracao
// Cria dados fictícios com sufixo único; nenhum pagamento real é feito (a API só registra PIX).
import { beforeEach, describe, expect, it } from 'vitest'
import api from '../../services/api'
import { authService } from '../../services/authService'
import { campanhasService } from '../../services/campanhasService'
import { dashboardService } from '../../services/dashboardService'
import { doacoesService, novaChaveIdempotencia } from '../../services/doacoesService'
import { entidadesService } from '../../services/entidadesService'
import { usuariosService } from '../../services/usuariosService'
import { limparSessao } from '../../services/token'
import { corpoCadastroDoador } from '../../utils/cadastroDoador'
import { corpoCadastroEntidade } from '../../utils/cadastroEntidade'
import { hojeISO } from '../../utils/campanhas'
import { corpoCampanha } from '../../utils/criarCampanha'
import { somarDias } from '../../utils/doacao'

const API_REAL_URL = process.env.API_REAL_URL
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

// Documentos fictícios válidos (dígitos verificadores calculados).
function cpfFicticio(base) {
  const d = String(base).padStart(9, '0').slice(-9).split('').map(Number)
  const dv = (n) => {
    const s = n.reduce((a, x, i) => a + x * (n.length + 1 - i), 0) % 11
    return s < 2 ? 0 : 11 - s
  }
  d.push(dv(d))
  d.push(dv(d))
  return d.join('')
}
function cnpjFicticio(base) {
  const d = (String(base).padStart(8, '0').slice(-8) + '0001').split('').map(Number)
  const dv = (n, pesos) => {
    const s = n.reduce((a, x, i) => a + x * pesos[i], 0) % 11
    return s < 2 ? 0 : 11 - s
  }
  d.push(dv(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))
  d.push(dv(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))
  return d.join('')
}
const enderecoVazio = { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }

describe.runIf(API_REAL_URL)('serviços do frontend contra a API real', () => {
  beforeEach(() => {
    api.defaults.adapter = 'http'
    api.defaults.baseURL = API_REAL_URL
    limparSessao()
  })

  it('percorre cadastro, aprovação, campanha, doação, gestão e conta', { timeout: 90000 }, async () => {
    expect(ADMIN_EMAIL && ADMIN_PASSWORD, 'defina ADMIN_EMAIL e ADMIN_PASSWORD').toBeTruthy()
    const sufixo = Date.now().toString().slice(-8)
    const senha = `Senha-${sufixo}`

    // Vitrine pública e entidades públicas (mappers sobre respostas reais).
    const vitrine = await campanhasService.listarPublicas()
    expect(Array.isArray(vitrine)).toBe(true)
    expect(Array.isArray(await entidadesService.aprovadas())).toBe(true)

    // Cadastro de entidade (pendente) e de doador PF.
    const entidade = await authService.cadastrarEntidade(
      corpoCadastroEntidade({
        nome: `Entidade Integração ${sufixo}`,
        email: `entidade.${sufixo}@teste.doasync.local`,
        senha,
        telefone: '15999990000',
        cnpj: cnpjFicticio(sufixo),
        razaoSocial: `Entidade Integração ${sufixo} LTDA`,
        descricao: 'Entidade fictícia criada pelo teste de integração.',
        areaAtuacao: 'Assistência social',
        site: '',
        responsavelNome: '',
        ...enderecoVazio,
      }),
    )
    expect(entidade.statusAprovacao).toBe('PENDENTE')
    await authService.cadastrarDoador(
      corpoCadastroDoador({
        tipo: 'PESSOA_FISICA',
        nome: `Doadora Integração ${sufixo}`,
        email: `doadora.${sufixo}@teste.doasync.local`,
        senha,
        telefone: '15988880000',
        cpf: cpfFicticio(sufixo),
        dataNascimento: '1990-05-10',
      }),
    )

    // ADMIN aprova a entidade e lê indicadores e usuários.
    await authService.entrar(ADMIN_EMAIL, ADMIN_PASSWORD)
    await entidadesService.alterarStatus(entidade.id, 'APROVADA')
    expect(typeof (await dashboardService.kpis()).totalArrecadado).not.toBe('undefined')
    const contas = await usuariosService.listar({ tipo: 'ENTIDADE' })
    expect(contas.some((c) => c.entidadeId === entidade.id)).toBe(true)

    // Entidade cria rascunho, edita com versão (lock otimista) e publica.
    const sessaoEntidade = await authService.entrar(`entidade.${sufixo}@teste.doasync.local`, senha)
    expect(sessaoEntidade.usuario.statusEntidade).toBe('APROVADA')
    const formulario = {
      titulo: `Campanha Integração ${sufixo}`,
      categoria: 'Alimentação',
      descricao: 'Campanha fictícia do teste de integração.',
      dataInicio: hojeISO(),
      dataFim: somarDias(hojeISO(), 30),
      metaValor: '1000',
      imagemUrl: 'https://example.org/capa.jpg',
    }
    const rascunho = await campanhasService.criar(corpoCampanha(formulario), true)
    expect(rascunho.status).toBe('Rascunho')
    const detalhe = await campanhasService.buscarGestao(rascunho.id)
    expect(Number.isInteger(detalhe.versao)).toBe(true)
    const editada = await campanhasService.atualizar(rascunho.id, corpoCampanha({ ...formulario, metaValor: '1500' }), detalhe.versao)
    expect(editada.meta).toBe(1500)
    await expect(campanhasService.atualizar(rascunho.id, corpoCampanha(formulario), detalhe.versao)).rejects.toMatchObject({ status: 409 })
    await campanhasService.alterarStatus(rascunho.id, 'ATIVA')
    const daGestao = await campanhasService.daGestao({ entidadeId: sessaoEntidade.usuario.entidadeId })
    expect(daGestao.find((c) => c.id === rascunho.id)?.status).toBe('Ativa')

    // Doadora registra PIX (idempotente) e consulta comprovante e histórico.
    limparSessao()
    expect((await campanhasService.buscarPublica(rascunho.id)).recebendoDoacoes).toBe(true)
    await authService.entrar(`doadora.${sufixo}@teste.doasync.local`, senha)
    const chave = novaChaveIdempotencia()
    const doacao = await doacoesService.registrar({ campanhaId: rascunho.id, valor: 25, anonima: false, observacao: 'Teste' }, chave)
    const repetida = await doacoesService.registrar({ campanhaId: rascunho.id, valor: 25, anonima: false, observacao: 'Teste' }, chave)
    expect(repetida.id).toBe(doacao.id)
    expect((await doacoesService.buscar(doacao.id)).comprovante).toBeTruthy()
    expect((await doacoesService.minhas()).itens.some((d) => d.id === doacao.id)).toBe(true)
    const direta = await doacoesService.registrar({ entidadeId: entidade.id, valor: 10, anonima: true }, novaChaveIdempotencia())
    expect(direta.campanhaId).toBeNull()

    // Minha conta: atualiza telefone e troca senha com a senha atual.
    const perfil = await usuariosService.meuPerfil()
    expect(perfil.email).toBe(`doadora.${sufixo}@teste.doasync.local`)
    await expect(usuariosService.atualizarPerfil({ nome: perfil.nome, senhaAtual: 'errada', novaSenha: `${senha}-2` })).rejects.toMatchObject({ status: 422 })
    await usuariosService.atualizarPerfil({ nome: perfil.nome, telefone: '15977770000', senhaAtual: senha, novaSenha: `${senha}-2` })
    await authService.entrar(`doadora.${sufixo}@teste.doasync.local`, `${senha}-2`)

    // Doador não acessa rota de gestão; sem token, rota privada responde 401.
    await expect(doacoesService.recebidas(entidade.id)).rejects.toMatchObject({ status: 403 })
    limparSessao()
    await expect(usuariosService.meuPerfil()).rejects.toMatchObject({ status: 401 })

    // Entidade vê doações recebidas e arrecadação do período.
    await authService.entrar(`entidade.${sufixo}@teste.doasync.local`, senha)
    const recebidas = await doacoesService.recebidas(entidade.id)
    expect(recebidas.some((d) => d.id === doacao.id)).toBe(true)
    expect(recebidas.find((d) => d.id === direta.id)?.doadorId ?? null).toBeNull()
    const arrecadacao = await doacoesService.arrecadacao(entidade.id, { inicio: hojeISO(), fim: hojeISO() })
    expect(Number(arrecadacao.totalArrecadado)).toBeGreaterThanOrEqual(35)
  })
})
