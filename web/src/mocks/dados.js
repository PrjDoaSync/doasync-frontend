// Dados fictícios usados enquanto a API Spring Boot não está disponível.
// Serão substituídos pelos dados reais na issue #35.

export const campanhas = [
  { id: 1, nome: 'Mesa solidária: alimento para 200 famílias', entidade: 'Rede Esperança', categoria: 'Alimentação', meta: 30000, arrecadado: 18400, status: 'Ativa', encerraEm: '2026-11-15' },
  { id: 2, nome: 'Volta às aulas: kits escolares', entidade: 'Rede Esperança', categoria: 'Educação', meta: 12000, arrecadado: 9600, status: 'Ativa', encerraEm: '2026-11-30' },
  { id: 3, nome: 'Inverno solidário: agasalhos', entidade: 'Amor Inclusivo', categoria: 'Vestuário', meta: 8000, arrecadado: 8000, status: 'Encerrada', encerraEm: '2026-08-31' },
  { id: 4, nome: 'Cesta básica mensal', entidade: 'Mãos que Ajudam', categoria: 'Alimentação', meta: 20000, arrecadado: 4300, status: 'Ativa', encerraEm: '2026-12-20' },
  { id: 5, nome: 'Reforma do abrigo', entidade: 'Casa Acolher', categoria: 'Infraestrutura', meta: 45000, arrecadado: 0, status: 'Rascunho', encerraEm: '2027-02-10' },
  { id: 6, nome: 'Higiene para todos', entidade: 'Amor Inclusivo', categoria: 'Higiene', meta: 6000, arrecadado: 2150, status: 'Ativa', encerraEm: '2026-11-05' },
  { id: 7, nome: 'Inverno com acolhimento', entidade: 'Rede Esperança', categoria: 'Assistência social', meta: 15000, arrecadado: 15000, status: 'Encerrada', encerraEm: '2026-08-31' },
]

export const doacoes = [
  { id: 1, doador: 'Mariana Lima', detalhe: '2 cestas + 3 kits', tipo: 'Itens', pagamento: 'Não se aplica', recebimento: 'Aceito', destinacao: 'Não destinado', data: '2026-10-08', status: 'Pendente' },
  { id: 2, doador: 'Studio ambiente', detalhe: 'R$ 100,00', tipo: 'Financeira', pagamento: 'Pendente', recebimento: 'Aguardando', destinacao: 'Não destinado', data: '2026-10-08', status: 'Pendente' },
  { id: 3, doador: 'Ana Oliveira', detalhe: 'R$ 250,00', tipo: 'Financeira', pagamento: 'Confirmado', recebimento: 'Confirmado', destinacao: 'Não destinado', data: '2026-10-07', status: 'Confirmada' },
  { id: 4, doador: 'Bruno Costa', detalhe: 'R$ 150,00', tipo: 'Financeira', pagamento: 'Confirmado', recebimento: 'Confirmado', destinacao: 'Não destinado', data: '2026-10-07', status: 'Confirmada' },
  { id: 5, doador: 'Mercado São José', detalhe: '10 cestas básicas', tipo: 'Itens', pagamento: 'Não se aplica', recebimento: 'Confirmado', destinacao: 'Não destinado', data: '2026-10-06', status: 'Confirmada' },
  { id: 6, doador: 'Studio ambiente', detalhe: 'R$ 50,00', tipo: 'Financeira', pagamento: 'Cancelado', recebimento: 'Cancelado', destinacao: 'Não destinado', data: '2026-10-05', status: 'Cancelada' },
  { id: 7, doador: 'Juliano Santos', detalhe: '5 kits de higiene', tipo: 'Itens', pagamento: 'Não se aplica', recebimento: 'Confirmado', destinacao: 'Não destinado', data: '2026-10-05', status: 'Confirmada' },
]

export const entidades = [
  { id: 1, nome: 'Rede Esperança', cidade: 'São Paulo, SP', categoria: 'Alimentação', campanhasAtivas: 2, doacoesRecebidas: 260, status: 'Ativa' },
  { id: 2, nome: 'Amor Inclusivo', cidade: 'Campinas, SP', categoria: 'Inclusão social', campanhasAtivas: 1, doacoesRecebidas: 148, status: 'Ativa' },
  { id: 3, nome: 'Mãos que Ajudam', cidade: 'Santos, SP', categoria: 'Alimentação', campanhasAtivas: 1, doacoesRecebidas: 73, status: 'Ativa' },
  { id: 4, nome: 'Casa Acolher', cidade: 'Sorocaba, SP', categoria: 'Abrigo', campanhasAtivas: 0, doacoesRecebidas: 0, status: 'Em análise' },
  { id: 5, nome: 'Instituto Semear', cidade: 'Ribeirão Preto, SP', categoria: 'Educação', campanhasAtivas: 0, doacoesRecebidas: 52, status: 'Inativa' },
]
