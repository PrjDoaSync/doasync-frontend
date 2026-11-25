import { Campo } from './Ui'
import { CATEGORIAS_SUGERIDAS, IMAGENS_CAMPANHA } from '../utils/criarCampanha'

// Campos de campanha compartilhados por "Criar campanha" e "Editar campanha".
// `f` usa os nomes da API (titulo, descricao, metaValor, dataInicio, dataFim, categoria, imagemUrl).
export default function CamposCampanha({ f, setF, erros, bloquearInicio = false }) {
  const campo = (nome, ajuda) => ({
    name: nome,
    value: f[nome],
    onChange: (e) => setF((atual) => ({ ...atual, [nome]: e.target.value })),
    ajuda: erros[nome] ?? ajuda,
    'aria-invalid': erros[nome] ? true : undefined,
  })
  const capaLocal = IMAGENS_CAMPANHA.some((img) => img.arquivo === f.imagemUrl)

  return (
    <div className="form-grid">
      <Campo rotulo="Título da campanha" required maxLength={200} className="campo--inteiro" placeholder="Ex.: Mesa solidária para 200 famílias" {...campo('titulo')} />
      <Campo rotulo="Categoria" maxLength={200} list="categorias-campanha" {...campo('categoria', 'Escolha uma sugestão ou escreva outra.')} />
      <datalist id="categorias-campanha">
        {CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}
      </datalist>
      <Campo rotulo="Meta financeira (R$)" required inputMode="decimal" placeholder="30000" {...campo('metaValor')} />
      <Campo rotulo="Descrição da campanha" required className="campo--inteiro" ajuda={erros.descricao}>
        <textarea
          name="descricao"
          rows={6}
          maxLength={10000}
          value={f.descricao}
          aria-invalid={erros.descricao ? true : undefined}
          placeholder="Conte a história, quem será beneficiado e como a doação será utilizada."
          onChange={(e) => setF((atual) => ({ ...atual, descricao: e.target.value }))}
        />
      </Campo>
      <Campo
        rotulo="Início"
        type="date"
        required
        disabled={bloquearInicio}
        {...campo('dataInicio', bloquearInicio ? 'A data de início não muda depois que a campanha começa.' : 'Com início futuro, a campanha fica agendada.')}
      />
      <Campo rotulo="Encerramento" type="date" required {...campo('dataFim')} />
      <fieldset className="imagens-campanha campo--inteiro">
        <legend>Imagem de capa</legend>
        {IMAGENS_CAMPANHA.map((img) => (
          <label key={img.arquivo} className={f.imagemUrl === img.arquivo ? 'selecionada' : ''}>
            <input
              type="radio"
              name="imagem"
              value={img.arquivo}
              checked={f.imagemUrl === img.arquivo}
              onChange={() => setF((atual) => ({ ...atual, imagemUrl: img.arquivo }))}
            />
            <img src={img.arquivo} alt="" />
            <span>{img.rotulo}</span>
          </label>
        ))}
      </fieldset>
      <Campo
        rotulo="Ou informe o endereço de uma imagem"
        type="url"
        placeholder="https://"
        className="campo--inteiro"
        name="imagemUrl"
        value={capaLocal ? '' : f.imagemUrl}
        onChange={(e) => setF((atual) => ({ ...atual, imagemUrl: e.target.value }))}
        ajuda={erros.imagemUrl ?? 'O envio de arquivos não existe na API: use uma das capas acima ou um link.'}
        aria-invalid={erros.imagemUrl ? true : undefined}
      />
    </div>
  )
}
