// MOCK da equipe da entidade (#113), espelhando o protótipo. SEM CONTRATO na API:
// o contrato só tem GET /usuarios e PATCH /usuarios/{id}/status (ADMIN da plataforma).
// Papéis da entidade, convites, 2FA e último acesso não existem no backend.
export const VOCE = 1
export const equipeDemo = [
  { id: 1, nome: 'Ana Silva', email: 'ana@redeesperanca.org.br', papel: 'Administradora', acesso: 'Ativo', doisFatores: true, ultimoAcesso: '06/10 · 10:45' },
  { id: 2, nome: 'Paulo Souza', email: 'paulo@redeesperanca.org.br', papel: 'Operador', acesso: 'Ativo', doisFatores: true, ultimoAcesso: '06/10 · 10:20' },
  { id: 3, nome: 'Beatriz Rocha', email: 'beatriz@redeesperanca.org.br', papel: 'Financeiro', acesso: 'Ativo', doisFatores: true, ultimoAcesso: '05/10 · 17:05' },
  { id: 4, nome: 'Rafael Almeida', email: 'rafael@redeesperanca.org.br', papel: 'Leitura', acesso: 'Ativo', doisFatores: true, ultimoAcesso: '05/10 · 14:12' },
  { id: 5, nome: 'Luiza Martins', email: 'luiza@redeesperanca.org.br', papel: 'Leitura', acesso: 'Convite pendente', doisFatores: false, ultimoAcesso: 'Ainda não acessou', conviteExpira: '09/10/2026' },
  { id: 6, nome: 'Camila Ferreira', email: 'camila@redeesperanca.org.br', papel: 'Operador', acesso: 'Suspenso', doisFatores: true, ultimoAcesso: '30/09 · 09:30' },
]
