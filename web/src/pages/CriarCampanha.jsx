import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { Aviso, Botao, Campo, Etapas, Secao } from '../components/Ui'
import PageHeader from '../components/PageHeader'
import { categorias } from '../mocks/gestao'
import { validarPeriodo } from '../utils/gestao'

export default function CriarCampanha() {
  const { dados, atualizar, notificar } = useDemo(),
    navigate = useNavigate(),
    [erro, setErro] = useState(''),
    [salvando, setSalvando] = useState(false)
  async function salvar(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    const mensagem = validarPeriodo(f.inicio, f.encerraEm)
    if (mensagem) {
      setErro(mensagem)
      return
    }
    if (!f.nome.trim() || !f.descricao.trim()) {
      setErro('Informe o nome e a descrição da campanha.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      const nova = {
        id: Date.now(),
        nome: f.nome.trim(),
        descricao: f.descricao.trim(),
        categoria: f.categoria,
        meta: Number(f.meta),
        arrecadado: 0,
        entidade: dados.entidade.nome,
        entidadeId: dados.entidade.id,
        cidade: f.cidade,
        criadaEm: f.inicio,
        encerraEm: f.encerraEm,
        status: 'Rascunho',
        imagem: '/images/alimentos.jpg',
        itensMeta: 0,
        itensRecebidos: 0,
      }
      atualizar('campanhas', [...dados.campanhas, nova])
      notificar('Rascunho salvo nesta sessão de demonstração.')
      navigate('/campanhas')
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }
  return (
    <>
      <div className="breadcrumb">
        <Link to="/campanhas">Campanhas</Link>
        <span>/</span>Criar campanha
      </div>
      <PageHeader
        titulo="Criar campanha"
        descricao="Comece contando a história da sua causa."
      />
      <Etapas
        atual={0}
        itens={[
          'Dados básicos',
          'Metas e necessidades',
          'Revisão e publicação',
        ]}
      />
      <div className="dashboard-grid">
        <Secao
          titulo="Dados básicos"
          descricao="As informações ajudam os doadores a conhecer sua iniciativa."
        >
          <form onSubmit={salvar} className="form-grid">
            <Campo
              rotulo="Nome da campanha"
              name="nome"
              required
              maxLength={120}
              placeholder="Ex.: Mesa solidária para 200 famílias"
              className="campo--inteiro"
            />
            <Campo rotulo="Categoria">
              <select name="categoria" required>
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Campo>
            <Campo
              rotulo="Localização"
              name="cidade"
              required
              defaultValue="São Paulo, SP"
            />
            <Campo rotulo="Descrição da campanha" className="campo--inteiro">
              <textarea
                name="descricao"
                required
                rows={6}
                maxLength={3000}
                placeholder="Conte a história, quem será beneficiado e como a doação será utilizada."
              />
            </Campo>
            <Campo rotulo="Início" name="inicio" type="date" required />
            <Campo
              rotulo="Encerramento"
              name="encerraEm"
              type="date"
              required
            />
            <Campo
              rotulo="Meta financeira (R$)"
              name="meta"
              type="number"
              required
              min="1"
              step="0.01"
              placeholder="30000"
              ajuda="Valor inicial para o rascunho de demonstração."
            />
            <div className="campo--inteiro">
              <Aviso>
                O rascunho ficará apenas nesta sessão. Publicação, envio de
                imagens e etapas seguintes dependem da integração e das issues
                de campanha correspondentes.
              </Aviso>
            </div>
            {erro && (
              <div className="campo--inteiro">
                <Aviso erro>{erro}</Aviso>
              </div>
            )}
            <div className="acoes campo--inteiro">
              <Botao para="/campanhas" secundario>
                Cancelar
              </Botao>
              <Botao type="submit" disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar rascunho'}
              </Botao>
            </div>
          </form>
        </Secao>
        <Secao titulo="Uma boa campanha começa com uma boa história">
          <p>
            Seja claro sobre o objetivo e as pessoas que serão beneficiadas.
          </p>
          <ul className="lista-dicas">
            <li>Escolha um nome fácil de entender.</li>
            <li>Explique como os recursos serão utilizados.</li>
            <li>Informe o período da campanha.</li>
            <li>Mantenha as informações transparentes.</li>
          </ul>
        </Secao>
      </div>
    </>
  )
}
