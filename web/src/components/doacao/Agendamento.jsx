import { useState } from 'react'
import { Aviso, Botao, Campo, Secao } from '../Ui'
import { JANELAS_AGENDAMENTO, validarAgendamento } from '../../utils/doacao'
import '../../styles/doacao.css'

// DOA-07. Entrega: o doador leva à entidade. Retirada: a entidade busca no endereço informado.
export default function Agendamento({ campanha, hoje, valorInicial, enviando, erro, onVoltar, onConcluir }) {
  const [form, setForm] = useState(valorInicial)
  const [erros, setErros] = useState({})
  const definir = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }))

  function enviar(e) {
    e.preventDefault()
    const encontrados = validarAgendamento(form, { hoje, limite: campanha.encerraEm })
    setErros(encontrados)
    if (Object.keys(encontrados).length === 0) onConcluir({ ...form, endereco: form.modo === 'retirada' ? form.endereco.trim() : '' })
  }

  return (
    <Secao titulo="Agende a entrega ou a retirada" descricao="Combine como os itens chegam até a entidade.">
      <form onSubmit={enviar} className="form-grid" noValidate>
        <fieldset className="opcoes-agendamento campo--inteiro">
          <legend>Como prefere doar?</legend>
          {[
            ['entrega', 'Eu levo os itens', `Ponto de entrega: sede da ${campanha.entidade}, ${campanha.cidade}.`],
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
          <Campo rotulo="Data" name="data" type="date" required min={hoje} max={campanha.encerraEm} value={form.data} onChange={definir('data')} />
          {erros.data && <small role="alert" className="erro-campo">{erros.data}</small>}
        </div>
        <div>
          <Campo rotulo="Período">
            <select name="janela" required value={form.janela} onChange={definir('janela')}>
              <option value="">Selecione um período</option>
              {JANELAS_AGENDAMENTO.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </Campo>
          {erros.janela && <small role="alert" className="erro-campo">{erros.janela}</small>}
        </div>
        {form.modo === 'retirada' && (
          <div className="campo--inteiro">
            <Campo rotulo="Endereço para retirada" name="endereco" required autoComplete="street-address" value={form.endereco} onChange={definir('endereco')} />
            {erros.endereco && <small role="alert" className="erro-campo">{erros.endereco}</small>}
          </div>
        )}
        <div className="campo--inteiro">
          <Aviso>Agendamento de demonstração: a entidade não é avisada e nenhum horário é reservado de verdade.</Aviso>
        </div>
        {erro && (
          <div className="campo--inteiro">
            <Aviso erro>{erro}</Aviso>
          </div>
        )}
        <div className="acoes campo--inteiro">
          <Botao secundario onClick={onVoltar} disabled={enviando}>
            Voltar
          </Botao>
          <Botao type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Confirmar agendamento'}
          </Botao>
        </div>
      </form>
    </Secao>
  )
}
