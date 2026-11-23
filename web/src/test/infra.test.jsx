// TEST-WEB-01 (#79): componentes compartilhados e infraestrutura do frontend Web.
// Cobre feedback assíncrono (#36), cliente HTTP, hooks, layouts e a UI base.
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import api, { normalizeError } from '../services/api'
import { API_URL, USE_API } from '../services/config'
import { campanhasService as campanhasApi } from '../services/campanhasService'
import { doacoesService as doacoesApi } from '../services/doacoesService'
import { entidadesService as entidadesApi } from '../services/entidadesService'
import * as mocks from '../mocks'
import * as fonte from '../mocks/gestao'
import { campanhas as campanhasMock } from '../mocks/dados'
import { useRequest } from '../hooks/useRequest'
import { useAsyncAction } from '../hooks/useAsyncAction'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import RequestState from '../components/RequestState'
import DataTable from '../components/DataTable'
import Filtros from '../components/Filtros'
import StatusBadge from '../components/StatusBadge'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import {
  Aviso,
  Botao,
  Campo,
  Etapas,
  Icon,
  Marca,
  Modal,
  Secao,
  Vazio,
} from '../components/Ui'
import AppLayout, { PublicLayout } from '../components/layout/AppLayouts'
import { DemoProvider } from '../context/DemoContext'
import { useDemo } from '../hooks/useDemo'
import { formatarData, formatarMoeda, percentual } from '../utils/format'

function adiado() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('ErrorMessage', () => {
  it('não renderiza nada sem erro', () => {
    const { container } = render(<ErrorMessage error={null} />)
    expect(container.firstChild).toBe(null)
  })
  it('anuncia a mensagem do erro normalizado como alerta', () => {
    render(<ErrorMessage error={{ status: 500, message: 'Erro 500 ao processar.' }} />)
    expect(screen.getByRole('alert').textContent).toContain('Erro 500 ao processar.')
  })
  it('aceita Error e string e usa texto padrão quando não há mensagem', () => {
    const { rerender } = render(<ErrorMessage error={new Error('Falha de rede')} />)
    expect(screen.getByRole('alert').textContent).toContain('Falha de rede')
    rerender(<ErrorMessage error="Texto direto" />)
    expect(screen.getByRole('alert').textContent).toContain('Texto direto')
    rerender(<ErrorMessage error={{}} />)
    expect(screen.getByRole('alert').textContent).toContain('Ocorreu um erro inesperado.')
    rerender(<ErrorMessage error={{ message: '' }} />)
    expect(screen.getByRole('alert').textContent).toContain('Ocorreu um erro inesperado.')
  })
  it('só oferece nova tentativa quando há onRetry e dispara o callback', async () => {
    const onRetry = vi.fn()
    const { rerender } = render(<ErrorMessage error={{ message: 'x' }} />)
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBe(null)
    rerender(<ErrorMessage error={{ message: 'x' }} onRetry={onRetry} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('Loading', () => {
  it('anuncia o carregamento de forma educada para leitores de tela', () => {
    const { rerender } = render(<Loading />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Carregando...')
    expect(status.getAttribute('aria-live')).toBe('polite')
    rerender(<Loading message="Salvando..." />)
    expect(screen.getByRole('status').textContent).toBe('Salvando...')
  })
})

describe('RequestState', () => {
  it('mostra loading enquanto não há dados', () => {
    const children = vi.fn()
    render(<RequestState data={null} loading error={null}>{children}</RequestState>)
    expect(screen.getByRole('status').textContent).toBe('Carregando...')
    expect(children).not.toHaveBeenCalled()
  })
  it('mostra o erro com nova tentativa quando não há dados', async () => {
    const reload = vi.fn()
    render(
      <RequestState data={null} loading={false} error={{ message: 'Sem conexão' }} reload={reload}>
        {() => <p>conteúdo</p>}
      </RequestState>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Sem conexão')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(reload).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('conteúdo')).toBe(null)
  })
  it('não renderiza nada quando terminou sem dados e sem erro', () => {
    const { container } = render(
      <RequestState data={null} loading={false} error={null}>{() => <p>x</p>}</RequestState>,
    )
    expect(container.firstChild).toBe(null)
  })
  it('entrega os dados a children', () => {
    render(
      <RequestState data={[1, 2]} loading={false} error={null}>
        {(dados) => <p>{dados.length} itens</p>}
      </RequestState>,
    )
    expect(screen.getByText('2 itens')).toBeTruthy()
  })
  it('mantém o conteúdo durante uma nova busca (sem voltar ao loading)', () => {
    render(
      <RequestState data={['a']} loading error={null}>
        {(dados) => <p>{dados[0]}</p>}
      </RequestState>,
    )
    expect(screen.getByText('a')).toBeTruthy()
    expect(screen.queryByRole('status')).toBe(null)
  })
  it('exibe o estado vazio informado e não chama children', () => {
    const children = vi.fn()
    const { rerender } = render(
      <RequestState data={[]} loading={false} error={null} vazio="Nenhuma doação ainda.">
        {children}
      </RequestState>,
    )
    expect(screen.getByRole('status').textContent).toBe('Nenhuma doação ainda.')
    expect(children).not.toHaveBeenCalled()
    rerender(
      <RequestState data={[]} loading={false} error={null} vazio={<h2>Sem registros</h2>}>
        {children}
      </RequestState>,
    )
    expect(screen.getByRole('heading', { name: 'Sem registros' })).toBeTruthy()
  })
  it('sem `vazio`, a lista vazia segue para children decidir', () => {
    render(
      <RequestState data={[]} loading={false} error={null}>
        {(dados) => <p>{dados.length} registros</p>}
      </RequestState>,
    )
    expect(screen.getByText('0 registros')).toBeTruthy()
  })
  it('`vazio` não vale para dados que não são lista', () => {
    render(
      <RequestState data={{ total: 0 }} loading={false} error={null} vazio="vazio">
        {(d) => <p>total {d.total}</p>}
      </RequestState>,
    )
    expect(screen.getByText('total 0')).toBeTruthy()
  })
  it('preserva o conteúdo anterior e mostra o erro quando a nova tentativa falha', async () => {
    const reload = vi.fn()
    render(
      <RequestState data={['antigo']} loading={false} error={{ message: 'Falhou ao atualizar' }} reload={reload}>
        {(dados) => <p>{dados[0]}</p>}
      </RequestState>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Falhou ao atualizar')
    expect(screen.getByText('antigo')).toBeTruthy()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

describe('useRequest', () => {
  it('começa carregando e entrega os dados', async () => {
    const { result } = renderHook(() => useRequest(() => Promise.resolve([1, 2])))
    expect(result.current).toMatchObject({ loading: true, data: null, error: null })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([1, 2])
    expect(result.current.error).toBe(null)
  })
  it('expõe o erro e permite tentar novamente com reload', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce({ message: 'falhou' })
      .mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useRequest(request))
    await waitFor(() => expect(result.current.error).toEqual({ message: 'falhou' }))
    expect(result.current.loading).toBe(false)
    act(() => {
      result.current.reload()
    })
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    await waitFor(() => expect(result.current.data).toBe('ok'))
    expect(request).toHaveBeenCalledTimes(2)
  })
  it('envia o signal e cancela a chamada ao desmontar', () => {
    let signal
    const { unmount } = renderHook(() =>
      useRequest((config) => {
        signal = config.signal
        return new Promise(() => {})
      }),
    )
    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })
  it('ignora a resposta antiga quando um reload é disparado', async () => {
    const primeira = adiado()
    const segunda = adiado()
    const request = vi.fn().mockReturnValueOnce(primeira.promise).mockReturnValueOnce(segunda.promise)
    const { result } = renderHook(() => useRequest(request))
    act(() => {
      result.current.reload()
    })
    await act(async () => {
      segunda.resolve('novo')
    })
    await act(async () => {
      primeira.resolve('velho')
    })
    expect(result.current.data).toBe('novo')
  })
  it('ignora erros de requisição cancelada', async () => {
    const { result } = renderHook(() =>
      useRequest(() => Promise.reject({ cancelled: true, message: 'Requisição cancelada.' })),
    )
    await act(async () => {})
    expect(result.current.error).toBe(null)
  })
  it('refaz a chamada quando as dependências mudam', async () => {
    const buscar = vi.fn((id) => Promise.resolve(`item ${id}`))
    const { result, rerender } = renderHook(({ id }) => useRequest(() => buscar(id), [id]), {
      initialProps: { id: 1 },
    })
    await waitFor(() => expect(result.current.data).toBe('item 1'))
    rerender({ id: 2 })
    await waitFor(() => expect(result.current.data).toBe('item 2'))
    expect(buscar.mock.calls.map(([id]) => id)).toEqual([1, 2])
  })
})

describe('useAsyncAction', () => {
  it('controla pending/success e devolve o resultado da ação', async () => {
    const espera = adiado()
    const acao = vi.fn(() => espera.promise)
    const { result } = renderHook(() => useAsyncAction(acao))
    expect(result.current).toMatchObject({ pending: false, success: false, error: null })
    let retorno
    act(() => {
      retorno = result.current.executar('a', 2)
    })
    expect(result.current.pending).toBe(true)
    expect(acao).toHaveBeenCalledWith('a', 2)
    await act(async () => {
      espera.resolve('feito')
    })
    expect(await retorno).toBe('feito')
    expect(result.current).toMatchObject({ pending: false, success: true, error: null })
  })
  it('ignora envio duplicado enquanto a ação está em andamento', async () => {
    const espera = adiado()
    const acao = vi.fn(() => espera.promise)
    const { result } = renderHook(() => useAsyncAction(acao))
    act(() => {
      result.current.executar()
      result.current.executar()
    })
    expect(acao).toHaveBeenCalledTimes(1)
    await act(async () => {
      espera.resolve()
    })
    await act(async () => {
      await result.current.executar()
    })
    expect(acao).toHaveBeenCalledTimes(2)
  })
  it('guarda o erro, não marca sucesso e limpa o erro na próxima execução', async () => {
    const acao = vi.fn().mockRejectedValueOnce({ message: 'Falhou' }).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useAsyncAction(acao))
    let primeiro
    await act(async () => {
      primeiro = await result.current.executar()
    })
    expect(primeiro).toBeUndefined()
    expect(result.current).toMatchObject({ pending: false, success: false, error: { message: 'Falhou' } })
    await act(async () => {
      await result.current.executar()
    })
    expect(result.current).toMatchObject({ pending: false, success: true, error: null })
  })
  it('não trata cancelamento como erro', async () => {
    const acao = vi.fn().mockRejectedValue({ cancelled: true })
    const { result } = renderHook(() => useAsyncAction(acao))
    await act(async () => {
      await result.current.executar()
    })
    expect(result.current).toMatchObject({ pending: false, success: false, error: null })
  })
  it('reset volta ao estado de repouso', async () => {
    const { result } = renderHook(() => useAsyncAction(() => Promise.resolve()))
    await act(async () => {
      await result.current.executar()
    })
    expect(result.current.success).toBe(true)
    act(() => result.current.reset())
    expect(result.current).toMatchObject({ pending: false, success: false, error: null })
  })
  it('usa sempre a versão mais recente da ação', async () => {
    const antiga = vi.fn()
    const nova = vi.fn()
    const { result, rerender } = renderHook(({ acao }) => useAsyncAction(acao), {
      initialProps: { acao: antiga },
    })
    rerender({ acao: nova })
    await act(async () => {
      await result.current.executar()
    })
    expect(antiga).not.toHaveBeenCalled()
    expect(nova).toHaveBeenCalledTimes(1)
  })
  it('permite desabilitar o botão e evitar duplo clique na interface', async () => {
    const espera = adiado()
    const salvar = vi.fn(() => espera.promise)
    function Formulario() {
      const { executar, pending, success, error } = useAsyncAction(salvar)
      return (
        <>
          <button type="button" onClick={executar} disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
          {success && <p role="status">Salvo com sucesso</p>}
          {error && <p role="alert">{error.message}</p>}
        </>
      )
    }
    const user = userEvent.setup()
    render(<Formulario />)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    const botao = screen.getByRole('button', { name: 'Salvando…' })
    expect(botao.disabled).toBe(true)
    await user.click(botao)
    expect(salvar).toHaveBeenCalledTimes(1)
    await act(async () => {
      espera.resolve()
    })
    expect(screen.getByRole('status').textContent).toBe('Salvo com sucesso')
    expect(screen.getByRole('button', { name: 'Salvar' }).disabled).toBe(false)
  })
})

describe('cliente HTTP (services/api.js)', () => {
  const adapterOriginal = api.defaults.adapter
  afterEach(() => {
    api.defaults.adapter = adapterOriginal
  })

  describe('normalizeError', () => {
    it('identifica requisição cancelada', () => {
      expect(normalizeError(new axios.CanceledError())).toEqual({
        status: null,
        message: 'Requisição cancelada.',
        cancelled: true,
      })
    })
    it('usa a mensagem enviada pela API', () => {
      const erro = { response: { status: 422, data: { message: 'Campo inválido' } } }
      expect(normalizeError(erro)).toEqual({
        status: 422,
        message: 'Campo inválido',
        data: { message: 'Campo inválido' },
      })
    })
    it('usa o campo "error" do backend', () => {
      const erro = { response: { status: 404, data: { error: 'Campanha não encontrada.' } } }
      expect(normalizeError(erro)).toEqual({
        status: 404,
        message: 'Campanha não encontrada.',
        data: { error: 'Campanha não encontrada.' },
      })
    })
    it('expõe os erros por campo (422) e usa o primeiro como mensagem', () => {
      const erros = { titulo: 'não deve estar em branco', metaValor: 'deve ser maior que 0' }
      const normalizado = normalizeError({ response: { status: 422, data: { erros } } })
      expect(normalizado).toMatchObject({ status: 422, message: 'não deve estar em branco', campos: erros })
    })
    it('cria mensagem com o status quando a API não envia mensagem', () => {
      expect(normalizeError({ response: { status: 503, data: null } }).message).toBe(
        'Erro 503 ao processar a requisição.',
      )
    })
    it('trata tempo esgotado e falha de conexão', () => {
      expect(normalizeError({ code: 'ECONNABORTED' })).toEqual({
        status: null,
        message: 'Tempo de resposta esgotado.',
      })
      expect(normalizeError({ code: 'ERR_NETWORK' })).toEqual({
        status: null,
        message: 'Não foi possível conectar ao servidor.',
      })
    })
  })

  it('usa a URL base configurada, com fallback local, e timeout de 15 s', () => {
    expect(api.defaults.baseURL).toBe(import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1')
    expect(api.defaults.timeout).toBe(15000)
  })
  it('mantém o modo demonstração quando VITE_USE_API não é "true"', () => {
    expect(USE_API).toBe(import.meta.env.VITE_USE_API === 'true')
    expect(API_URL).toBe(api.defaults.baseURL)
  })
  it('o interceptor rejeita sempre com o erro normalizado', async () => {
    api.defaults.adapter = (config) =>
      Promise.reject(
        new axios.AxiosError('boom', 'ERR_BAD_RESPONSE', config, null, {
          status: 500,
          data: { message: 'Falha interna' },
          headers: {},
          config,
        }),
      )
    await expect(api.get('/qualquer')).rejects.toMatchObject({ status: 500, message: 'Falha interna' })
    api.defaults.adapter = (config) =>
      Promise.reject(new axios.AxiosError('Network Error', 'ERR_NETWORK', config))
    await expect(api.get('/qualquer')).rejects.toEqual({
      status: null,
      message: 'Não foi possível conectar ao servidor.',
    })
  })
  it.each([
    ['campanhas', campanhasApi, '/campanhas'],
    ['doações', doacoesApi, '/doacoes'],
    ['entidades', entidadesApi, '/entidades'],
  ])('service de %s consulta a rota certa e devolve só o corpo', async (_nome, servico, rota) => {
    const chamadas = []
    api.defaults.adapter = (config) => {
      chamadas.push(config)
      return Promise.resolve({ data: [{ id: 1 }], status: 200, statusText: 'OK', headers: {}, config })
    }
    const controller = new AbortController()
    expect(await servico.listar({ pagina: 2 }, { signal: controller.signal })).toEqual([{ id: 1 }])
    expect(await servico.buscarPorId(7)).toEqual([{ id: 1 }])
    expect(chamadas[0]).toMatchObject({ url: rota, method: 'get', params: { pagina: 2 } })
    expect(chamadas[0].signal).toBe(controller.signal)
    expect(chamadas[1].url).toBe(`${rota}/7`)
  })
})

describe('serviços simulados (mocks/index.js)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('listam com latência simulada, sem expor o dado original', async () => {
    const promessa = mocks.campanhasService.listar()
    let resolvida = false
    promessa.then(() => (resolvida = true))
    await vi.advanceTimersByTimeAsync(399)
    expect(resolvida).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    const lista = await promessa
    expect(lista).toEqual(campanhasMock)
    lista[0].nome = 'alterado'
    expect(campanhasMock[0].nome).not.toBe('alterado')
  })
  it('buscam por id (aceitando texto) e devolvem null quando não existe', async () => {
    const achada = mocks.doacoesService.buscarPorId('3')
    const ausente = mocks.entidadesService.buscarPorId(999)
    await vi.advanceTimersByTimeAsync(400)
    expect((await achada).id).toBe(3)
    expect(await ausente).toBe(null)
  })
})

describe('utilitários de formatação', () => {
  it('formata moeda em reais e data no padrão brasileiro', () => {
    expect(formatarMoeda(1234.5)).toMatch(/^R\$\s1\.234,50$/)
    expect(formatarMoeda(0)).toMatch(/^R\$\s0,00$/)
    expect(formatarData('2026-10-08')).toBe('08/10/2026')
  })
  it('calcula percentual limitado a 100 e sem dividir por zero', () => {
    expect(percentual(50, 200)).toBe(25)
    expect(percentual(1, 3)).toBe(33)
    expect(percentual(300, 200)).toBe(100)
    expect(percentual(10, 0)).toBe(0)
  })
})

describe('DataTable', () => {
  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'valor', titulo: 'Valor', render: (l) => `R$ ${l.valor}` },
  ]
  it('renderiza cabeçalhos, células simples e células customizadas', () => {
    render(<DataTable colunas={colunas} linhas={[{ id: 1, nome: 'Ana', valor: 10 }, { id: 2, nome: 'Bia', valor: 20 }]} />)
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Nome', 'Valor'])
    expect(screen.getAllByRole('columnheader')[0].getAttribute('scope')).toBe('col')
    const linhas = screen.getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(2)
    expect(within(linhas[1]).getByText('Bia')).toBeTruthy()
    expect(within(linhas[1]).getByText('R$ 20')).toBeTruthy()
  })
  it('mostra mensagem de vazio padrão ou personalizada, sem tabela', () => {
    const { rerender } = render(<DataTable colunas={colunas} linhas={[]} />)
    expect(screen.getByText('Nenhum registro encontrado.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBe(null)
    rerender(<DataTable colunas={colunas} linhas={[]} vazio="Nada por aqui" />)
    expect(screen.getByText('Nada por aqui')).toBeTruthy()
  })
})

describe('Filtros', () => {
  it('propaga a busca e a seleção, usando rótulos acessíveis', () => {
    const onBusca = vi.fn()
    const onStatus = vi.fn()
    render(
      <Filtros
        busca=""
        onBusca={onBusca}
        placeholder="Buscar doador"
        selects={[{ rotulo: 'Status', valor: '', onChange: onStatus, opcoes: ['Ativa', 'Encerrada'] }]}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar doador' }), { target: { value: 'ana' } })
    expect(onBusca).toHaveBeenCalledWith('ana')
    const select = screen.getByRole('combobox', { name: 'Status' })
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Status', 'Ativa', 'Encerrada'])
    fireEvent.change(select, { target: { value: 'Ativa' } })
    expect(onStatus).toHaveBeenCalledWith('Ativa')
  })
})

describe('StatusBadge, KpiCard e PageHeader', () => {
  it('StatusBadge mapeia o status para o tom e usa neutro como padrão', () => {
    const { container, rerender } = render(<StatusBadge valor="Confirmada" />)
    expect(container.querySelector('.badge--sucesso').textContent).toBe('Confirmada')
    rerender(<StatusBadge valor="Pendente" />)
    expect(container.querySelector('.badge--alerta')).toBeTruthy()
    rerender(<StatusBadge valor="Cancelada" />)
    expect(container.querySelector('.badge--perigo')).toBeTruthy()
    rerender(<StatusBadge valor="Qualquer outro" />)
    expect(container.querySelector('.badge--neutro').textContent).toBe('Qualquer outro')
  })
  it('KpiCard mostra detalhe somente quando informado', () => {
    const { container, rerender } = render(<KpiCard rotulo="Doadores" valor={12} />)
    expect(screen.getByText('Doadores')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
    expect(container.querySelector('.kpi__detalhe')).toBe(null)
    rerender(<KpiCard rotulo="Doadores" valor={12} detalhe="+2 no mês" />)
    expect(screen.getByText('+2 no mês')).toBeTruthy()
  })
  it('PageHeader renderiza o h1, a descrição opcional e as ações', () => {
    const { container, rerender } = render(<PageHeader titulo="Relatórios" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Relatórios' })).toBeTruthy()
    expect(container.querySelector('p')).toBe(null)
    rerender(
      <PageHeader titulo="Relatórios" descricao="Resumo do período">
        <button type="button">Exportar</button>
      </PageHeader>,
    )
    expect(screen.getByText('Resumo do período')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeTruthy()
  })
})

describe('componentes de interface (Ui.jsx)', () => {
  it('Icon é decorativo, aceita tamanho e usa ícone padrão para nome desconhecido', () => {
    const { container } = render(
      <>
        <Icon nome="check" size={30} />
        <Icon nome="nao-existe" />
        <Icon nome="doacoes" />
      </>,
    )
    const [check, desconhecido, doacoes] = container.querySelectorAll('svg')
    expect(check.getAttribute('aria-hidden')).toBe('true')
    expect(check.getAttribute('width')).toBe('30')
    expect(desconhecido.querySelector('path').getAttribute('d')).toBe(
      doacoes.querySelector('path').getAttribute('d'),
    )
  })
  it('Botao vira botão ou link e respeita variações e desabilitado', () => {
    render(
      <MemoryRouter>
        <Botao>Salvar</Botao>
        <Botao secundario className="extra" disabled>
          Cancelar
        </Botao>
        <Botao para="/destino">Ir</Botao>
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Salvar' }).getAttribute('type')).toBe('button')
    const cancelar = screen.getByRole('button', { name: 'Cancelar' })
    expect(cancelar.disabled).toBe(true)
    expect(cancelar.className).toContain('botao--secundario')
    expect(cancelar.className).toContain('extra')
    expect(screen.getByRole('link', { name: 'Ir' }).getAttribute('href')).toBe('/destino')
  })
  it('Campo associa rótulo ao controle e indica obrigatoriedade', () => {
    render(<Campo rotulo="Nome" name="nome" required />)
    const input = screen.getByLabelText('Nome *')
    expect(input.getAttribute('name')).toBe('nome')
    expect(input.required).toBe(true)
  })
  it('Campo liga o texto de ajuda ao controle via aria-describedby', () => {
    render(
      <>
        <Campo rotulo="Estado" ajuda="Use a sigla">
          <select>
            <option>SP</option>
          </select>
        </Campo>
        <Campo rotulo="Cidade">
          <input />
        </Campo>
      </>,
    )
    const select = screen.getByRole('combobox')
    expect(document.getElementById(select.getAttribute('aria-describedby')).textContent).toBe('Use a sigla')
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBe(null)
    render(<Campo rotulo="CEP" ajuda="Somente números" name="cep" />)
    const cep = screen.getByLabelText('CEP')
    expect(document.getElementById(cep.getAttribute('aria-describedby')).textContent).toBe('Somente números')
  })
  it('Aviso usa alert para erro e status para informação', () => {
    const { rerender } = render(<Aviso>Tudo certo</Aviso>)
    expect(screen.getByRole('status').textContent).toContain('Tudo certo')
    rerender(<Aviso erro>Algo falhou</Aviso>)
    expect(screen.getByRole('alert').textContent).toContain('Algo falhou')
  })
  it('Vazio escolhe o nível do título e tem texto padrão', () => {
    const { rerender } = render(<Vazio />)
    expect(screen.getByRole('heading', { level: 2, name: 'Nenhum resultado encontrado' })).toBeTruthy()
    expect(screen.getByText(/alterar os filtros/)).toBeTruthy()
    rerender(
      <Vazio principal titulo="Página não encontrada">
        Volte ao início
      </Vazio>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeTruthy()
    expect(screen.getByText('Volte ao início')).toBeTruthy()
  })
  it('Secao mostra título, descrição, ação e conteúdo', () => {
    render(
      <Secao titulo="Resumo" descricao="Período atual" acao={<button type="button">Ação</button>}>
        <p>corpo</p>
      </Secao>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Resumo' })).toBeTruthy()
    expect(screen.getByText('Período atual')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ação' })).toBeTruthy()
    expect(screen.getByText('corpo')).toBeTruthy()
  })
  it('Etapas marca a etapa atual e o progresso', () => {
    render(<Etapas atual={1} itens={['Dados', 'Metas', 'Revisão']} />)
    const itens = screen.getAllByRole('listitem')
    expect(itens[0].textContent).toContain('Concluído')
    expect(itens[1].textContent).toContain('Em andamento')
    expect(itens[1].getAttribute('aria-current')).toBe('step')
    expect(itens[2].textContent).toContain('Próxima etapa')
    expect(itens[2].getAttribute('aria-current')).toBe(null)
  })
  it('Marca leva à página inicial', () => {
    render(
      <MemoryRouter>
        <Marca />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /DoaSync/ }).getAttribute('href')).toBe('/')
  })

  describe('Modal', () => {
    it('abre como diálogo, fecha pelo botão e pela tecla Esc', async () => {
      const fechar = vi.fn()
      render(
        <Modal titulo="Confirmar ação" fechar={fechar}>
          <p>Tem certeza?</p>
        </Modal>,
      )
      const dialog = document.querySelector('dialog')
      expect(dialog.hasAttribute('open')).toBe(true)
      expect(within(dialog).getByRole('heading', { name: 'Confirmar ação' })).toBeTruthy()
      await userEvent.setup().click(screen.getByRole('button', { name: 'Fechar' }))
      expect(fechar).toHaveBeenCalledTimes(1)
      const cancelar = new Event('cancel', { cancelable: true })
      fireEvent(dialog, cancelar)
      expect(cancelar.defaultPrevented).toBe(true)
      expect(fechar).toHaveBeenCalledTimes(2)
    })
    it('devolve o foco ao elemento que o abriu', async () => {
      function Exemplo() {
        const [aberto, setAberto] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setAberto(true)}>
              Abrir
            </button>
            {aberto && (
              <Modal titulo="Detalhes" fechar={() => setAberto(false)}>
                conteúdo
              </Modal>
            )}
          </>
        )
      }
      const user = userEvent.setup()
      render(<Exemplo />)
      const abrir = screen.getByRole('button', { name: 'Abrir' })
      await user.click(abrir)
      expect(document.querySelector('dialog')).toBeTruthy()
      await user.click(screen.getByRole('button', { name: 'Fechar' }))
      expect(document.querySelector('dialog')).toBe(null)
      expect(document.activeElement).toBe(abrir)
    })
  })
})

describe('DemoProvider e layouts', () => {
  beforeEach(() =>
    vi.spyOn(fonte, 'carregarDemo').mockImplementation(() => Promise.resolve(fonte.criarDadosDemo())),
  )

  function Sonda() {
    const { dados, atualizar, notificar } = useDemo()
    return (
      <div>
        <p data-testid="entidade">{dados.entidade.nome}</p>
        <p data-testid="campanha-entidade">
          {dados.campanhas.find((c) => c.entidadeId === dados.entidade.id)?.entidade}
        </p>
        <button type="button" onClick={() => atualizar('entidade', { ...dados.entidade, nome: 'Nome novo' })}>
          Renomear
        </button>
        <button type="button" onClick={() => notificar('Salvo na sessão')}>
          Avisar
        </button>
      </div>
    )
  }

  it('mostra loading e depois entrega os dados da demonstração', async () => {
    const espera = adiado()
    fonte.carregarDemo.mockImplementation(() => espera.promise)
    render(
      <DemoProvider>
        <Sonda />
      </DemoProvider>,
    )
    expect(screen.getByRole('status').textContent).toBe('Carregando...')
    await act(async () => {
      espera.resolve(fonte.criarDadosDemo())
    })
    expect(screen.getByTestId('entidade').textContent).toBe(fonte.criarDadosDemo().entidade.nome)
  })
  it('mostra erro com nova tentativa quando o carregamento falha', async () => {
    fonte.carregarDemo.mockRejectedValueOnce({ message: 'Falha ao carregar a demonstração' })
    render(
      <DemoProvider>
        <Sonda />
      </DemoProvider>,
    )
    expect((await screen.findByRole('alert')).textContent).toContain('Falha ao carregar a demonstração')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByTestId('entidade')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBe(null)
  })
  it('atualiza a entidade e propaga o novo nome para as campanhas dela', async () => {
    const user = userEvent.setup()
    render(
      <DemoProvider>
        <Sonda />
      </DemoProvider>,
    )
    await screen.findByTestId('entidade')
    await user.click(screen.getByRole('button', { name: 'Renomear' }))
    expect(screen.getByTestId('entidade').textContent).toBe('Nome novo')
    expect(screen.getByTestId('campanha-entidade').textContent).toBe('Nome novo')
  })

  function montarAdmin(rota) {
    return render(
      <MemoryRouter initialEntries={[rota]}>
        <DemoProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="*" element={<Sonda />} />
            </Route>
          </Routes>
        </DemoProvider>
      </MemoryRouter>,
    )
  }
  it('layout de gestão: navegação principal, entidade, título e aviso de demonstração', async () => {
    montarAdmin('/campanhas')
    await screen.findByRole('navigation', { name: 'Navegação administrativa' })
    const nav = screen.getByRole('navigation', { name: 'Navegação administrativa' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Dashboard',
      'Campanhas',
      'Doações',
      'Doadores',
      'Itens doados',
      'Relatórios',
      'Configurações',
    ])
    expect(within(nav).getByRole('link', { name: 'Campanhas' }).getAttribute('aria-current')).toBe('page')
    expect(document.querySelector('.topo__titulo').textContent).toBe('Gestão de campanhas')
    expect(document.querySelector('.sidebar__entidade strong').textContent).toBe(
      fonte.criarDadosDemo().entidade.nome,
    )
    expect(screen.getByText(/Ambiente de demonstração/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' }).getAttribute('href')).toBe('#conteudo')
    expect(document.querySelector('main#conteudo')).toBeTruthy()
  })
  it('layout de gestão: título de rotas fora do menu', async () => {
    const { unmount } = montarAdmin('/cadastro-entidade')
    await screen.findByRole('navigation', { name: 'Navegação administrativa' })
    expect(document.querySelector('.topo__titulo').textContent).toBe('Cadastro da entidade')
    unmount()
    montarAdmin('/entidades')
    await screen.findByRole('navigation', { name: 'Navegação administrativa' })
    expect(document.querySelector('.topo__titulo').textContent).toBe('Gestão de entidades')
  })
  it('exibe o aviso (Toast) e permite dispensá-lo', async () => {
    const user = userEvent.setup()
    montarAdmin('/dashboard')
    await screen.findByRole('navigation', { name: 'Navegação administrativa' })
    expect(document.querySelector('.toast')).toBe(null)
    await user.click(screen.getByRole('button', { name: 'Avisar' }))
    expect(document.querySelector('.toast').textContent).toContain('Salvo na sessão')
    await user.click(screen.getByRole('button', { name: 'Dispensar aviso' }))
    expect(document.querySelector('.toast')).toBe(null)
  })
  it('layout público: navegação, acesso da entidade e rodapé', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DemoProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<h1>Início</h1>} />
            </Route>
          </Routes>
        </DemoProvider>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Início' })
    const nav = screen.getByRole('navigation', { name: 'Navegação pública' })
    expect(within(nav).getByRole('link', { name: 'Campanhas' }).getAttribute('href')).toBe('/explorar')
    expect(within(nav).getByRole('link', { name: 'Entidades' }).getAttribute('href')).toBe('/cadastro-entidade')
    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/login')
    expect(screen.getByText(/Ambiente de demonstração/)).toBeTruthy()
    expect(screen.getByText(/Projeto de extensão/)).toBeTruthy()
    expect(document.querySelector('main#conteudo')).toBeTruthy()
  })
})
