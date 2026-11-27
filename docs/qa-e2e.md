# QA E2E da API real

Suíte sem dependências (Node 22+, `fetch` nativo) em `web/scripts/e2e-api.mjs`. Usa dados fictícios, sufixo único por execução (idempotente) e não realiza pagamentos (a API só registra o PIX).

## Como rodar

```bash
cd web
export API_URL=http://localhost:8090/api/v1   # Docker/Nginx (padrão). Local: http://localhost:8080/api/v1
export ADMIN_EMAIL=...                        # obrigatória
export ADMIN_PASSWORD=...                     # obrigatória (nunca gravar no repositório)
node scripts/e2e-api.mjs                      # suíte completa; sai com código 1 se houver FAIL
node scripts/e2e-api.mjs --seed               # só cria dados de homologação e imprime as contas
```

O `--seed` cria 2 entidades aprovadas, 1 pendente, campanhas ativa/rascunho/agendada/encerrada, 1 doador PF e 3 doações; imprime as contas fictícias geradas (nunca a senha do admin).

## Matriz de cenários

| Grupo | Cobertura |
|---|---|
| 1 | GET público de campanhas (envelope `{data, meta}`) |
| 2 | Cadastro de doador PF e PJ; e-mail duplicado (409) |
| 3 | Cadastro de entidades (PENDENTE) |
| 4 | Login ADMIN; aprovar; reprovar sem motivo (422) e com motivo; entidade pendente não cria campanha; doador não aprova |
| 5 | Campanha rascunho, edição com `versao`, conflito de `versao` (409), publicação (ATIVA) |
| 6 | Vitrine e detalhe público; rascunho oculto (404) |
| 7 | Doação com `Idempotency-Key` (201, repetição 200 com mesmo id), comprovante, histórico, anônima, direta à entidade, valor 0 (422) |
| 8 | Doações e arrecadação da entidade (total coerente), anonimato, isolamento entre entidades |
| 9 | KPIs, listagem de usuários, desativar/reativar (login bloqueado) |
| 10 | `/usuarios/me`: edição, troca de senha (atual errada 422; correta 200; login com nova; antiga negada) |
| 11 | 401 sem/ com token inválido ou adulterado; 403 por perfil; acesso cruzado entre entidades e doadores; encerramento próprio; doação em campanha encerrada |
| 12 | 422 (CPF/CNPJ inválidos, e-mail/senha, meta negativa, datas), 404 (UUIDs inexistentes), JSON malformado, nenhum 5xx |

## Resultados

**Resultado atual (2026-11-27 16:47, Docker + PostgreSQL 16, `http://localhost:8090/api/v1`, backend `ff7fe5a`): 74 passos, 74 PASS, 0 FAIL, nenhuma resposta 5xx.**

As falhas abaixo, da primeira execução (H2, backend `5fcac93`), foram corrigidas no backend pelos commits `9f1fc87` (dígitos verificadores de CPF/CNPJ) e `ff7fe5a` (período da campanha validado antes de persistir: 422 em vez de 500).

Execução anterior em 2026-11-27, backend local de desenvolvimento (H2), `http://localhost:8080/api/v1`: **74 passos, 70 PASS, 4 FAIL**.

| Passo | Esperado | Recebido |
|---|---|---|
| 12a. CPF inválido (dígito verificador errado) | 422 | 201 (cadastro aceito) |
| 12c. CNPJ inválido em entidade | 422 | 201 (cadastro aceito) |
| 12e. `dataFim` anterior a `dataInicio` em `POST /campanhas` | 422 | 500 `{"error":"Erro interno no servidor."}` |
| 12n. Nenhum 5xx na suíte | 0 | 1 (o de 12e) |

Os 4 FAIL são achados reais da API (a suíte está correta). Detalhes e correções sugeridas na entrega do QA.

Docker/PostgreSQL (`http://localhost:8090`): executado depois das correções, 74/74 PASS (ver resultado atual acima). Comando: `API_URL=http://localhost:8090/api/v1 node --env-file=.env web/scripts/e2e-api.mjs` na raiz do frontend.
