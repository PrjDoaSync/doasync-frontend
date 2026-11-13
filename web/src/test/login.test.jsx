import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import * as fonte from '../mocks/gestao'

beforeEach(() => {
  vi.spyOn(fonte, 'carregarDemo').mockImplementation(() =>
    Promise.resolve(fonte.criarDadosDemo()),
  )
})

async function abrirLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { name: 'Bem-vinda ao DoaSync', level: 1 })
  return userEvent.setup()
}

describe('GES-01: Login e recuperação de senha (#105, #68)', () => {
  describe('Composição visual e estrutura geral', () => {
    it('renderiza o cabeçalho com marca e ação "Precisa de ajuda?" sem menu público padrão', async () => {
      await abrirLogin()

      // Header presente
      const banner = screen.getByRole('banner')
      expect(banner).toBeTruthy()

      // Ação de ajuda à direita
      const linkAjuda = screen.getByRole('link', { name: 'Precisa de ajuda?' })
      expect(linkAjuda).toBeTruthy()
      expect(linkAjuda.getAttribute('href')).toBe('/ajuda')

      // Não deve exibir os links de navegação da vitrine (Início, Campanhas, Entidades)
      expect(screen.queryByRole('navigation', { name: 'Navegação pública' })).toBe(null)
    })

    it('renderiza a área principal com título, subtítulo e categoria', async () => {
      await abrirLogin()

      expect(screen.getByText('GESTÃO · ACESSO DA ENTIDADE')).toBeTruthy()
      expect(
        screen.getByRole('heading', { name: 'Bem-vinda ao DoaSync', level: 1 }),
      ).toBeTruthy()
      expect(
        screen.getByText(
          'Acesse sua entidade para acompanhar campanhas, doações e o impacto da sua rede.',
        ),
      ).toBeTruthy()
    })

    it('renderiza o painel institucional com imagem, chamada e três benefícios', async () => {
      await abrirLogin()

      const painelInstitucional = screen.getByRole('region', {
        name: 'Painel institucional',
      })
      expect(painelInstitucional).toBeTruthy()

      const img = screen.getByAltText(
        'Pessoas voluntárias organizando alimentos doados em caixas',
      )
      expect(img).toBeTruthy()
      expect(img.getAttribute('src')).toBe('/images/alimentos.jpg')

      expect(screen.getByText('Mais organização. Mais impacto.')).toBeTruthy()
      expect(
        screen.getByText(
          'Reúna sua arrecadação financeira e seus recebimentos de itens em um único lugar.',
        ),
      ).toBeTruthy()

      expect(
        screen.getByText('Acompanhe metas e evolução das campanhas'),
      ).toBeTruthy()
      expect(screen.getByText('Confirme entregas com segurança')).toBeTruthy()
      expect(
        screen.getByText('Mantenha a transparência com sua comunidade'),
      ).toBeTruthy()
    })

    it('renderiza a faixa informativa inferior de proteção de acesso', async () => {
      await abrirLogin()

      const faixa = screen.getByRole('note')
      expect(faixa).toBeTruthy()
      expect(
        screen.getByText(
          'Seu acesso é protegido. Nunca compartilhe sua senha ou o link de recuperação com outras pessoas.',
        ),
      ).toBeTruthy()
    })

    it('renderiza o rodapé público reutilizado com links institucionais', async () => {
      await abrirLogin()

      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeTruthy()
      expect(
        screen.getByText(/DoaSync · Conectando pessoas a causas/),
      ).toBeTruthy()
      expect(screen.getByRole('link', { name: 'Ajuda' })).toBeTruthy()
      expect(screen.getByRole('link', { name: 'Privacidade' })).toBeTruthy()
      expect(screen.getByRole('link', { name: 'Termos de uso' })).toBeTruthy()
    })
  })

  describe('Formulário de Login (Entre na sua conta)', () => {
    it('apresenta badge, título, subtítulo e campos acessíveis', async () => {
      await abrirLogin()

      expect(screen.getByText('Área da entidade')).toBeTruthy()
      expect(
        screen.getByRole('heading', { name: 'Entre na sua conta', level: 2 }),
      ).toBeTruthy()
      expect(
        screen.getByText(
          'Use o e-mail cadastrado como responsável pela entidade.',
        ),
      ).toBeTruthy()

      const inputEmail = screen.getByLabelText('E-mail')
      expect(inputEmail).toBeTruthy()
      expect(inputEmail.getAttribute('type')).toBe('email')

      const inputSenha = screen.getByLabelText('Senha')
      expect(inputSenha).toBeTruthy()
      expect(inputSenha.getAttribute('type')).toBe('password')

      const checkbox = screen.getByLabelText(
        'Manter conectado neste dispositivo',
      )
      expect(checkbox).toBeTruthy()
      expect(checkbox.checked).toBe(false)
    })

    it('alterna visibilidade da senha entre mascarada e texto legível', async () => {
      const user = await abrirLogin()

      const inputSenha = screen.getByLabelText('Senha')
      expect(inputSenha.getAttribute('type')).toBe('password')

      const btnToggle = screen.getByRole('button', { name: 'Exibir senha' })
      await user.click(btnToggle)

      expect(inputSenha.getAttribute('type')).toBe('text')
      expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy()

      await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
      expect(inputSenha.getAttribute('type')).toBe('password')
    })

    it('permite marcar e desmarcar o checkbox "Manter conectado"', async () => {
      const user = await abrirLogin()

      const checkbox = screen.getByLabelText(
        'Manter conectado neste dispositivo',
      )
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })

    it('valida campos obrigatórios de login no cliente', async () => {
      const user = await abrirLogin()

      const btnEntrar = screen.getByRole('button', { name: 'Entrar' })

      // Submissão vazia
      await user.click(btnEntrar)
      expect(screen.getByRole('alert').textContent).toContain(
        'Informe o seu e-mail de acesso.',
      )

      // E-mail em formato inválido
      const inputEmail = screen.getByLabelText('E-mail')
      await user.type(inputEmail, 'email-invalido')
      await user.click(btnEntrar)
      expect(screen.getByRole('alert').textContent).toContain(
        'Informe um formato de e-mail válido',
      )

      // E-mail válido, mas senha vazia
      await user.clear(inputEmail)
      await user.type(inputEmail, 'ana@redeesperanca.org.br')
      await user.click(btnEntrar)
      expect(screen.getByRole('alert').textContent).toContain(
        'Informe a sua senha.',
      )
    })

    it('informa pendência de integração de API sem forjar autenticação falsa', async () => {
      const user = await abrirLogin()

      await user.type(screen.getByLabelText('E-mail'), 'ana@redeesperanca.org.br')
      await user.type(screen.getByLabelText('Senha'), 'senha123')

      const btnEntrar = screen.getByRole('button', { name: 'Entrar' })
      await user.click(btnEntrar)

      await waitFor(() => {
        expect(screen.getByRole('status').textContent).toContain(
          'A autenticação com o servidor ainda não está integrada',
        )
      })
    })

    it('possui link navegável para cadastro de entidade', async () => {
      await abrirLogin()

      expect(
        screen.getByText('Sua entidade ainda não tem uma conta?'),
      ).toBeTruthy()
      const linkCadastrar = screen.getByRole('link', {
        name: 'Cadastrar entidade',
      })
      expect(linkCadastrar).toBeTruthy()
      expect(linkCadastrar.getAttribute('href')).toBe('/cadastro-entidade')
    })
  })

  describe('Formulário de Recuperação de Senha', () => {
    it('apresenta badge, título, subtítulo e campo de recuperação', async () => {
      await abrirLogin()

      expect(screen.getByText('Recuperação de senha')).toBeTruthy()
      expect(
        screen.getByRole('heading', {
          name: 'Esqueceu sua senha?',
          level: 2,
        }),
      ).toBeTruthy()
      expect(
        screen.getByText(
          'Informe seu e-mail. Enviaremos um link seguro para definir uma nova senha.',
        ),
      ).toBeTruthy()

      const inputRecuperacao = screen.getByLabelText('E-mail de recuperação')
      expect(inputRecuperacao).toBeTruthy()
      expect(inputRecuperacao.getAttribute('type')).toBe('email')
    })

    it('valida campo obrigatório e formato de e-mail na recuperação', async () => {
      const user = await abrirLogin()

      const btnEnviar = screen.getByRole('button', {
        name: 'Enviar link de recuperação',
      })

      // Submissão vazia
      await user.click(btnEnviar)
      expect(screen.getByRole('alert').textContent).toContain(
        'Informe o e-mail cadastrado para recuperação.',
      )

      // E-mail inválido
      const input = screen.getByLabelText('E-mail de recuperação')
      await user.type(input, 'invalido@')
      await user.click(btnEnviar)
      expect(screen.getByRole('alert').textContent).toContain(
        'Informe um formato de e-mail válido.',
      )
    })

    it('exibe feedback de sucesso conforme o protótipo ao submeter recuperação válida', async () => {
      const user = await abrirLogin()

      const input = screen.getByLabelText('E-mail de recuperação')
      await user.type(input, 'ana@redeesperanca.org.br')

      const btnEnviar = screen.getByRole('button', {
        name: 'Enviar link de recuperação',
      })
      await user.click(btnEnviar)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Solicitação enviada. Se este e-mail estiver cadastrado, você receberá um link válido por 30 minutos.',
          ),
        ).toBeTruthy()
      })

      expect(
        screen.getByText(
          'Confira também a caixa de spam. Você poderá solicitar outro link em 60 segundos.',
        ),
      ).toBeTruthy()
    })
  })

  describe('Navegação e foco entre os cards', () => {
    it('move o foco para o campo de recuperação ao clicar em "Esqueci minha senha →"', async () => {
      const user = await abrirLogin()

      const linkEsqueci = screen.getByRole('button', {
        name: 'Esqueci minha senha →',
      })
      await user.click(linkEsqueci)

      const inputRecuperacao = screen.getByLabelText('E-mail de recuperação')
      expect(document.activeElement).toBe(inputRecuperacao)
    })

    it('move o foco para o campo de login ao clicar em "← Voltar para o acesso"', async () => {
      const user = await abrirLogin()

      const linkVoltar = screen.getByRole('button', {
        name: '← Voltar para o acesso',
      })
      await user.click(linkVoltar)

      const inputLoginEmail = screen.getByLabelText('E-mail')
      expect(document.activeElement).toBe(inputLoginEmail)
    })
  })
})

