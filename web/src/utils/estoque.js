export function movimentarEstoque(
  dados,
  { itemId, tipo, quantidade, destino, data },
) {
  const item = dados.itens.find((i) => String(i.id) === String(itemId))
  const qtd = Number(quantidade)
  if (!item) throw new Error('Selecione um item válido.')
  if (!['Entrada', 'Saída'].includes(tipo))
    throw new Error('Selecione um tipo de movimentação válido.')
  if (!Number.isInteger(qtd) || qtd <= 0)
    throw new Error('Informe uma quantidade inteira maior que zero.')
  if (tipo === 'Saída' && qtd > item.recebido - item.destinado)
    throw new Error('A quantidade excede o saldo disponível.')
  if (!destino.trim())
    throw new Error('Informe a origem ou o destino da movimentação.')
  return {
    itens: dados.itens.map((i) =>
      i.id === item.id
        ? {
            ...i,
            [tipo === 'Entrada' ? 'recebido' : 'destinado']:
              i[tipo === 'Entrada' ? 'recebido' : 'destinado'] + qtd,
          }
        : i,
    ),
    movimento: {
      id: crypto.randomUUID(),
      itemId: item.id,
      item: item.nome,
      tipo,
      quantidade: qtd,
      destino: destino.trim(),
      data,
    },
  }
}
