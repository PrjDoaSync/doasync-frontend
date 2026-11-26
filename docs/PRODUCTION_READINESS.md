# Preparação do Doasync para produção

**Classificação C — não pronta para deploy como produto integral.** A aprovação dos testes locais de React, Spring e PostgreSQL sustenta a revisão por PR das mudanças atuais. A publicação em ambiente de produção requer aceite do escopo, verificação em homologação compartilhada e infraestrutura operada pela equipe.

| Item | Evidência | Estado |
|---|---|---|
| Build e qualidade do frontend | Vite, Vitest, lint e typecheck | Validado localmente |
| Compilação e testes da API | Maven e cliente de contrato da Equipe 4 | Validado localmente |
| PostgreSQL e Flyway | PostgreSQL 16 isolado, perfil Spring `prod`, consultas de doações e controle de versão | Validado localmente |
| Docker e volume persistente | Imagens Linux, healthchecks, seis migrations e verificação de registros após recriar os três containers | Validado na demonstração local |
| Fluxos de integração | Playwright em 390 / 768 / 1366 px para vitrine e gestão. Registro de doações sem liquidação | Validado no ambiente descartável |
| Auditoria npm | Frontend, cliente de contrato e aplicação Express legada | Validada sobre os lockfiles da entrega |
| Origem e credenciais | CORS, JWT e PostgreSQL configurados por ambiente no perfil `prod` | Validados localmente |
| CI remota | Workflows de PR dos dois repositórios | Consultar o estado do commit no GitHub |
| Figma, Design System e WCAG | Inventário de 30 telas, tokens CSS, inspeção responsiva e axe-core sem violações nas três páginas públicas verificadas | Aceite visual e auditoria de acessibilidade pendentes |
| Gateway PIX e integrações externas | A API registra a doação. Faltam liquidação, credenciais de provedor e eventos autenticados | Pendente |
| DNS, HTTPS e certificados | Depende dos domínios e da plataforma de hospedagem | Pendente |
| Homologação compartilhada | Validação local com PostgreSQL 16.16 e navegador | Pendente no ambiente compartilhado |
| Monitoramento, alertas e logs | É possível sondar o Spring com a lista pública de campanhas | Métricas, alertas, retenção e política de redaction pendentes |
| Backup e recuperação | Migrações Flyway existentes | Backup verificável, restauração em clone e objetivos de recuperação pendentes |
| Performance, cache e capacidade | Build local e paginação por API | SLO, carga e cache em ambiente equivalente pendentes |
| Uploads e armazenamento | Sem contrato de upload aprovado para os fluxos pendentes | Pendente |

São 7 de 16 itens validados no nível indicado. O denominador é a tabela desta revisão. Evidência local não comprova configuração de produção. Referências funcionais em [Finalização Doasync](FINALIZACAO_DOASYNC.md) e [Matriz de integração](MATRIZ_INTEGRACAO_BACKEND.md).

## Procedimento de implantação para revisão

1. Selecionar os commits aprovados do frontend e do backend e registrar as imagens ou artefatos imutáveis. Antes de disponibilizar a edição de campanhas, confirmar que o backend aprovado responde o detalhe com a versão persistida.
2. Configurar banco e credenciais em secret manager. O Spring usa `DB_URL`, `DB_USER`, `DB_PASSWORD`, `DOASYNC_JWT_SEGREDO` e `DOASYNC_CORS_ORIGINS`. A criação do administrador inicial, quando necessária, usa `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Validar `PORT` e manter o Swagger desabilitado no ambiente público, salvo exigência operacional explícita. As chaves do Vite são públicas e o build deve apontar `VITE_API_URL` para a origem HTTPS da API.
3. Gerar backup do banco antes de aplicar migrações. Restaurar o backup em ambiente isolado para verificar integridade e tempo de recuperação. Comparar o histórico e os checksums Flyway antes de promover o backend.
4. Em homologação, verificar origem permitida no CORS, DNS, certificado, redirecionamento de rotas da SPA e respostas de erro. Sondar o Spring pelo `GET /api/v1/campanhas?limit=1` e validar a conexão ao banco. O `/api/v1/health` do Express pertence ao serviço legado e não monitora o Spring.
5. Rodar os cenários de login, autorização por papel, conflito de versão, doações recebidas, arrecadação e exportação. Validar latência, alertas de 5xx e ausência de tokens, senhas e dados pessoais em logs e artefatos. Elevar o tráfego após aprovação operacional.
6. Para qualquer liberação financeira, confirmar provedor homologado, credenciais de ambiente, verificação de webhook, conciliação e idempotência financeira com operações de teste.

## Reversão

1. Suspender a promoção diante de falha de autenticação, erros de persistência, conflito de contrato ou elevação de 5xx. Registrar os identificadores dos artefatos, a janela de mudança e os sintomas.
2. Reapontar o tráfego para os artefatos anteriores somente após conferir a compatibilidade com as migrações carregadas. Reverter primeiro a aplicação se o esquema continuar compatível.
3. Quando uma migração impedir a reversão da aplicação, manter a escrita suspensa, preparar restauração em banco separado e reconciliar gravações posteriores ao backup. A troca de banco depende de validação dos responsáveis.
4. Repetir a sondagem do Spring e os testes de autenticação, autorização, vitrine e arrecadação. Registrar a versão em serviço e confirmar a recuperação dos indicadores operacionais.

## Segurança da sessão

O backend aplica autenticação stateless com JWT, papéis e verificação de recursos. O frontend restringe o destino do token e preserva a abordagem existente em `localStorage`. Scripts que executem na origem podem ler esse armazenamento. Antes de produção, validar CSP aplicada pelo host e proteção contra conteúdo ativo não confiável. Uma mudança para cookies exige revisar CSRF, CORS, expiração e revogação em conjunto com o backend.
# Implantação com as imagens da demonstração

O [guia Docker](DOCKER_EXECUTION.md) documenta a topologia local. Em homologação ou produção, publique as imagens a partir de revisões aprovadas dos dois repositórios e configure o serviço da API com perfil `prod`. Se a plataforma hospedar o frontend e backend separadamente, mantenha a rota pública `/api/` no mesmo domínio HTTPS e encaminhe-a à API privada na camada de ingresso. A resolução `127.0.0.11` do Nginx da demonstração depende da rede Docker. Em outro ambiente, configure o proxy de acordo com o DNS dessa plataforma.

Use PostgreSQL gerenciado, uma conta própria para a aplicação e backups com teste de restauração. Injete `DB_URL`, `DB_USER`, `DB_PASSWORD` e `DOASYNC_JWT_SEGREDO` pelo gerenciador de segredos. Use `ADMIN_EMAIL` e `ADMIN_PASSWORD` para criar o primeiro administrador. Valide as migrações Flyway em homologação antes de executar a mesma revisão em produção. Defina `DOASYNC_CORS_ORIGINS` com as origens HTTPS autorizadas, mantenha `SWAGGER_ENABLED=false` e proteja o ingresso com TLS. Direcione os logs da aplicação a um coletor e preserve os healthchecks sem expor endpoints administrativos.

A carga demonstrativa usa apenas loopback e deve permanecer em uma base dedicada. Antes de receber pagamentos, o DoaSync precisa de provedor PIX e de confirmação financeira no backend. A aprovação dos PRs, homologação compartilhada, revisão de sessão e observabilidade continuam como critérios para produção.
