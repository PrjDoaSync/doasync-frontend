// Sessão de POST /auth/login usada por padrão nos testes (as rotas de gestão exigem login).
export const SESSAO_ENTIDADE_TESTE = {
  token: 'token-de-teste',
  expiraEm: '2999-01-01T00:00:00Z',
  usuario: {
    id: 'u0000000-0000-4000-8000-000000000001',
    nome: 'Ana Silva',
    email: 'ana@redeesperanca.org.br',
    tipo: 'ENTIDADE',
    entidadeId: 'e0000000-0000-4000-8000-000000000001',
    statusEntidade: 'APROVADA',
  },
}
