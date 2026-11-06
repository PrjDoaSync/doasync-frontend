// MOCK do histórico do doador (conta de demonstração), espelhando o protótipo.
// Em produção vem de GET /usuarios/me/doacoes (#35). SEM CONTRATO na API:
// cartão/boleto (só PIX), destinação "Aplicada", sub-textos e documentos em PDF.
export const DOADOR = { nome: 'Mariana Costa', email: 'mariana.costa@exemplo.com' }
const base = { campanhaId: 1, campanha: 'Mesa solidária: alimento para 200 famílias', entidade: 'Rede Esperança' }
export const historicoDoadorDemo = [
  { ...base, id: 'DS-1086', data: '2026-10-06', hora: '14h32', tipo: 'Financeira', valor: 100, titulo: 'R$ 100,00', subtitulo: 'Financeira · única', meio: 'cartão de crédito', meioDetalhe: 'Cartão · final 4242 · 1x', pagamento: 'Cartão · confirmado', pagamentoSub: 'Final 4242 · 1x', pagamentoStatus: 'Confirmado', status: 'Recebida', statusSub: 'Aguardando destinação' },
  { ...base, id: 'DS-1087', data: '2026-10-06', hora: '11h20', tipo: 'Itens', quantidade: 5, titulo: '2 cestas + 3 kits', subtitulo: 'Itens · 5 unidades', pagamento: 'Não se aplica', pagamentoSub: 'Sem pagamento', pagamentoStatus: 'Não se aplica', status: 'Pendente', statusSub: 'Entrega: 08/10 · 10h' },
  { ...base, id: 'DS-1082', data: '2026-10-05', hora: '09h05', tipo: 'Financeira', valor: 50, titulo: 'R$ 50,00', subtitulo: 'Financeira · única', meio: 'boleto bancário', meioDetalhe: 'Boleto · vence em 09/10/2026', pagamento: 'Boleto · não pago', pagamentoSub: 'Vence em 09/10/2026', pagamentoStatus: 'Pendente', status: 'Pendente', statusSub: 'Aguardando pagamento' },
  { ...base, id: 'DS-1042', data: '2026-10-02', hora: '10h14', tipo: 'Financeira', valor: 100, titulo: 'R$ 100,00', subtitulo: 'Financeira · única', meio: 'cartão de crédito', meioDetalhe: 'Cartão · final 4242 · 1x', pagamento: 'Cartão · confirmado', pagamentoSub: 'Final 4242 · 1x', pagamentoStatus: 'Confirmado', status: 'Aplicada', statusSub: 'Alimentos · 05/10' },
  { ...base, id: 'DS-1031', data: '2026-10-01', hora: '16h40', tipo: 'Itens', quantidade: 3, titulo: '3 kits de higiene', subtitulo: 'Itens · 3 unidades', pagamento: 'Não se aplica', pagamentoSub: 'Entrega conferida: 02/10', pagamentoStatus: 'Não se aplica', status: 'Recebida', statusSub: 'Aguardando distribuição' },
]
