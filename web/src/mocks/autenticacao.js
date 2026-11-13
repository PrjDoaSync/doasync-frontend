/**
 * Mock isolado de autenticação e recuperação de senha — GES-01 (Issue #105 / #68).
 *
 * ATENÇÃO / LIMITAÇÃO DE INTEGRAÇÃO:
 * Os contratos oficiais de backend (Spring Boot) para login (/api/auth/login) e
 * recuperação de senha (/api/auth/recuperar-senha) ainda não foram formalizados
 * ou disponibilizados pela equipe responsável.
 *
 * Conforme estabelecido no planejamento de implementação (seção 1.5 C):
 * - Não inventar endpoints, payloads ou tokens.
 * - Manter o comportamento de mock estritamente isolado neste arquivo.
 * - Não simular autenticação fictícia que libere acesso persistente a áreas protegidas.
 * - Indicar explicitamente para a interface e nos testes que a integração real está pendente.
 */

export async function mockTentativaLogin({ email, senha: _senha, manterConectado }) {
  // Simula latência de rede realista
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Não confirma login real sem contrato de backend
  return {
    sucesso: false,
    pendenteIntegracao: true,
    mensagem:
      'A autenticação com o servidor ainda não está integrada (contrato de API pendente). Nenhum acesso autenticado foi realizado.',
    dados: { email, manterConectado },
  }
}

export async function mockSolicitarRecuperacaoSenha({ email }) {
  // Simula latência de rede realista
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Retorna mensagem neutra conforme especificado no protótipo GES-01
  return {
    sucesso: true,
    pendenteIntegracao: true,
    mensagem:
      'Solicitação enviada. Se este e-mail estiver cadastrado, você receberá um link válido por 30 minutos.',
    notaSpam:
      'Confira também a caixa de spam. Você poderá solicitar outro link em 60 segundos.',
    avisoDemo:
      'Ambiente de demonstração: nenhum e-mail real foi enviado (integração de envio pendente).',
    email,
  }
}
