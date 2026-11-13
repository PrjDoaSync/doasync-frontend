# Planejamento de implementação — GES-01 | Login e recuperação de senha

> **Projeto:** DoaSync — Frontend Web  
> **Issue de desenvolvimento:** [#105 — DEV-GES-01](https://github.com/PrjDoaSync/doasync-frontend/issues/105)  
> **Referência de prototipação:** [#68 — GES-01](https://github.com/PrjDoaSync/doasync-frontend/issues/68)  
> **Figma:** [Arquivo DoaSync](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)  
> **Tipo de entrega:** implementação React da interface desktop, conforme a estrutura e os padrões reais do repositório.  
> **Objetivo deste documento:** orientar Cursor, Antigravity ou outra IDE com agente de código a inspecionar o projeto, implementar exclusivamente o que estiver pendente e entregar evidências técnicas para posterior validação humana.

---

## 1. Preparação

### 1.1. Contexto e limites da tarefa

Implementar a tela **GES-01 — Login e recuperação de senha** a partir da imagem de prototipação fornecida e das definições das issues #105 e #68.

A issue #105 define a entrega como desenvolvimento React e determina:
- composição visual alinhada ao protótipo e aos requisitos confirmados;
- interações, navegação, validações e estados previstos;
- reutilização de componentes e serviços existentes;
- uso de mocks claramente identificados apenas enquanto APIs/contratos não estiverem disponíveis;
- acessibilidade básica e comportamento desktop consistente;
- testes unitários relacionados à frente de Gestão/Dashboard, rastreados pela issue de testes #82;
- atualização da documentação relevante.

A issue #68 é a referência de prototipação. Ela descreve a história de usuário como: administrador ou representante de entidade deseja entrar ou recuperar o acesso para acessar a área de gestão. Ela também alerta que não se deve presumir interações não especificadas.

**Esta tarefa não inclui** cadastro de entidade, onboarding, dashboard, gestão de usuários, permissões, redefinição administrativa de senha, autenticação social, MFA ou qualquer fluxo que não esteja explicitamente definido para GES-01.

### 1.2. Inspeção obrigatória antes de editar

Antes de criar, alterar ou excluir qualquer arquivo, faça uma leitura estruturada do repositório e compreenda a arquitetura existente.

1. Confirme a raiz real do projeto e a branch atual.
2. Verifique o estado do Git (`status`, branch e alterações locais). Não sobrescreva alterações existentes do usuário.
3. Leia os documentos de orientação presentes no repositório: `README`, documentação técnica, instruções para agentes (`AGENTS.md`, `CLAUDE.md`, regras do Cursor/Antigravity ou equivalentes) e convenções internas.
4. Inspecione a árvore completa de arquivos relevantes, sem limitar a análise apenas à pasta que parece conter a tela.
5. Leia os arquivos de configuração e dependências: manifesto de pacotes, lockfile, configuração de build, TypeScript/JavaScript, roteamento, lint, testes, estilos e variáveis de ambiente de exemplo.
6. Identifique o ponto de entrada da aplicação, sistema de rotas, layouts, providers, gerenciamento de estado, estratégia de estilos e organização dos componentes.
7. Localize telas existentes com formulários, autenticação, cabeçalho, rodapé, alertas, botões, inputs, ícones e validação. Leia os componentes e seus consumidores antes de reutilizá-los.
8. Localize os serviços de API, cliente HTTP, interceptors, tratamento global de erros, armazenamento de sessão/token e mecanismos de proteção de rotas. Não crie uma segunda infraestrutura de autenticação.
9. Localize testes existentes e descubra como são executados. Siga o framework e os padrões já adotados.
10. Pesquise por implementações parciais ou telas equivalentes de GES-01. Não duplique código nem substitua uma implementação existente sem demonstrar que ela está incompleta ou incorreta em relação ao escopo.
11. Registre um resumo curto da arquitetura encontrada e dos arquivos que serão reutilizados antes de começar a codificação.

**Atenção ao estado do repositório:** uma consulta anterior à branch `main` de `PrjDoaSync/doasync-frontend` mostrou `README.md` e `docs/` na raiz. A documentação consultada também registrava que não havia manifesto de aplicação nos caminhos então verificados e citava outro repositório como referência. Isso pode ter mudado ou o código pode estar em outra branch, subdiretório ou estrutura. Portanto, confira o clone/branch atual. Se o código da aplicação não estiver presente ou não for possível identificar a raiz executável, **não invente uma aplicação nem crie uma estrutura React paralela**: interrompa a implementação e informe exatamente o que está faltando.

### 1.3. Critérios de aceite

A entrega só poderá ser considerada tecnicamente pronta quando todos os itens aplicáveis abaixo forem atendidos:

- [ ] A tela GES-01 está acessível pela rota e pelo fluxo definidos no projeto, sem quebrar rotas existentes.
- [ ] A composição visual corresponde à referência fornecida: cabeçalho, área principal em colunas, painel institucional à esquerda, formulário de acesso e painel de recuperação de senha.
- [ ] Textos, rótulos, hierarquia, imagens, cores, dimensões relativas, alinhamentos, espaçamentos, bordas e estados visuais seguem o protótipo, sem redesign autoral.
- [ ] O formulário de login possui os campos e controles visíveis no protótipo.
- [ ] O formulário de recuperação de senha possui o campo e a ação visíveis no protótipo.
- [ ] Os campos possuem rótulos acessíveis, tipos adequados, validações coerentes com os requisitos e mensagens compreensíveis.
- [ ] A ação de login usa o serviço/contrato de autenticação existente, se disponível e confirmado.
- [ ] A ação de recuperação usa o serviço/contrato existente, se disponível e confirmado.
- [ ] Se não houver contrato de backend, a limitação está explícita e o comportamento temporário está isolado em mock identificado; nenhuma simulação é apresentada como autenticação ou envio real.
- [ ] Estados de carregamento, sucesso e erro são tratados para as operações realmente implementadas.
- [ ] O link “Esqueceu sua senha?” e a ação “Voltar para o acesso” funcionam conforme o fluxo aprovado, sem navegação inventada.
- [ ] Componentes compartilhados existentes, especialmente Header, Footer, botões, campos e alertas, são reutilizados quando apropriado.
- [ ] Não há duplicação de componentes, serviços, estilos globais ou lógica de autenticação.
- [ ] A implementação não causa regressões nas demais telas ou rotas.
- [ ] Testes relevantes são criados/atualizados e executados com os comandos reais do projeto.
- [ ] Build/compilação e verificações disponíveis terminam sem erros introduzidos pela tarefa.
- [ ] A documentação da tarefa é atualizada quando necessário, sem duplicar documentos existentes.
- [ ] É apresentado um relatório final com arquivos alterados, decisões, testes executados, limitações e pontos que dependem de validação humana.

### 1.4. Requisitos de template e layout

Use a imagem de prototipação enviada como referência visual principal. Ela representa uma tela desktop com fundo geral muito claro, conteúdo centralizado e três áreas verticais principais.

#### A. Cabeçalho

- Barra horizontal superior, branca, ocupando a largura do conteúdo.
- À esquerda, marca DoaSync: símbolo azul em formato de escudo/quadrado arredondado com ícone branco e nome “DoaSync”.
- À direita, ação “Precisa de ajuda?” acompanhada de ícone discreto.
- O cabeçalho deve reutilizar o Header global do projeto, caso exista.
- Não criar um segundo header exclusivo se o global puder receber a configuração/variante necessária sem prejudicar outras telas.
- Não inventar menu, dropdown, suporte por chat ou destino de link. Verifique se a ação possui destino definido em rotas/documentação. Se não possuir, mantenha apenas o comportamento aprovado ou registre a pendência.

#### B. Área principal

A área de conteúdo começa abaixo do cabeçalho e contém três colunas:

1. **Coluna institucional à esquerda**, aproximadamente um terço da área útil:
   - pequeno identificador/categoria em caixa alta: “GESTÃO · ACESSO À ENTIDADE”;
   - título “Bem-vinda ao DoaSync”;
   - texto de apoio: “Acesse sua entidade para acompanhar campanhas, doações e o impacto da sua rede.”;
   - imagem institucional de pessoas organizando/doando alimentos;
   - chamada “Mais organização. Mais impacto”;
   - texto explicativo curto sobre organização financeira e necessidades de itens;
   - lista de três benefícios com ícones de confirmação, conforme a imagem: acompanhar metas e evolução das campanhas; conferir entregas com segurança; manter a transparência com a comunidade.
   - Usar o asset já existente no projeto, se corresponder à imagem. Se não existir, procurar os assets oficiais do projeto. Não buscar ou criar uma imagem substituta sem autorização; registrar o asset ausente como dependência.

2. **Coluna central — Entrar na sua conta**:
   - card branco com borda/sombra discreta e cantos arredondados;
   - pequeno selo “Área da entidade”;
   - título “Entre na sua conta”;
   - texto de apoio indicando uso do e-mail cadastrado como responsável pela entidade;
   - campo “E-mail”, com valor de exemplo visual apenas se a convenção do projeto exigir placeholder/valor demonstrativo; não pré-preencher credenciais reais;
   - campo “Senha”, mascarado por padrão;
   - controle para exibir/ocultar senha, se o ícone/controle da referência corresponder a essa interação e se houver padrão compartilhado;
   - checkbox “Manter conectado neste dispositivo”;
   - link “Esqueceu minha senha?”;
   - botão primário azul “Entrar” com ícone de seta;
   - separador textual “Sua entidade ainda não tem uma conta?”;
   - botão secundário/contornado “Cadastrar entidade”.
   - O botão de cadastro só deve navegar para uma rota existente e confirmada. Se o cadastro estiver fora desta issue ou ainda não existir, não criar fluxo de cadastro nesta tarefa; registrar dependência e evitar destino quebrado.

3. **Coluna direita — Recuperação de senha**:
   - card branco com contorno azul discreto, cantos arredondados;
   - selo “Recuperação de senha”;
   - título “Esqueceu sua senha?”;
   - texto orientando a informar o e-mail para receber um link seguro para definir nova senha;
   - campo “E-mail de recuperação”;
   - botão azul “Enviar link de recuperação”;
   - área de retorno de sucesso com ícone de confirmação e mensagem equivalente à referência: solicitação enviada e orientação para verificar o e-mail, inclusive spam; a mensagem não deve revelar se a conta existe;
   - texto complementar sobre prazo/limite de solicitação somente se esse comportamento estiver confirmado pelo requisito ou backend. Não inventar um prazo operacional.
   - link “Voltar para o acesso”.
   - A referência mostra o formulário de login e o painel de recuperação lado a lado. Não transformar automaticamente em abas, modal ou tela separada. A ação “Esqueceu minha senha?” pode focar/rolar até o painel de recuperação ou executar o comportamento já adotado pelo projeto, desde que preserve o layout aprovado e seja consistente com o fluxo confirmado.

#### C. Faixa informativa inferior

- Faixa horizontal azul muito clara abaixo dos cards.
- Ícone informativo e texto equivalente a: “Seu acesso é protegido. Nunca compartilhe sua senha ou código de recuperação com outras pessoas.”
- Reutilizar componente global de aviso/informação, se existir.
- Não transformar a faixa em banner promocional nem adicionar conteúdo extra.

#### D. Rodapé

- Rodapé discreto, fundo claro, alinhado ao conteúdo.
- À esquerda, texto de marca “DoaSync · Conectando pessoas a causas”.
- À direita, links “Ajuda”, “Privacidade” e “Termos de uso”.
- Reutilizar Footer global existente.
- Confirmar destinos reais dos links. Não inventar páginas, URLs ou políticas. Se não houver destino implementado, registrar a pendência e seguir o padrão do projeto sem criar páginas adicionais.

#### E. Diretrizes visuais

- Reproduzir a linguagem visual da imagem: azul como cor primária, fundo branco/cinza muito claro, textos em azul-marinho/cinza escuro, bordas suaves e sombras discretas.
- Preservar a hierarquia tipográfica observada: títulos com maior peso; descrições e metadados menores; labels legíveis.
- Respeitar o sistema de design, tokens, fontes, variáveis CSS e componentes já presentes no projeto. Se os tokens existentes forem diferentes, verificar se a tela de referência usa uma variante já definida antes de alterar qualquer padrão global.
- A imagem enviada é uma referência visual rasterizada e de resolução limitada. Não deduzir valores exatos de pixel, nomes de fontes ou códigos hexadecimais a partir dela. Consultar Figma e tokens reais para medidas exatas.
- Não introduzir bibliotecas de ícones, fontes, animações ou componentes se o projeto já possuir alternativas.
- Não adicionar animações, gradientes, ilustrações, elementos decorativos ou breakpoints não especificados.

#### F. Responsividade

A issue descreve a entrega como desktop e a imagem fornecida é desktop. Priorize reproduzir esse viewport e os breakpoints já adotados pelo projeto.
- Não inventar um novo layout mobile completo nesta tarefa.
- Não permitir overflow horizontal no viewport desktop de referência.
- Se já existir padrão responsivo global, utilizá-lo sem alterar outras telas.
- Em larguras menores, preservar legibilidade e acesso aos formulários usando os padrões existentes; documentar o comportamento observado e validar com o responsável, caso a referência mobile não esteja disponível.
- Não declarar responsividade mobile aprovada sem protótipo/requisito e teste correspondentes.

### 1.5. Requisitos de funcionalidade e comunicação com o backend

#### A. Login

- Validar campos obrigatórios no cliente, seguindo o padrão já usado no projeto.
- Validar formato básico de e-mail sem tentar reproduzir regras de autenticação no frontend.
- Campo de senha deve ser mascarado por padrão.
- Controle de exibir/ocultar senha, se aplicável, deve ser acessível por teclado e possuir nome/label acessível.
- Checkbox “Manter conectado neste dispositivo” deve refletir o estado selecionado.
- Botão “Entrar” deve impedir submissões duplicadas durante a requisição.
- Durante o envio, exibir estado de carregamento conforme o padrão do projeto e manter feedback acessível.
- Em sucesso, utilizar o mecanismo de sessão/token e redirecionamento já adotado pela aplicação. Não criar armazenamento paralelo de token nem inventar destino: localizar o fluxo oficial e confirmar a rota pós-login.
- Em falha, apresentar mensagem amigável e não expor stack trace, detalhes internos, tokens ou informações sensíveis.
- Não afirmar que login foi bem-sucedido se a resposta do backend não confirmar.
- Não armazenar senha em localStorage, sessionStorage, cookies manuais ou logs. Seguir rigorosamente a estratégia de autenticação existente.
- A opção “Manter conectado” deve seguir a semântica e o contrato definidos pelo sistema. Não escolher arbitrariamente entre localStorage, sessionStorage ou duração de token.

#### B. Recuperação de senha

- Validar se o e-mail foi preenchido e possui formato básico válido.
- Submeter a solicitação ao serviço de recuperação existente, caso o endpoint/contrato esteja documentado e acessível.
- Desabilitar a ação enquanto a solicitação estiver em andamento para evitar múltiplos envios acidentais.
- Tratar sucesso e erro com feedback visual e acessível.
- Por segurança, preferir mensagem neutra que não confirme se o e-mail está cadastrado, desde que compatível com o contrato e regra do backend.
- Não criar token de recuperação no frontend.
- Não criar uma página para definir nova senha, nem fluxo de confirmação por token, a menos que esteja explicitamente incluído em outra issue/requisito confirmado.
- Não prometer prazo de validade, quantidade de tentativas ou prazo de entrega do e-mail sem fonte oficial.
- “Voltar para o acesso” deve levar ao formulário de login ou focá-lo, conforme o comportamento consistente com o layout e a navegação do projeto.

#### C. Contrato e integração

Antes de implementar chamadas HTTP:
1. localizar o cliente HTTP e os serviços existentes;
2. localizar documentação OpenAPI/Swagger, contratos ou exemplos oficiais;
3. verificar com o código/issue qual endpoint e método são realmente usados;
4. confirmar payload, resposta, códigos de erro e estratégia de autenticação;
5. reutilizar interceptors, tratamento de erros e configuração de ambiente existentes.

Não inventar:
- URLs de endpoint;
- métodos HTTP;
- nomes de campos de payload;
- estrutura de resposta;
- códigos de sucesso;
- formato ou armazenamento de tokens;
- política de sessão;
- papéis/permissões;
- destino pós-login.

Se a API não estiver disponível ou o contrato estiver indefinido:
- não simular uma integração real;
- não criar endpoint fictício;
- isolar qualquer mock em arquivo/camada de desenvolvimento ou teste, com nome e comentário explícitos;
- deixar claro na interface/relatório técnico que a integração real está pendente;
- não fazer mock retornar sucesso de autenticação que permita acessar áreas protegidas como se o usuário estivesse autenticado;
- solicitar o contrato à equipe responsável e registrar o bloqueio na issue/relatório.

#### D. Estados mínimos a tratar

Somente para os fluxos implementados e conforme a arquitetura do projeto:
- inicial/ocioso;
- validação de campos;
- carregando;
- sucesso;
- erro recuperável;
- indisponibilidade de serviço, se houver tratamento global/padrão para isso.

Não criar estados adicionais ou regras de negócio especulativas.

### 1.6. Regras para não prejudicar outras telas e etapas do código

- Trabalhar de forma localizada na GES-01.
- Não refatorar módulos não relacionados.
- Não alterar versões de dependências, scripts, bundler, roteador, providers ou configuração global sem necessidade demonstrável e justificativa.
- Não substituir componentes globais para atender apenas à tela de login.
- Se um componente compartilhado precisar de ajuste, preservar compatibilidade retroativa e verificar todos os seus consumidores.
- Não alterar tokens CSS globais ou reset de estilos para corrigir um detalhe local. Preferir tokens existentes e estilos encapsulados/escopados.
- Não adicionar CSS global que atinja inputs, botões, cards, links ou headings de outras telas.
- Não modificar guards, interceptors ou estratégia de sessão sem entender seus impactos e sem requisito confirmado.
- Não alterar contratos de API consumidos por outras funcionalidades.
- Não excluir código aparentemente sem uso sem confirmar referências e escopo.
- Não renomear arquivos, pastas, componentes ou rotas existentes sem necessidade.
- Não instalar dependências novas quando a funcionalidade puder ser atendida com ferramentas já existentes.
- Não atualizar lockfile por motivos não relacionados.
- Não desabilitar lint, TypeScript, testes, regras de acessibilidade ou verificações para fazer o build passar.
- Não remover testes existentes nem reduzir cobertura para ocultar regressões.
- Não sobrescrever alterações locais não commitadas.
- Manter o padrão de nomenclatura, idioma, organização e formatação do repositório.
- Após qualquer alteração compartilhada, executar os testes pertinentes aos consumidores afetados, não apenas os testes da GES-01.

### 1.7. Reutilização de componentes e proibição de duplicação

A IDE tem liberdade para importar e reutilizar componentes, hooks, serviços, utilitários, layouts e classes existentes, desde que sejam adequados e não alterem seu comportamento indevidamente.

Inspecionar especialmente:
- Header e Footer globais;
- layout/base de páginas públicas e de gestão;
- componentes de formulário e campos;
- botões primários e secundários;
- checkbox;
- ícones;
- alertas/toasts/mensagens de feedback;
- validação de formulários;
- cliente HTTP e serviços;
- hooks de autenticação;
- roteamento e proteção de rotas;
- tokens e estilos compartilhados.

Regras:
- Antes de criar um componente, pesquisar se já existe equivalente.
- Antes de criar um serviço, pesquisar se já existe serviço com a mesma responsabilidade.
- Antes de criar estilos, verificar tokens e estilos do componente existente.
- Preferir composição e propriedades/variantes existentes a duplicar componentes.
- Criar componentes específicos para GES-01 somente quando houver uma responsabilidade visual/comportamental própria e reutilização real ou clareza arquitetural.
- Não criar abstrações genéricas prematuras.
- Não duplicar Header ou Footer. Se o layout existente já os inclui, não renderizá-los novamente dentro da página.
- Não duplicar lógica de validação, mensagens, chamadas HTTP ou controle de sessão.
- Não modificar componentes compartilhados apenas para fazê-los coincidir com uma interpretação não confirmada da imagem.

### 1.8. Restrição de escopo — sem funcionalidades extras ou design inventado

Implemente somente o que estiver:
1. visível na referência fornecida;
2. descrito na issue #105 ou #68;
3. definido por componentes, rotas, contratos e regras já existentes no projeto.

Não adicionar por iniciativa própria:
- login com Google, Microsoft ou redes sociais;
- MFA/2FA;
- CAPTCHA;
- cadastro completo de entidade;
- redefinição de senha por token nesta mesma tela;
- criação de conta;
- seleção de perfil, organização ou papel;
- dashboard ou conteúdo pós-login;
- chat de suporte;
- notificações extras;
- animações e transições não previstas;
- novos menus, cards, banners ou links;
- temas claro/escuro;
- funcionalidades administrativas;
- analytics ou tracking novo.

Quando encontrar uma ideia que pareça útil, mas esteja fora do escopo, registre como sugestão futura sem implementá-la.

### 1.9. Plano de execução recomendado

1. **Auditoria:** inspecionar repositório, branch, arquivos, rotas, componentes e serviços.
2. **Mapeamento:** listar o que já existe para GES-01 e o que está ausente/incompleto.
3. **Dependências:** confirmar contratos de login e recuperação, assets, rotas e decisões pendentes.
4. **Plano de alteração:** apresentar arquivos que serão criados/alterados e motivo de cada mudança.
5. **Implementação visual:** montar a tela com componentes existentes e estilos/tokens oficiais.
6. **Implementação funcional:** conectar validações e serviços reais; mocks somente se necessários e claramente isolados.
7. **Testes:** criar/ajustar testes unitários e executar verificações.
8. **Revisão de regressão:** verificar rotas e componentes compartilhados afetados.
9. **Relatório:** informar o que foi feito, o que ficou bloqueado e resultados reais.
10. **Validação humana:** apresentar a tela para o usuário validar UX e conformidade visual antes de considerar a tarefa aprovada.

Não é necessário pedir aprovação entre etapas pequenas se o escopo e os contratos estiverem claros. Porém, não tomar decisões de produto, API, navegação ou design não especificadas: registrar e solicitar esclarecimento.

### 1.10. Validação via testes de compilação e depois validação humana de UX

A validação técnica deve ocorrer antes de solicitar aprovação visual.

#### Etapa A — verificações automatizadas

Identifique os scripts reais do projeto e execute os equivalentes disponíveis:
- instalação/checagem de dependências, se necessária e segura;
- lint;
- verificação de tipos (se TypeScript estiver configurado);
- testes unitários da GES-01;
- testes relacionados aos componentes compartilhados alterados;
- build/compilação de produção;
- testes adicionais já exigidos pelo repositório.

Não presumir nomes de scripts. Descobrir no manifesto real e registrar o comando exato executado.

Critérios:
- nenhum erro novo de lint/typecheck/build;
- testes relevantes aprovados;
- sem testes existentes quebrados;
- sem warnings novos relevantes ignorados;
- sem secrets ou credenciais nos arquivos/logs;
- sem alterações não relacionadas.

Se uma etapa não puder ser executada, informar o motivo com clareza. Não marcar como aprovada por inferência.

#### Etapa B — revisão técnica do diff

- revisar todos os arquivos modificados;
- confirmar que mudanças estão dentro do escopo;
- verificar imports e componentes duplicados;
- verificar estilos globais;
- verificar rotas e links;
- verificar ausência de dados sensíveis;
- verificar que mocks estão identificados e não simulam autenticação real;
- confirmar que nenhuma funcionalidade fora do escopo foi introduzida.

#### Etapa C — validação humana de UX pelo usuário

Somente depois das etapas automatizadas e revisão do diff, apresentar ao usuário:
- como iniciar a aplicação com o comando real do projeto;
- rota exata para abrir a GES-01;
- viewport recomendado para comparar com o protótipo;
- resumo do que deve ser validado;
- limitações conhecidas, especialmente endpoints/contratos ainda pendentes.

Checklist de validação humana:
- [ ] Header, marca e ação “Precisa de ajuda?” estão alinhados ao protótipo.
- [ ] Coluna institucional, imagem, título, texto e benefícios correspondem à referência.
- [ ] Card de login apresenta os campos, labels, checkbox, link e botões corretos.
- [ ] Card de recuperação apresenta o campo, botão, feedback e link de retorno corretos.
- [ ] Faixa informativa inferior e Footer correspondem à referência.
- [ ] Espaçamentos, alinhamentos, cores, tipografia, bordas e proporções estão visualmente próximos do Figma.
- [ ] A tela não apresenta scroll horizontal indevido no viewport desktop esperado.
- [ ] Foco, teclado, labels e mensagens são utilizáveis.
- [ ] Estados de erro, carregamento e sucesso são compreensíveis.
- [ ] Links e navegação levam somente a destinos válidos e confirmados.
- [ ] Nenhuma outra tela foi visualmente ou funcionalmente prejudicada.

**A aprovação final de UX pertence ao usuário/revisor humano.** A IDE não deve declarar a tela aprovada visualmente apenas porque o build e os testes passaram.

---

## 2. Entrega esperada da IDE

Ao concluir, responder com um relatório contendo:

### 2.1. Diagnóstico inicial
- branch e estado inicial do Git;
- estrutura/arquitetura encontrada;
- arquivos e componentes reutilizados;
- situação inicial da GES-01;
- contratos de backend encontrados ou pendentes.

### 2.2. Implementação
- arquivos criados;
- arquivos alterados;
- descrição objetiva de cada alteração;
- componentes globais reutilizados;
- rotas e serviços conectados;
- mocks utilizados e justificativa, se houver.

### 2.3. Testes e compilação
- comandos exatos executados;
- resultado de lint, typecheck, testes e build;
- falhas encontradas e correções;
- verificações que não puderam ser executadas e motivo.

### 2.4. Pendências e riscos
- endpoint/contrato ausente;
- asset não localizado;
- rota não existente;
- regra que exige confirmação;
- qualquer diferença entre protótipo, issue e código atual.

### 2.5. Solicitação de validação humana
Fornecer o comando de execução e a URL/rota local para o usuário abrir a tela e realizar a validação visual/UX. Não encerrar a tarefa como aprovada até receber essa validação.

---

## 3. Referências oficiais e rastreabilidade

- [Issue #105 — DEV-GES-01: Implementar tela Web: Login e recuperação de senha](https://github.com/PrjDoaSync/doasync-frontend/issues/105)
- [Issue #68 — GES-01: Prototipar e validar Login e recuperação de senha](https://github.com/PrjDoaSync/doasync-frontend/issues/68)
- [Issue #47 — fluxo de prototipação Gestão e Dashboard](https://github.com/PrjDoaSync/doasync-frontend/issues/47)
- [Issue #21 — inventário das telas desktop](https://github.com/PrjDoaSync/doasync-frontend/issues/21)
- [Issue #82 — testes unitários de Gestão e Dashboard](https://github.com/PrjDoaSync/doasync-frontend/issues/82)
- [Figma — DoaSync](https://www.figma.com/design/JaIKR7tTkfIJ3fSk4weadC/Doasync?node-id=0-1&m=dev)

**Regra final:** fidelidade ao protótipo e ao código existente, implementação mínima suficiente, integração somente com contratos confirmados, zero funcionalidades inventadas e validação humana antes do aceite final.
