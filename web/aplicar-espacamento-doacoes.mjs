// Aplica o CSS de espaçamento das telas de doação (#102 e #103).
// Uso (na pasta web):  node aplicar-espacamento-doacoes.mjs
// Remove os blocos antigos pelo comentário (se existirem) e acrescenta os corretos.
// Pode ser executado mais de uma vez sem duplicar nada.
import fs from 'node:fs'

const caminho = 'src/index.css'
if (!fs.existsSync(caminho)) {
  console.error('Execute dentro da pasta web (src/index.css não encontrado).')
  process.exit(1)
}
const NOVO = `/* Confirmação da doação (#102): medidas do protótipo em px de tela (imagem x 1,295) */
.confirmacao .public-page-title { margin: 10px 0 26px; }
.confirmacao > .etapas { margin-bottom: 23px; }
.confirmacao > .banner-status { margin-bottom: 23px; }
.confirmacao .detalhe-grid { grid-template-columns: minmax(0, 2.22fr) minmax(280px, 1fr); gap: 22px; }
.confirmacao .comprovante { gap: 0; }
.confirmacao .comprovante .secao__cabecalho { margin-bottom: 6px; }
.confirmacao .comprovante-linhas { display: grid; }
.confirmacao .comprovante-linhas dl { margin: 0; }
.confirmacao .comprovante-linhas .linhas-resumo > div,
.confirmacao .linhas-resumo__campanha { display: flex; align-items: center; justify-content: space-between; min-height: 29px; margin: 0; padding: 0; font-size: 13px; }
.confirmacao .total-linha { margin: 16px 0 0; padding-top: 15px; }
.confirmacao .comprovante .form-grid { margin-top: 15px; gap: 14px; }
.confirmacao .comprovante > small { margin-top: 20px; }
.confirmacao .doc-card { padding: 18px; gap: 10px; }
.confirmacao .doc-card h3 { font-size: 14px; line-height: 1.3; }
.confirmacao .doc-card p { font-size: 12px; line-height: 1.35; }
.confirmacao .doc-card button { min-height: 35px; margin-top: 2px; font-size: 13px; }
.confirmacao .lateral-confirmacao { gap: 22px; top: 24px; }
.confirmacao .lateral-confirmacao .cartao { gap: 12px; }
.confirmacao .lateral-confirmacao .linhas-resumo { margin: 0; }
.confirmacao .lateral-confirmacao .linhas-resumo > div { display: flex; align-items: center; justify-content: space-between; min-height: 37px; padding: 0; font-size: 13px; }
.confirmacao .nota-caixa { padding: 12px; font-size: 12px; }
.confirmacao .acoes { margin-top: 24px; }

/* Minhas doações (#103): medidas do protótipo em px de tela (imagem x 1,27) */
.kpis--3 { gap: 22px; margin-bottom: 22px; }
.historico { padding: 0; gap: 0; }
.historico .secao__cabecalho { align-items: center; padding: 22px 20px 0; }
.historico .secao__cabecalho h2 { font-size: 18px; }
.historico .secao__cabecalho button { min-height: 34px; padding: 0 14px; font-size: 13px; }
.historico__filtros { grid-template-columns: minmax(0, 1fr) 130px 138px 144px; gap: 12px; margin: 20px 0; padding: 0 20px; }
.historico__filtros select,
.historico__busca { height: 37px; padding: 0 12px; font-size: 13px; }
.historico .tabela { font-size: 13px; }
.historico .tabela th { padding: 8px 12px; }
.historico .tabela td { padding: 18px 12px; }
.historico .tabela th:first-child,
.historico .tabela td:first-child { padding-left: 20px; }
.historico .tabela th:last-child,
.historico .tabela td:last-child { padding-right: 20px; }
.historico .tabela small { font-size: 11.5px; }
.historico__rodape { margin: 0; padding: 18px 20px; }
.pagina-atual { padding: 5px 10px; }
.public-section > .acoes--entre { margin-top: 22px; }
`
const marcadores = [
  '/* Confirmação da doação: espaçamentos medidos no protótipo (#102) */',
  '/* Minhas doações: espaçamentos medidos no protótipo (#103) */',
  '/* Confirmação da doação (#102): medidas do protótipo',
  '/* Minhas doações (#103): medidas do protótipo',
]
let css = fs.readFileSync(caminho, 'utf8')
let removidos = 0
for (const m of marcadores) {
  for (;;) {
    const i = css.indexOf(m)
    if (i < 0) break
    const j = css.indexOf('\n/*', i + m.length)
    css = css.slice(0, i).trimEnd() + '\n' + (j < 0 ? '' : css.slice(j))
    removidos++
  }
}
fs.writeFileSync(caminho, css.trimEnd() + '\n\n' + NOVO)
console.log(`index.css atualizado (${removidos} bloco(s) antigo(s) removido(s)).`)

// Confere se os patches anteriores das telas foram aplicados.
const confere = [
  ['src/pages/ConfirmacaoDoacao.jsx', 'comprovante-linhas', 'doacoes-102-espacamento-confirmacao.patch'],
  ['src/pages/MinhasDoacoes.jsx', 'historico__filtros', 'doacoes-102-103-ajuste-visual.patch'],
]
for (const [arquivo, trecho, patch] of confere) {
  const ok = fs.existsSync(arquivo) && fs.readFileSync(arquivo, 'utf8').includes(trecho)
  if (!ok) console.warn(`ATENÇÃO: ${arquivo} ainda não tem a estrutura esperada. Aplique antes o ${patch}.`)
}
