// Recursos previstos no Figma e nos requisitos que ainda não têm rota no backend
// (contrato oficial do doa-sync e código da `main` do doasync-backend, conferidos em 27/11/2026).
// As telas mostram o aviso de pendência e chamam funções de serviço que rejeitam com
// RecursoIndisponivelError. Quando a rota existir, troque a implementação no serviço
// correspondente e marque `disponivel: true` aqui. Nenhum endpoint é presumido.
export const RECURSOS_PENDENTES = {
  doacaoItens: {
    titulo: 'Doação de itens',
    motivo: 'A API ainda não registra doações de itens nem informa os itens de que cada campanha precisa.',
  },
  agendamento: {
    titulo: 'Agendamento de entrega ou retirada',
    motivo: 'A API ainda não oferece agendamento de entrega ou retirada de itens.',
  },
  cartao: {
    titulo: 'Pagamento com cartão',
    motivo: 'A API aceita somente PIX: o pagamento com cartão depende da integração com um provedor de pagamentos.',
  },
  boleto: {
    titulo: 'Pagamento com boleto',
    motivo: 'A API aceita somente PIX: a emissão de boletos depende da integração com um provedor de pagamentos.',
  },
  provedorPix: {
    titulo: 'QR Code e código PIX',
    motivo: 'Ainda não há provedor PIX integrado: a API registra a doação sem gerar cobrança.',
  },
  uploadImagens: {
    titulo: 'Envio de imagens',
    motivo: 'A API ainda não recebe arquivos: a capa da campanha é informada por endereço (URL).',
  },
  itensCampanha: {
    titulo: 'Itens da campanha',
    motivo: 'A API ainda não guarda metas por item: só a meta financeira é enviada.',
  },
  prestacaoContas: {
    titulo: 'Prestação de contas',
    motivo: 'A API ainda não permite publicar a destinação dos recursos e os comprovantes de uma campanha.',
  },
  recuperacaoSenha: {
    titulo: 'Recuperação de senha',
    motivo: 'A API ainda não envia e-mails de recuperação. Com a sessão ativa, a senha pode ser trocada em Minha conta.',
  },
  equipeEntidade: {
    titulo: 'Equipe da entidade',
    motivo: 'A API ainda não permite convidar pessoas nem definir permissões: cada entidade tem um único gestor.',
  },
  relatorioPdf: {
    titulo: 'Relatório em PDF',
    motivo: 'A API ainda não gera relatórios oficiais (exportação no servidor fora do MVP). Use a exportação CSV.',
  },
  estoqueItens: {
    titulo: 'Controle de itens doados',
    motivo: 'A API ainda não oferece cadastro nem movimentação de estoque.',
  },
}

export class RecursoIndisponivelError extends Error {
  constructor(chave) {
    const recurso = RECURSOS_PENDENTES[chave]
    super(recurso?.motivo ?? 'Recurso ainda não disponível na API.')
    this.name = 'RecursoIndisponivelError'
    this.recurso = chave
    this.indisponivel = true
  }
}

// Usada pelos serviços enquanto a rota não existe: nada é enviado.
export const recursoIndisponivel = (chave) => Promise.reject(new RecursoIndisponivelError(chave))
