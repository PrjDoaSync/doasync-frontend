const caminhos = {
  arquivo: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 14l2 2 4-4',
  enviar: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  upload: 'M12 15V3 M7 8l5-5 5 5 M3 17v4h18v-4',
  imagem: 'M3 5h18v14H3z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3 M21 16l-5-5-8 8',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 11v6 M12 7.5v.5',
  chevron: 'M9 6l6 6-6 6',
  filtro: 'M6 9l6 6 6-6',
}
export function Ico({ nome, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={caminhos[nome]} />
    </svg>
  )
}
