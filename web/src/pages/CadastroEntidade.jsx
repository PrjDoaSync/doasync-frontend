import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { Aviso, Botao, Campo, Etapas, Icon, Secao } from '../components/Ui'
import PageHeader from '../components/PageHeader'
import { validarCnpj } from '../utils/gestao'

export default function CadastroEntidade({ perfil = false }) {
  const { dados, atualizar, notificar } = useDemo(),
    [form, setForm] = useState(dados.entidade),
    [erro, setErro] = useState(''),
    [sucesso, setSucesso] = useState(false),
    [salvando, setSalvando] = useState(false)
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  function documentos(e) {
    const arquivos = [...e.target.files]
    if (
      arquivos.some(
        (a) =>
          a.size > 10 * 1024 * 1024 ||
          !['application/pdf', 'image/jpeg', 'image/png'].includes(a.type),
      )
    ) {
      setErro('Use documentos PDF, JPG ou PNG de até 10 MB cada.')
      e.target.value = ''
      return
    }
    setErro('')
    setForm({
      ...form,
      documentos: [
        ...form.documentos,
        ...arquivos.map((a) => ({ nome: a.name, tamanho: a.size })),
      ],
    })
    e.target.value = ''
  }
  async function salvar(e) {
    e.preventDefault()
    setSucesso(false)
    if (!form.nome.trim() || !form.responsavel.trim()) {
      setErro('Informe o nome da entidade e do responsável.')
      return
    }
    if (!validarCnpj(form.cnpj)) {
      setErro('Informe um CNPJ numérico válido, com 14 dígitos.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      atualizar('entidade', {
        ...form,
        nome: form.nome.trim(),
        responsavel: form.responsavel.trim(),
      })
      setSucesso(true)
      notificar('Informações atualizadas somente nesta sessão de demonstração.')
    } catch {
      setErro('Não foi possível salvar as informações. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }
  return (
    <>
      <div className="breadcrumb">
        <Link to="/dashboard">Área da entidade</Link>
        <span>/</span>
        {perfil ? 'Perfil e configurações' : 'Cadastro e verificação'}
      </div>
      <PageHeader
        titulo={
          perfil
            ? 'Perfil da entidade e configurações'
            : 'Prepare sua entidade para receber doações'
        }
        descricao={
          perfil
            ? 'Mantenha os dados e as preferências da sua entidade atualizados.'
            : 'Confira os dados da entidade e acompanhe a verificação dos documentos.'
        }
      />
      {perfil ? (
        <div className="abas">
          <Link to="/configuracoes" className="ativa">
            Perfil da entidade
          </Link>
          <Link to="/configuracoes/usuarios">Usuários e permissões</Link>
        </div>
      ) : (
        <Etapas
          atual={form.documentos.length ? 2 : 0}
          itens={['Informações da entidade', 'Documentos', 'Verificação']}
        />
      )}
      <form onSubmit={salvar}>
        <div className="dashboard-grid">
          <div className="pilha">
            <Secao
              titulo="Informações da entidade"
              descricao="Os campos com * são obrigatórios. Seus dados ficam apenas nesta sessão."
            >
              <div className="form-grid">
                <Campo
                  rotulo="Nome da entidade"
                  name="nome"
                  value={form.nome}
                  onChange={alterar}
                  required
                  maxLength={150}
                />
                <Campo
                  rotulo="CNPJ"
                  name="cnpj"
                  inputMode="numeric"
                  value={form.cnpj}
                  onChange={alterar}
                  required
                  maxLength={18}
                />
                <Campo
                  rotulo="E-mail institucional"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={alterar}
                  required
                />
                <Campo
                  rotulo="Telefone"
                  name="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={alterar}
                  required
                  pattern="[0-9()+ .-]{10,20}"
                />
                <Campo rotulo="Área de atuação">
                  <select name="area" value={form.area} onChange={alterar}>
                    {[
                      'Assistência social e alimentação',
                      'Educação',
                      'Saúde',
                      'Meio ambiente',
                      'Proteção animal',
                      'Outros',
                    ].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Campo>
                <Campo
                  rotulo="Localização"
                  name="cidade"
                  value={form.cidade}
                  onChange={alterar}
                  required
                />
                <Campo
                  rotulo="Responsável legal"
                  name="responsavel"
                  className="campo--inteiro"
                  value={form.responsavel}
                  onChange={alterar}
                  required
                />
                {perfil && (
                  <>
                    <Campo
                      rotulo="Site"
                      name="site"
                      type="url"
                      className="campo--inteiro"
                      value={form.site}
                      onChange={alterar}
                      placeholder="https://"
                    />
                    <Campo rotulo="Sobre a entidade" className="campo--inteiro">
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={alterar}
                        rows={4}
                      />
                    </Campo>
                  </>
                )}
              </div>
            </Secao>
            <Secao
              titulo="Documentos para verificação"
              descricao="PDF, JPG ou PNG · até 10 MB por arquivo. A seleção não realiza envio."
            >
              {form.documentos.length ? (
                form.documentos.map((doc, i) => (
                  <div className="lista-linha" key={`${doc.nome}-${i}`}>
                    <span>
                      <Icon nome="relatorios" />
                      {doc.nome}
                      <small>
                        {Math.ceil(doc.tamanho / 1024)} KB · selecionado
                        localmente
                      </small>
                    </span>
                    <button
                      type="button"
                      className="link-botao"
                      onClick={() =>
                        setForm({
                          ...form,
                          documentos: form.documentos.filter(
                            (_, index) => index !== i,
                          ),
                        })
                      }
                      aria-label={`Remover ${doc.nome}`}
                    >
                      Remover
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum documento selecionado.</p>
              )}
              <Campo
                rotulo="Adicionar documentos"
                ajuda="Comprovante de CNPJ, estatuto social e documento do responsável."
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={documentos}
                />
              </Campo>
            </Secao>
          </div>
          <Secao
            titulo={
              perfil ? 'Dados da sua entidade' : 'Verificação da entidade'
            }
          >
            <span className="badge badge--alerta">
              {perfil ? 'Ambiente de demonstração' : 'Envio pendente'}
            </span>
            <h3>
              {perfil
                ? dados.entidade.nome
                : 'Tudo pronto para o próximo passo?'}
            </h3>
            <p>Confira suas informações e os documentos necessários.</p>
            <ul className="lista-dicas">
              <li>Dados institucionais atualizados</li>
              <li>Responsável legal identificado</li>
              <li>Comprovante de CNPJ</li>
              <li>Estatuto e documento do responsável</li>
            </ul>
            <Aviso>
              A verificação depende do envio e da análise pelo serviço
              responsável. Selecionar documentos não significa que a entidade
              foi verificada.
            </Aviso>
            <Link className="link-azul" to="/dashboard">
              Voltar ao dashboard →
            </Link>
          </Secao>
        </div>
        {erro && <Aviso erro>{erro}</Aviso>}
        {sucesso && (
          <Aviso>
            Informações salvas na demonstração. Nenhum documento foi enviado
            para análise.
          </Aviso>
        )}
        <div className="acoes acoes--fim">
          <Botao
            secundario
            onClick={() => {
              setForm({ ...dados.entidade })
              setErro('')
              setSucesso(false)
            }}
          >
            Descartar alterações
          </Botao>
          <Botao type="submit" disabled={salvando}>
            <Icon nome="check" />
            {salvando ? 'Salvando…' : 'Salvar informações'}
          </Botao>
        </div>
      </form>
    </>
  )
}
