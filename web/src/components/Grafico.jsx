import { formatarMoeda } from '../utils/format'
import { serieFinanceira, serieItens } from '../utils/gestao'
import { Vazio } from './Ui'

export default function Grafico({
  doacoes,
  id = 'arrecadacao',
  medida = 'financeira',
}) {
  const itens = medida === 'itens'
  const pontos = itens ? serieItens(doacoes) : serieFinanceira(doacoes)
  const formatar = (valor) =>
    itens
      ? `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} un.`
      : formatarMoeda(valor)
  if (!pontos.length)
    return (
      <Vazio
        titulo={
          itens
            ? 'Sem recebimentos neste período'
            : 'Sem arrecadação neste período'
        }
      >
        {itens
          ? 'Não há doações de itens confirmadas para os filtros selecionados.'
          : 'Não há pagamentos confirmados para os filtros selecionados.'}
      </Vazio>
    )
  const max = Math.max(...pontos.map((p) => p.acumulado), 1)
  const primeiraData = Date.parse(pontos[0].data),
    ultimaData = Date.parse(pontos.at(-1).data)
  const eixoX = (p) =>
    ultimaData === primeiraData
      ? 385
      : 80 +
        ((Date.parse(p.data) - primeiraData) / (ultimaData - primeiraData)) *
          610
  const coordenadas = pontos.map(
    (p) => `${eixoX(p)},${190 - (p.acumulado / max) * 160}`,
  )
  const linha = coordenadas.join(' ')
  return (
    <figure className="grafico">
      <svg
        viewBox="0 0 720 235"
        role="img"
        aria-label={`${itens ? 'Itens recebidos' : 'Arrecadação acumulada'}: ${formatar(pontos.at(-1).acumulado)} em ${pontos.length} datas`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity=".22" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="80"
              x2="690"
              y1={30 + i * 53.3}
              y2={30 + i * 53.3}
              stroke="#edf0f5"
            />
            <text x="67" textAnchor="end" y={34 + i * 53.3}>
              {formatar(max * (1 - i / 3)).replace(',00', '')}
            </text>
          </g>
        ))}
        {pontos.length > 1 && (
          <polygon
            points={`${eixoX(pontos[0])},190 ${linha} ${eixoX(pontos.at(-1))},190`}
            fill={`url(#${id})`}
          />
        )}
        <polyline
          points={linha}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />
        {pontos.map((p, i) => (
          <g key={p.data}>
            <circle
              cx={coordenadas[i].split(',')[0]}
              cy={coordenadas[i].split(',')[1]}
              r="3"
              fill="#2563eb"
            >
              <title>
                {p.data}: {formatar(p.acumulado)}
              </title>
            </circle>
            <text x={eixoX(p)} y="219" textAnchor="middle">
              {p.data.slice(8)}/{p.data.slice(5, 7)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {itens
          ? 'Recebimentos confirmados · unidades acumuladas'
          : 'Pagamentos confirmados · valores acumulados'}
      </figcaption>
      <details>
        <summary>Ver dados do gráfico</summary>
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>{itens ? 'Itens acumulados' : 'Arrecadação acumulada'}</th>
            </tr>
          </thead>
          <tbody>
            {pontos.map((p) => (
              <tr key={p.data}>
                <td>{p.data}</td>
                <td>{formatar(p.acumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
