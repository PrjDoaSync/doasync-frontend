// MOCK de detalhe das campanhas (telas #92, #93, #94), espelhando o protótipo.
// SEM CONTRATO na API: itens com recebido por item, famílias, timeline, última
// atualização, despesas/comprovantes e impacto. Relógio de demonstração fixo.
export const HOJE_DEMO = '2026-10-06'
export const HORA_DEMO = '10:45'

const mesa = {
  itens: [
    { nome: 'Cesta básica', especificacao: 'Alimentos não perecíveis · cesta completa', meta: 200, recebido: 120 },
    { nome: 'Kit de higiene', especificacao: 'Sabonete, creme dental e escova', meta: 160, recebido: 80 },
    { nome: 'Leite em pó', especificacao: 'Embalagem de 400 g · dentro da validade', meta: 120, recebido: 60 },
  ],
  familias: { atendidas: 40, meta: 200, nota: 'Primeira entrega realizada em 06/10' },
  doacoes: {
    total: 128, financeiras: 86, itens: 42,
    linhas: [
      { id: 1, doador: 'Ana Oliveira', tipo: 'Pix', contribuicao: 'R$ 200,00', recebida: '06/10, 10:32' },
      { id: 2, doador: 'Bruno Costa', tipo: 'Pix', contribuicao: 'R$ 150,00', recebida: '06/10, 09:48' },
      { id: 3, doador: 'Mercado São José', tipo: 'Itens', contribuicao: '10 cestas básicas', recebida: '05/10, 16:20' },
      { id: 4, doador: 'Doador anônimo', tipo: 'Cartão', contribuicao: 'R$ 50,00', recebida: '05/10, 14:10' },
      { id: 5, doador: 'Juliana Santos', tipo: 'Itens', contribuicao: '5 kits de higiene', recebida: '05/10, 11:25' },
    ],
  },
  ultima: { autor: 'Ana Silva', quando: '06/10/2026, 09:15', texto: 'Informações de entrega atualizadas.' },
  atualizadoEm: '06/10, 10:45',
  timeline: [
    { id: 1, data: '06/10/2026 · 09:15', titulo: 'Primeira entrega à comunidade', texto: '40 famílias receberam cestas básicas. A próxima distribuição está prevista para 10/10.', link: 'Atualização pública' },
    { id: 2, data: '04/10/2026 · 15:40', titulo: 'Mais da metade da meta alcançada', texto: 'Ultrapassamos 50% da meta financeira. Obrigado a cada pessoa que contribuiu!', link: 'Atualização pública' },
    { id: 3, data: '02/10/2026 · 11:00', titulo: 'Ponto de entrega confirmado', texto: 'Os itens podem ser entregues na sede da Rede Esperança, na Vila Mariana, mediante agendamento.', link: 'Atualização pública' },
    { id: 4, data: '01/10/2026 · 08:00', titulo: 'Campanha publicada', texto: 'Mesa solidária começou a receber doações financeiras e itens.', link: 'Registro da campanha' },
  ],
}

const inverno = {
  relatorioSalvoEm: '11:10',
  impacto: { pessoas: 300, texto: 'acolhidas com cobertores e kits de higiene', detalhe: '240 agasalhos comprados com doações financeiras', itens: '300 de 300 cobertores recebidos e distribuídos' },
  prestacao: {
    despesas: [
      { id: 1, descricao: 'Compra de agasalhos', detalhe: '240 unidades · R$ 45,00 por unidade', valor: 10800, comprovante: 'NF 0821' },
      { id: 2, descricao: 'Kits de higiene', detalhe: '300 kits · R$ 10,00 por kit', valor: 3000, comprovante: 'NF 0837' },
      { id: 3, descricao: 'Logística de distribuição', detalhe: 'Transporte e entrega à comunidade', valor: 1200, comprovante: 'Recibo 014' },
    ],
    relato: 'Com o apoio dos doadores, a Rede Esperança distribuiu 300 cobertores doados a 300 pessoas em situação de vulnerabilidade em São Paulo. Os R$ 15.000,00 arrecadados financiaram a compra de 240 agasalhos, 300 kits de higiene e o transporte das entregas. As distribuições foram concluídas em 31/08/2026. Todos os recursos foram aplicados nesta campanha, sem saldo remanescente.',
    anexos: [
      { id: 1, nome: 'NF-0821-agasalhos.pdf', tipo: 'Nota fiscal', tamanhoKb: 420 },
      { id: 2, nome: 'NF-0837-higiene.pdf', tipo: 'Nota fiscal', tamanhoKb: 318 },
      { id: 3, nome: 'recibo-014-transporte.pdf', tipo: 'Recibo de serviço', tamanhoKb: 210 },
    ],
    publicada: false,
  },
}

const DETALHES = { 1: mesa, 7: inverno }

// Detalhe da campanha; sem dados específicos, deriva do que a campanha já tem.
export function detalheCampanha(c) {
  return {
    itens: (c.necessidades ?? []).map((n) => ({ nome: n.nome, especificacao: '', meta: n.meta, recebido: 0 })),
    familias: null,
    doacoes: { total: 0, financeiras: 0, itens: 0, linhas: [] },
    ultima: null, atualizadoEm: null, timeline: [], impacto: null, prestacao: null, relatorioSalvoEm: null,
    ...DETALHES[c.id],
    ...(c.itens ? { itens: c.itens } : {}),
    ...(c.timeline ? { timeline: c.timeline } : {}),
  }
}
