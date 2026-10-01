<!--
docs/decisoes.md — registro de decisões de arquitetura (ADRs).
Cada ADR: contexto, decisão, alternativas, consequências e status.
Texto em pt-BR. Relacionado: arquitetura.md, dominio.md, contratos-api.md.
-->

# Decisões de arquitetura (ADRs)

Formato: **Contexto → Decisão → Alternativas consideradas → Consequências**. Status possíveis:
`proposta`, `aceita`, `substituída`.

---

## ADR nº 1 — NestJS como framework

- **Contexto:** o gap de maior frequência nas vagas é Node.js (100 menções), e o projeto precisa
  demonstrar estrutura, DI, guards, pipes e interceptors em uma API real.
- **Decisão:** usar **NestJS** sobre Node.js + TypeScript.
- **Alternativas:** Express puro (menos estrutura, mais código de infra para provar pouco); Fastify
  puro (performance, mas sem o vocabulário de módulos/DI que as vagas pedem); AdonisJS.
- **Consequências:** vocabulário alinhado ao mercado (módulos, DI, decorators); curva inicial; o
  domínio fica **fora** do framework para não acoplar a arquitetura a ele.

## ADR nº 2 — Clean Architecture com camadas explícitas

- **Contexto:** o plano pede Clean Architecture/SOLID visíveis e testáveis, com domínio isolado da infra.
- **Decisão:** organizar por **camada primeiro** (`domain/`, `application/`, `infra/`, `presentation/`),
  com a regra de dependência apontando para dentro. Casos de uso dependem de **portas** (interfaces),
  e a infra fornece as implementações via DI.
- **Alternativas:** estrutura "module-first" do NestJS (cada módulo com controller/service/dto) —
  pragmática, porém mistura responsabilidades e esconde as camadas; hexagonal estrita com pastas
  `in/out` — mais cerimônia do que o portfólio precisa.
- **Consequências:** separação explícita e fácil de explicar; algum boilerplate de mapeamento
  (domínio ↔ Prisma); testes de caso de uso rodam sem banco (fakes nos tokens).

## ADR nº 3 — Prisma como ORM

- **Contexto:** persistência em PostgreSQL com migrations e seed, e tipagem forte em TypeScript.
- **Decisão:** **Prisma** (schema declarativo, `prisma migrate`, seed, client tipado).
- **Alternativas:** TypeORM (mais "Nest-like", mas migrations e tipagem mais frágeis); Kysely/Query
  builder (controle total, sem migrations prontas); SQL puro (mais trabalho, menos didático aqui).
- **Consequências:** produtividade e tipos fortes; a query do Prisma fica **na infra** (os repositórios
  do domínio não vazam tipos do Prisma); transações interativas para o locking de estoque.

## ADR nº 4 — REST e GraphQL sobre o mesmo domínio

- **Contexto:** as vagas citam GraphQL (40 menções) e o projeto precisa provar APIs REST e GraphQL.
- **Decisão:** REST versionado (`/api/v1`) para operações administrativas/de escrita e GraphQL
  (`/graphql`) para consulta flexível, ambos chamando os **mesmos casos de uso**.
- **Alternativas:** só REST (não fecha o gap de GraphQL); só GraphQL (escrita administrativa fica
  menos natural e o REST é o que a maioria das vagas Node exige); dois backends separados (duplicação
  de regra, pior de manter).
- **Consequências:** prova as duas interfaces sem duplicar regra; exige disciplina para não mover
  regra para resolvers; testes cobrem as duas bordas.

## ADR nº 5 — GraphQL code-first com DataLoader

- **Contexto:** consultas de catálogo/pedidos tendem a gerar N+1 (preço por cliente, itens por pedido).
- **Decisão:** schema **code-first** (decorators do NestJS) e **DataLoader** por requisição para todo
  resolver que busca por lote.
- **Alternativas:** schema-first/SDL (bom, mas separa tipo e resolução); desligar N+1 "na mão" com
  joins específicos (menos reutilizável); `join-monster` (pouco usado).
- **Consequências:** tipos e resolvers no mesmo lugar; DataLoader exige contexto por requisição; um
  teste dedicado comprova que o número de queries não cresce com N.

## ADR nº 6 — Redis para cache de catálogo e idempotência

- **Contexto:** o plano prevê Redis (cache + idempotência) e o Larear já valida esse uso em produção.
- **Decisão:** Redis para (a) **cache do catálogo** com invalidação por domínio (chave + TTL) e
  (b) **chave de idempotência** na criação de pedido. Filas (BullMQ) só se algum fluxo assíncrono
  aparecer; não é obrigatório para o DoD.
- **Alternativas:** cache em memória (não sobrevive a réplica e não é o que as vagas pedem);
  idempotência só no banco (funciona, mas o Redis evita reexecutar a regra inteira no retry).
- **Consequências:** mais uma dependência em dev/produção (Docker); a invalidação precisa ser
  explícita nos casos de uso que mudam catálogo; idempotência também apoiada por `unique constraint`
  para valer entre réplicas (ver ADR nº 9).

## ADR nº 7 — Autenticação JWT com RBAC

- **Contexto:** o sistema tem operações de admin (catálogo, aprovação) e de cliente (pedidos).
- **Decisão:** **JWT de acesso** com `role` (`admin`/`cliente`) e `customerId`, validado por
  `JwtAuthGuard`; autorização por `RolesGuard` + decorator `@Roles`. Senha com hash forte.
- **Alternativas:** sessão em servidor (menos alinhado a API stateless); OAuth/OIDC externo (fora do
  escopo e mais infra); refresh token já na Fase 2 (adiciona complexidade; entra depois se necessário).
- **Consequências:** API stateless e testável; token sem revogação imediata (aceitável no escopo);
  refresh token e 2FA ficam como evolução opcional.

## ADR nº 8 — Reserva de estoque com transação e locking

- **Contexto:** criação concorrente de pedidos pode vender mais do que existe se a checagem não for atômica.
- **Decisão:** a reserva (na confirmação) roda em **transação** com lock da linha de estoque
  (`SELECT ... FOR UPDATE`) e só efetiva se `onHand - reserved >= quantidade`. A reserva só é criada
  na **confirmação** (direta ou por aprovação), não na criação.
- **Alternativas:** checar e depois atualizar em passos separados (corrida clássica); `UPDATE`
  condicional sem lock (funciona, mas o lock deixa a intenção explícita); reservar já na criação
  (segura estoque de pedidos que podem ser rejeitados).
- **Consequências:** estoque nunca negativo sob concorrência; menor paralelismo nas linhas quentes
  (aceitável no escopo); teste e2e com criações simultâneas prova a proteção.

## ADR nº 9 — Idempotência de criação de pedido

- **Contexto:** retries de rede não podem duplicar pedidos (o Larear valida esse padrão em produção).
- **Decisão:** header `Idempotency-Key` por requisição; deduplicação com **Redis** (lock curto +
  resposta armazenada com TTL) **e** `unique (customerId, idempotency_key)` no banco como rede de
  segurança entre réplicas. Chave repetida com payload idêntico devolve o mesmo pedido; payload
  divergente devolve `409 IDEMPOTENCY_CONFLICT`.
- **Alternativas:** só banco (simples, mas reexecuta a regra até colidir); só Redis (perde a garantia
  se o cache cair); idempotência por hash do payload (muda a semântica de retry legítimo).
- **Consequências:** retry seguro e comprovável; necessidade de decidir o TTL e o escopo da chave
  (por cliente); teste dedicado de requisição repetida.

## ADR nº 10 — Deploy em VPS com Docker + systemd

- **Contexto:** o DoD exige API no ar com deploy automatizado, e o usuário já opera VPS Hetzner com
  Docker + systemd no Larear.
- **Decisão:** imagem de produção multi-stage; containers de API, Postgres e Redis na VPS; systemd
  para manter o serviço; deploy disparado por merge na `main` no GitHub Actions; migrations aplicadas
  no deploy; health checks (`@nestjs/terminus`) e logs estruturados.
- **Alternativas:** PaaS (Render/Railway/Fly.io) — mais simples, porém menos controle e menos aderente
  ao que o usuário já opera; serverless — pouco aderente a Postgres/Redis persistentes e a WebSocket.
- **Consequências:** reproduz a operação real do Larear (bom de entrevista); exige cuidar de segredos,
  backup e rollback; aumenta a superfície de infra a manter.

## ADR nº 11 — Tooling de lint/teste: oxlint + Vitest (no lugar de ESLint + Jest)

- **Contexto:** o Nest CLI 12 gera, por padrão, projeto **ESM + TypeScript 6** com **oxlint
  (`--type-aware`)** e **Vitest**, já com cobertura. O plano de origem do `carreira` previa **ESLint
  (flat) + Prettier** e **Jest** (Jest é um gap citado nas vagas, com 32 menções). Esse tooling-alvo
  também impõe restrição de versão: `typescript-eslint` e `ts-jest` só suportam TypeScript abaixo de
  6.1, o que obrigaria a fixar TS 6 e adaptar o Jest ao modo ESM.
- **Decisão:** seguir o default do Nest 12 — **oxlint `--type-aware` + Prettier** para lint/formatação
  e **Vitest** (unit + e2e, com cobertura) para testes. Decisão do usuário em 2026-10-01.
- **Alternativas:** ESLint flat + Jest como no plano (mais fiel ao objetivo, porém exige fixar TS 6,
  configurar Jest ESM e contrariar o default do Nest 12); manter oxlint e trocar só o Vitest por Jest
  (mistura os dois, sem ganho).
- **Consequências:** setup mais enxuto, rápido e alinhado ao framework; **o projeto deixa de
  demonstrar Jest** — o gap "Jest (32 menções)" do `carreira` deixa de ser fechado por este repo e
  precisa de alinhamento no plano de origem. O restante do stack-alvo (NestJS, Prisma, GraphQL,
  Redis, Docker, CI/CD) permanece. Revisar com o `carreira` antes de mudar de novo.
