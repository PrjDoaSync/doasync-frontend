// MOCK do histórico do doador (conta de demonstração), espelhando o protótipo.
// Em produção vem de GET /usuarios/me/doacoes (#35). SEM CONTRATO na API:
// cartão/boleto (só PIX), destinação "Aplicada", sub-textos e documentos em PDF.
export const DOADOR = { nome: 'Mariana Costa', email: 'mariana.costa@exemplo.com' }
const base = { campanhaId: 1, campanha: 'Mesa solidária: alimento para 200 famílias', entidade: 'Rede Esperança' }
export const historicoDoadorDemo = [
  { ...base, id: 'DS-1086', pagamentoResumo: 'Confirmado · cartão final 4242', data: '2026-10-06', hora: '14h32', tipo: 'Financeira', valor: 100, titulo: 'R$ 100,00', subtitulo: 'Financeira · única', meio: 'cartão de crédito', meioDetalhe: 'Cartão · final 4242 · 1x', pagamento: 'Cartão · confirmado', pagamentoSub: 'Final 4242 · 1x', pagamentoStatus: 'Confirmado', status: 'Recebida', statusSub: 'Aguardando destinação' },
  { ...base, id: 'DS-1087', pagamentoResumo: 'Sem pagamento · doação de itens', data: '2026-10-06', hora: '11h20', tipo: 'Itens', quantidade: 5, titulo: '2 cestas + 3 kits', subtitulo: 'Itens · 5 unidades', pagamento: 'Não se aplica', pagamentoSub: 'Sem pagamento', pagamentoStatus: 'Não se aplica', status: 'Pendente', statusSub: 'Entrega: 08/10 · 10h' },
  { ...base, id: 'DS-1082', pagamentoResumo: 'Pendente · boleto vence em 09/10/2026', data: '2026-10-05', hora: '09h05', tipo: 'Financeira', valor: 50, titulo: 'R$ 50,00', subtitulo: 'Financeira · única', meio: 'boleto bancário', meioDetalhe: 'Boleto · vence em 09/10/2026', pagamento: 'Boleto · não pago', pagamentoSub: 'Vence em 09/10/2026', pagamentoStatus: 'Pendente', status: 'Pendente', statusSub: 'Aguardando pagamento' },
  { ...base, id: 'DS-1042', pagamentoResumo: 'Confirmado · cartão final 4242',
    eventos: [
      { chave: 'pendente', titulo: 'Pendente', texto: 'Doação registrada. Aguardando a autorização do pagamento no cartão.', quando: '02/10/2026 · 10h12', estado: 'feito' },
      { chave: 'recebida', titulo: 'Recebida', texto: 'Pagamento confirmado. R$ 100,00 recebidos pela Rede Esperança para a Mesa solidária.', quando: '02/10/2026 · 10h14', estado: 'feito' },
      { chave: 'aplicada', titulo: 'Aplicada', texto: 'Contribuição destinada à compra de alimentos não perecíveis para as cestas da campanha.', quando: '05/10/2026 · 16h00', estado: 'final' },
    ],
    destinacao: { texto: 'Compra de alimentos não perecíveis para composição das cestas básicas.', valor: 100, registro: '05/10/2026' },
    mensagem: { autor: 'Equipe da Mesa solidária', data: '05/10/2026', texto: '“Mariana, muito obrigada por fazer parte desta rede. Sua contribuição ajudou na compra de alimentos para as cestas da Mesa solidária. Juntos, levamos mais cuidado e dignidade às famílias da nossa comunidade.”' }, data: '2026-10-02', hora: '10h14', tipo: 'Financeira', valor: 100, titulo: 'R$ 100,00', subtitulo: 'Financeira · única', meio: 'cartão de crédito', meioDetalhe: 'Cartão · final 4242 · 1x', pagamento: 'Cartão · confirmado', pagamentoSub: 'Final 4242 · 1x', pagamentoStatus: 'Confirmado', status: 'Aplicada', statusSub: 'Alimentos · 05/10' },
  { ...base, id: 'DS-1031', pagamentoResumo: 'Sem pagamento · doação de itens', data: '2026-10-01', hora: '16h40', tipo: 'Itens', quantidade: 3, titulo: '3 kits de higiene', subtitulo: 'Itens · 3 unidades', pagamento: 'Não se aplica', pagamentoSub: 'Entrega conferida: 02/10', pagamentoStatus: 'Não se aplica', status: 'Recebida', statusSub: 'Aguardando distribuição' },
]
