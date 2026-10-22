# Registro de testes unitários — Frontend Web DoaSync

> **Responsável pela coordenação do registro:** LucasIanovski  
> **Issue de documentação:** [#78](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/78)  
> **Issues de testes:** [#79](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/79), [#80](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/80), [#81](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/81), [#82](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/82)

## 1. Objetivo

Manter evidências verificáveis dos testes unitários executados sobre o frontend Web antes do encaminhamento à equipe de QA. Este arquivo é um registro inicial e um modelo de preenchimento; **não afirma que testes já foram executados**.

## 2. Situação inicial

Durante a inspeção dos caminhos comuns do repositório, não foram encontrados `package.json`, `web/` ou `frontend/`; o README consultado informa que o código da aplicação ainda não foi incorporado na branch padrão examinada. Por isso, não é possível confirmar framework de testes, comandos, quantidade de testes ou cobertura neste momento.

Antes de escolher ou instalar uma ferramenta:
1. localizar a aplicação e seus manifestos;
2. verificar dependências e scripts existentes;
3. alinhar a ferramenta com a stack real e com a equipe;
4. registrar apenas comandos confirmados e executados.

Não preencher resultados com números estimados ou comandos presumidos.

## 3. Escopo por issue

| Issue | Escopo | Critério mínimo de evidência |
|---|---|---|
| [#79](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/79) | Componentes compartilhados, layout e infraestrutura Web | Renderização, interações, propriedades, navegação e estados relevantes |
| [#80](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/80) | Campanhas (CAM-01 a CAM-10) | Componentes, filtros, formulários, validações e estados definidos nos requisitos |
| [#81](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/81) | Doações (DOA-01 a DOA-10) | Componentes, formulários e interações definidas, sem presumir regras de pagamento |
| [#82](https://github.com/PrjDoaSync/equipe-4-gestao-dashboard/issues/82) | Gestão e Dashboard (GES-01 a GES-10) | Tabelas, filtros, indicadores, formulários, permissões visuais e exportação quando houver lógica própria no frontend |

O escopo final deve acompanhar a implementação real e os critérios de aceite aprovados. Não testar uma regra de negócio que ainda não foi definida como se fosse requisito.

## 4. Princípios de teste

- Isolar dependências externas com mocks/stubs quando apropriado.
- Não depender de API real, banco de dados real ou credenciais em testes unitários.
- Testar comportamento observável e interações relevantes, não apenas detalhes internos frágeis.
- Cobrir estados de carregamento, vazio, erro e sucesso quando existirem na especificação e na implementação.
- Manter os testes determinísticos e independentes.
- Evitar usar mocks para ocultar o comportamento que o teste deveria validar.
- Corrigir falhas ou registrar justificativa, impacto e risco.
- Não confundir teste unitário com teste de integração ou validação independente de QA.

## 5. Modelo de registro por execução

Copie e preencha este bloco para cada execução relevante:

### Execução — [data]

- **Issue/área:**
- **Branch e commit:**
- **Ambiente:**
- **Ferramenta e versão:**
- **Comando exato executado:**
- **Resultado:** Aprovado / Falhou / Bloqueado.
- **Testes executados:**
- **Falhas e mensagens relevantes:**
- **Correções realizadas:**
- **Falhas conhecidas e justificativa:**
- **Link do log, PR ou execução de CI:**
- **Revisor interno:**
- **Pronto para encaminhar à QA?** Sim / Não — justificar.

Não inclua tokens, senhas, dados pessoais ou conteúdo sensível nos logs anexados.

## 6. Matriz de acompanhamento

| Área | Estado inicial | Evidência a registrar | Issue |
|---|---|---|---|
| Componentes compartilhados e infraestrutura | Pendente de confirmação da aplicação | Execução dos testes, casos cobertos e falhas | #79 |
| Campanhas | Pendente de confirmação da aplicação | Execução dos testes, casos cobertos e falhas | #80 |
| Doações | Pendente de confirmação da aplicação | Execução dos testes, casos cobertos e falhas | #81 |
| Gestão e Dashboard | Pendente de confirmação da aplicação | Execução dos testes, casos cobertos e falhas | #82 |

## 7. Fluxo obrigatório de qualidade acordado nas issues

**Implementação frontend → testes unitários e revisão interna → correções → encaminhamento para QA.**

A QA é uma etapa posterior e não substitui os testes unitários internos. A conclusão de uma issue de teste exige evidência da execução, falhas corrigidas ou justificadas e revisão interna concluída.

## 8. Checklist de conclusão

- [ ] Ferramenta e comandos de teste confirmados no repositório.
- [ ] Casos de teste derivados de requisitos e comportamentos confirmados.
- [ ] Dependências externas isoladas adequadamente.
- [ ] Testes executados localmente ou em CI e resultado registrado.
- [ ] Falhas corrigidas ou justificadas com risco explícito.
- [ ] Revisão interna concluída.
- [ ] Evidência vinculada à issue ou ao PR.
- [ ] Encaminhamento à QA realizado somente depois das etapas anteriores.

**Estado deste registro na criação:** pendente. Nenhum resultado de teste foi presumido ou inventado.
