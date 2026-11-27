import { useState } from 'react'
import AvisoIndisponivel from '../AvisoIndisponivel'
import { Aviso, Botao, Campo, Secao } from '../Ui'
import { JANELAS_AGENDAMENTO, validarAgendamento } from '../../utils/doacao'

// DOA-07 (#101). Entrega: o doador leva os itens à entidade. Retirada: a entidade busca no
// endereço informado. Sem rota de agendamento na API: a confirmação mostra a pendência.
export default function Agendamento({ destino, hoje, valorInicial, enviando, erro, onVoltar, onConcluir }) {
  const [form, setForm] = useState(valorInicial)
  const [erros, setErros] = useState({})
  const definir = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }))
  const local = destino.cidade ? `${destino.entidade}, ${destino.cidade}` : destino.entidade

  function enviar(e) {
    e.preventDefault()
    const encontrados = validarAgendamento(form, { hoje, limite: destino.encerraEm })
    setErros(encontrados)
    if (Object.keys(encontrados).length === 0)
      onConcluir({ ...form, endereco: form.modo === 'retirada' ? form.endereco.trim() : '' })
  }

  const erroCampo = (campo) => erros[campo] && <small role="alert" className="erro-campo">{erros[campo]}</small>

  return (
    <Secao titulo="Agende a entrega ou a retirada" descricao="Combine como os itens chegam até a entidade.">
      <AvisoIndisponivel recurso="agendamento" />
      <form onSubmit={enviar} className="form-grid" noValidate>
        <fieldset className="opcoes-agendamento campo--inteiro">
          <legend>Como prefere doar?</legend>
          {[
            ['entrega', 'Eu levo os itens', `Ponto de entrega: sede da ${local}.`],
            ['retirada', 'Quero que retirem comigo', 'A entidade combina a retirada no endereço que você informar.'],
          ].map(([valor, titulo, texto]) => (
            <label key={valor} className={form.modo === valor ? 'selecionado' : ''}>
              <input type="radio" name="modo" value={valor} checked={form.modo === valor} onChange={definir('modo')} />
              <strong>{titulo}</strong>
              <small>{texto}</small>
            </label>
          ))}
        </fieldset>
        <div>
          <Campo
            rotulo="Data"
            name="data"
            type="date"
            required
            min={hoje}
            max={destino.encerraEm || undefined}
            value={form.data}
            aria-invalid={Boolean(erros.data)}
            onChange={definir('data')}
          />
          {erroCampo('data')}
        </div>
        <div>
          <Campo rotulo="Período" required>
            <select name="janela" required value={form.janela} aria-invalid={Boolean(erros.janela)} onChange={definir('janela')}>
              <option value="">Selecione um período</option>
              {JANELAS_AGENDAMENTO.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </Campo>
          {erroCampo('janela')}
        </div>
        {form.modo === 'retirada' && (
          <div className="campo--inteiro">
            <Campo
              rotulo="Endereço para retirada"
              name="endereco"
              required
              autoComplete="street-address"
              value={form.endereco}
              aria-invalid={Boolean(erros.endereco)}
              onChange={definir('endereco')}
            />
            {erroCampo('endereco')}
          </div>
        )}
        {erro && (
          <div className="campo--inteiro">
            <Aviso erro>{erro}</Aviso>
          </div>
        )}
        <div className="acoes campo--inteiro">
          <Botao secundario onClick={onVoltar} disabled={enviando}>Voltar</Botao>
          <Botao type="submit" disabled={enviando}>Revisar doação de itens</Botao>
        </div>
      </form>
    </Secao>
  )
}
