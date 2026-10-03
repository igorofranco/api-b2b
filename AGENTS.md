<!--
AGENTS.md — instruções para agentes de IA (e humanos) que trabalharem neste repositório.
Este arquivo é o "como trabalhar" do projeto, não a documentação do produto.
Plano e progresso: PLANO.md. Arquitetura: docs/arquitetura.md.
-->

# AGENTS.md — api-b2b

## Por que este projeto existe

`api-b2b` é uma **peça de portfólio** de uma busca ativa por vagas **remotas (Brasil), PJ**, de
desenvolvedor **backend/fullstack pleno-sênior** em Node.js. O objetivo não é um produto comercial:
é uma **prova** de domínio da stack (NestJS, GraphQL, Prisma, PostgreSQL, Redis, Vitest, Docker,
CI/CD) com **regra de negócio real** (preço por contrato, limite de crédito, reserva de estoque,
idempotência), boas práticas de arquitetura e histórico de commits legível.

> **Regra de ouro:** prefira clareza e explicabilidade à esperteza. Cada decisão de arquitetura deve
> ser **explicável em voz alta** sem consultar o código (é o critério de pronto do projeto).

## Relação com o repositório de carreira (fonte da verdade)

`api-b2b` **não define sozinho** o que deve ter. Ele é uma peça de portfólio guiada pelo repositório
de carreira (`../carreira/`): é de lá que vêm as **habilidades e tecnologias** que este projeto
precisa provar, os **gaps** que ele fecha e o **método** que rege o trabalho.

> **Regra:** antes de decidir **o que** construir, **qual** tecnologia usar ou **como** priorizar,
> consulte o `../carreira/` e mantenha o que está aqui alinhado com o que está lá. Na dúvida de
> direcionamento, o `carreira` decide — **não distancie o projeto do objetivo proposto lá**.

De lá, os pontos que mais importam:

- `../carreira/projetos-portfolio/01-api-b2b/plano.md` — plano de origem deste projeto (fases,
  escopo, tecnologias, critério de pronto, status). É a **referência de objetivo**.
- `../carreira/perfil/habilidades.md` — o que o projeto deve **provar** (nível atual e gap).
- `../carreira/perfil/recursos-estudo.md` — bibliografia de apoio por fase (consulta sob demanda).
- `../carreira/projetos-portfolio/README.md` — gaps/vagas que motivaram o projeto e o que **não**
  vira projeto.
- `../carreira/vagas/` (seção "Cobertura da vaga") — requisitos reais das vagas alvo.
- `../carreira/planejamento/decisoes.md` e `../carreira/planejamento/filosofia-busca.md` — premissas
  imutáveis (remoto-BR, sem burocracia portuguesa, somente PJ) e método (projeto-primeiro, com o
  funil tendo precedência).

Regras desta relação:

- **Não distanciar do objetivo.** Não adicione tecnologia, fase ou escopo que não sirva ao que o
  `carreira` define; se achar que algo falta ou deveria mudar, **pergunte** antes de alterar o rumo.
- **Não trocar a stack-alvo** (NestJS, GraphQL, Prisma, PostgreSQL, Redis, Docker, CI/CD) por
  conveniência ou preferência pessoal: ela existe para fechar gaps específicos das vagas. O tooling
  de teste/lint atual (`Vitest` + `oxlint`) desvia do plano de origem (`Jest` + `ESLint`) por decisão
  registrada na **ADR nº 11** (`docs/decisoes.md`) — alinhar com o `carreira` antes de mudar de novo.
- **Este repo é a cópia executável detalhada** do plano de origem:
  - `PLANO.md` — fases, escopo, tecnologias, critério de pronto e progresso (espelha o plano de origem).
  - `docs/` — o detalhamento que não cabe no plano de origem (arquitetura, domínio, contratos, ADRs).
  - Ao concluir uma fase, marque aqui **e** atualize o status no plano de origem.
- Se houver **conflito** entre este repo e o `carreira`, o `carreira` vence, e o conflito deve ser
  apontado ao usuário antes de seguir.

## Contexto de domínio

Gestão comercial B2B. Vocabulário mínimo:

- **Tabela de preço:** lista de preços por contrato; cada cliente tem a sua. O preço do item do
  pedido é resolvido pela tabela do cliente (fallback: preço de tabela do produto).
- **Limite de crédito:** teto de exposição do cliente. Pedido dentro do limite confirma direto;
  acima, entra em **aprovação**.
- **Reserva de estoque:** na confirmação, a quantidade é reservada; disponível = em mãos − reservado.
- **Idempotência:** a criação de pedido aceita uma chave de idempotência; repetir a requisição não
  duplica o pedido.

Detalhamento completo (entidades, invariantes, ERD): `docs/dominio.md`.

## Escopo funcional (o que a API precisa provar)

- **Autenticação e autorização:** JWT + RBAC (`admin` / `cliente`), guards e decorator `@Roles`.
- **Catálogo e clientes** em REST versionado, com validação de DTO e erros padronizados.
- **GraphQL** sobre o mesmo domínio, consulta de catálogo/pedidos com filtro, paginação e ordenação,
  **sem N+1** (DataLoader comprovado).
- **Pedidos:** criação com preço vigente por cliente, confirmação dentro do limite ou aprovação,
  reserva de estoque à prova de concorrência e criação idempotente.
- **Qualidade:** Vitest unit (casos de uso sem banco) + e2e (supertest), thresholds de cobertura no CI.
- **Entrega:** deploy em VPS (Docker + systemd), health checks, logs estruturados, README com impacto
  antes de stack.

Plano por fases e progresso: `PLANO.md`.

## Stack

- Node.js (LTS atual) + TypeScript (strict)
- NestJS (DI, módulos, guards, pipes, interceptors, exception filters)
- PostgreSQL + Prisma (schema, migrations, seed)
- REST versionado (`/api/v1`) + GraphQL code-first (Apollo) + DataLoader
- Redis (cache de catálogo + chave de idempotência; BullMQ só se necessário)
- Vitest + supertest; oxlint (type-aware) + Prettier
- Docker Compose (dev) e Docker + systemd (VPS); GitHub Actions (lint + typecheck + test + build + deploy)

## Arquitetura (regra de dependência)

Camadas explícitas e dependência apontando sempre para dentro:

```
presentation  →  application  →  domain
     │               │              ▲
     └───────────────┴──────► infra ┘   (infra implementa as portas do domínio/aplicação)
```

- **domain:** entidades, value objects, invariantes, interfaces de repositório (portas) e erros de
  domínio. **Não importa** NestJS, Prisma, HTTP ou GraphQL.
- **application:** casos de uso (orquestram o domínio), DTOs de aplicação e portas de serviços.
- **infra:** implementações Prisma dos repositórios, Redis, JWT, hash de senha, mapeadores.
- **presentation:** controllers REST, resolvers GraphQL, DTOs de entrada, guards, pipes e filters.
  Nunca acessa repositório direto: sempre via caso de uso.

Estrutura de pastas, fluxo de uma requisição e estratégia de testes: `docs/arquitetura.md`.

## Estado atual

- **Fase 0 (Fundação)** — concluída. **Fase 1 (Domínio e camadas)** — concluída.
- Base no ar: NestJS 12 (ESM) + TypeScript 6 strict (+ checagens extras); `/health` respondendo.
- Domínio e persistência: value objects, entidades, invariantes e portas em `src/domain/`; casos de
  uso em `src/application/`; Prisma + Postgres em `src/infra/persistence/prisma/` (migration e seed).
- Ambiente de dev: `docker compose up` sobe a API, o Postgres e o Redis.
- CI: GitHub Actions roda `prisma generate`, `format:check`, `lint`, `typecheck`, `test`, `test:e2e`
  (com Postgres de serviço) e `build` em push e PR.
- Tooling de qualidade: oxlint `--type-aware`, Prettier, Vitest (unit + e2e) com cobertura — ver
  **ADR nº 11** (`docs/decisoes.md`).

## Comandos

> Implementados no `package.json`.

| Ação       | Comando                  |
| ---------- | ------------------------ |
| Dev        | `npm run start:dev`      |
| Build      | `npm run build`          |
| Typecheck  | `npm run typecheck`      |
| Lint       | `npm run lint`           |
| Formatar   | `npm run format`         |
| Testes     | `npm run test`           |
| Testes e2e | `npm run test:e2e`       |
| Cobertura  | `npm run test:coverage`  |
| Migrations | `npm run prisma:migrate` |
| Seed       | `npm run prisma:seed`    |

**Ao concluir qualquer alteração:** rode `npm run lint`, `npm run typecheck`, `npm run test` e
`npm run build`. Não entregue com vermelho.

## Convenções de código

- Siga os arquivos vizinhos: nomes, organização por pasta e tipos.
- **Domínio sem framework:** nada de decorator do NestJS, `PrismaService` ou `Request` dentro de
  `domain/`. Se precisar de framework ali, a lógica está na camada errada.
- Casos de uso recebem dependências por injeção (portas), nunca instanciam Prisma/Redis.
- Tipagem estrita; evite `any`. Use `import type` quando for só tipo.
- Validação de entrada na borda (DTO + `class-validator`); invariante de negócio no domínio.
- Erros de domínio são explícitos (`InsufficientCreditError`, `InsufficientStockError`, ...) e
  traduzidos para HTTP/GraphQL por um exception filter na presentation.
- Não adicione comentários ao código; nomeie bem.
- Toda regra de negócio relevante tem teste. Casos de uso testam com repositório em memória (sem
  banco); fluxos com concorrência/idempotência testam com Postgres e Redis reais (e2e).
- Mantenha os testes existentes passando; atualize-os quando o comportamento mudar.

## Convenções de Git

- Commits em português, no imperativo e com escopo quando ajudar (`feat(orders): ...`,
  `fix(stock): ...`, `test(orders): ...`), como no restante do portfólio.
- Uma fase = um PR (ou um conjunto pequeno de commits) com o artefato declarado no `PLANO.md`.
- Nunca commite `.env`, tokens ou segredos. Segredos entram por variável de ambiente.

## Regras de conteúdo

Valem para **README, docs, mensagens e qualquer texto público**:

- Tudo em **português (pt-BR)**.
- **Impacto primeiro, stack depois** ao descrever o projeto.
- Textos de apresentação em **primeira pessoa**, com verbo de ação.
- Sem `~`, sem travessão `—` no meio de frases.
- Sem listar falhas/gaps ("não sei", "não tenho experiência com").
- Não inventar métrica nem fato: o que não existe fica `TBD`.

## Verificação ao concluir uma edição

- [ ] O que foi feito continua **alinhado ao `carreira`** (objetivo, habilidades e tecnologias do
      `../carreira/projetos-portfolio/01-api-b2b/plano.md`), sem distanciar do proposto?
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` e `npm run build` passam (quando houver código).
- [ ] A regra de dependência foi respeitada (`domain/` sem framework)?
- [ ] A nova regra de negócio tem teste?
- [ ] O `PLANO.md` reflete o progresso (itens marcados, artefato registrado)?
- [ ] Continua explicável em voz alta na entrevista (ver `docs/defesa-entrevista.md`)?
