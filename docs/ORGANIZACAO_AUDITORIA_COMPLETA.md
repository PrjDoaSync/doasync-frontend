# Inventário técnico da organização Doasync

O inventário usa a conta GitHub vinculada à execução. A organização expôs quatro repositórios. O acesso aos repositórios, branches e PRs foi consultado com Git e GitHub CLI. O navegador integrado do VS Code não expôs o canal de automação, e o conector Figma recusou o acesso ao arquivo. A cobertura do design consta na [matriz Figma](MATRIZ_FIGMA_FRONTEND.md).

| Repositório | Papel e arquitetura | Fontes examinadas | Dependência da aplicação |
|---|---|---|---|
| [doasync-frontend](https://github.com/PrjDoaSync/doasync-frontend) | SPA React, Vite, React Router, Axios, Vitest | README, documentação do design, integração, pipeline e rastreabilidade. Rotas, serviços, mapeadores e testes de contrato do cliente | Consome o Spring sob `/api/v1` |
| [doasync-backend](https://github.com/PrjDoaSync/doasync-backend) | Spring Boot, Java, Hibernate, PostgreSQL, Flyway, JWT. Serviço Express histórico para campanha e contrato da Equipe 4 | README raiz e backend, contrato e evidências de API, migrations, controladores, regras de domínio, segurança e CI. Cliente de contrato executável e suíte Node legada | Fonte executável de campanhas, doações, entidades, contas e gestão |
| [doa-sync](https://github.com/PrjDoaSync/doa-sync) | Repositório central de escopo e fluxo de equipes | README, arquitetura, requisitos, regras e contrato REST. As regras foram confrontadas com os controladores e testes do Spring | Referência funcional e de contrato, sem serviço de runtime conhecido para a SPA |
| [quality](https://github.com/PrjDoaSync/quality) | Recurso compartilhado de qualidade | README, documentação, matrizes, cenários de testes de API e critérios de aceite | Apoia os testes, sem serviço de runtime consumido pela SPA |

## Contratos e divergências

- O Spring é a referência executável, inclusive para autorização, concorrência e persistência. As 22 operações mapeadas constam na [matriz de backend](MATRIZ_INTEGRACAO_BACKEND.md).
- A `main` revisada exige a versão no PATCH de campanha e ainda precisa incorporar a versão persistida no GET. O commit `014bbc6` corrige o detalhe. As alterações de João Pedro foram preservadas no histórico.
- PostgreSQL revelou um erro em parâmetros opcionais nas consultas de doações que os testes em H2 não detectavam. O ajuste foi validado em PostgreSQL. A pipeline do backend passa a exercitar doações no serviço PostgreSQL existente.
- O fluxo financeiro vigente registra PIX internamente. Não foram encontrados contratos executáveis de gateway, estoque, agendamento de doação, prestação de contas, recuperação de senha ou gestão de equipe nos controladores Java das referências auditadas. A lista de pendências e o impacto estão no [relatório de finalização](FINALIZACAO_DOASYNC.md).
- Inventário de branches, revisão de PRs e integração em [Auditoria GitHub](AUDITORIA_GITHUB.md).

## Escopo documentado e cenários de QA

As regras de negócio colocam itens físicos e estoque fora do MVP, deixam agendamento sem função nessa fase e tratam prestação de contas como pós-MVP. A matriz de QA registra 27 telas e contém cenários de agenda, formas de pagamento adicionais, estoque e CRM. Os cenários servem ao planejamento de testes. As divergências descritas na própria matriz impedem usar seu parecer de conformidade como evidência de API. [Regras de negócio](https://github.com/PrjDoaSync/doa-sync/blob/main/docs/regras-negocio.md#L449) · [Matriz de QA](https://github.com/PrjDoaSync/quality/blob/main/docs/qa/matriz-rastreabilidade.md#L150)

O contrato de PATCH de campanha publicado ainda precisa alinhar o campo `versao` com a validação do Spring. [Contrato REST](https://github.com/PrjDoaSync/doa-sync/blob/main/docs/backend/rotas-api.md#L767)
