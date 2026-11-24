import { campanhas, doacoes, entidades } from './dados'

const LATENCIA_MS = 400

// Mesma interface dos services reais (src/services): listar() e buscarPorId().
// Na issue #35 basta trocar o import das telas de '../mocks' para '../services'.
function criarServico(lista) {
  const responder = (valor) =>
    new Promise((resolve) => setTimeout(() => resolve(structuredClone(valor)), LATENCIA_MS))

  return {
    listar: () => responder(lista),
    buscarPorId: (id) => responder(lista.find((item) => item.id === Number(id)) ?? null),
  }
}

export const campanhasService = criarServico(campanhas)
export const doacoesService = criarServico(doacoes)
export const entidadesService = criarServico(entidades)
