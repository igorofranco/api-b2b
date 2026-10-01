<!--
docs/arquitetura.md — arquitetura, camadas, estrutura de pastas e fluxo de uma requisição.
Documento de planejamento. Texto em pt-BR. Não duplica o plano de fases (ver ../PLANO.md).
-->

# Arquitetura

> Este documento explica **como** o código é organizado e **por que** cada camada existe. É a base
> para defender o projeto em voz alta (ver `defesa-entrevista.md`).

## Princípio: regra de dependência

O projeto usa **Clean Architecture** com quatro camadas. A dependência sempre aponta para dentro:

```
┌─────────────────────────────────────────────────────────┐
│ presentation   controllers REST · resolvers GraphQL     │
│                DTOs de entrada · guards · pipes · filters│
├─────────────────────────────────────────────────────────┤
│ application    casos de uso · DTOs de aplicação · portas │
├─────────────────────────────────────────────────────────┤
│ domain         entidades · value objects · invariantes   │
│                interfaces de repositório (portas) · erros│
└─────────────────────────────────────────────────────────┘
        ▲
        │ implementa
┌─────────────────────────────────────────────────────────┐
│ infra          Prisma · repositórios concretos · Redis   │
│                JWT · hash de senha · mapeadores          │
└─────────────────────────────────────────────────────────┘
```

- **domain** não conhece nenhuma tecnologia: sem `@nestjs/*`, sem Prisma, sem HTTP, sem GraphQL.
- **application** conhece o domínio e define **portas** (interfaces) para o que precisa de fora.
- **infra** implementa as portas (repositórios, cache, tokens). Depende de `application`/`domain`.
- **presentation** depende de `application`; nunca fala com repositório direto, só com caso de uso.

Se uma regra precisa de framework no `domain/`, ela está na camada errada.

## Estrutura de pastas

Organização **por camada primeiro**, depois por domínio. Escolha consciente: deixa a separação
explícita (o objetivo do projeto é demonstrar a arquitetura) em vez de esconder cada camada dentro de
um módulo. Ver ADR nº 2 em `decisoes.md`.

```
src/
├── domain/
│   ├── entities/            # Customer, Product, PriceTable, Order, OrderItem, Stock, User
│   ├── value-objects/       # Money, Sku, Quantity, Cnpj, IdempotencyKey
│   ├── repositories/        # interfaces (portas): CustomerRepository, OrderRepository, ...
│   ├── errors/              # DomainError e erros específicos
│   └── services/            # regras que não pertencem a uma entidade (ex.: CreditPolicy)
├── application/
│   ├── use-cases/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── price-tables/
│   │   ├── orders/
│   │   └── auth/
│   ├── dtos/                # contratos de entrada/saída dos casos de uso
│   └── ports/               # TokenService, PasswordHasher, CacheService, UnitOfWork
├── infra/
│   ├── database/
│   │   ├── prisma.service.ts
│   │   ├── mappers/         # domínio ↔ persistência
│   │   └── repositories/    # implementações Prisma das portas
│   ├── cache/               # Redis: cache de catálogo, chave de idempotência
│   └── security/            # JWT, hash de senha
├── presentation/
│   ├── http/
│   │   ├── controllers/     # REST
│   │   ├── dtos/            # DTOs de entrada + validação (class-validator)
│   │   ├── guards/          # JwtAuthGuard, RolesGuard
│   │   ├── decorators/      # @Roles, @CurrentUser
│   │   └── filters/         # DomainExceptionFilter (envelope de erro)
│   └── graphql/
│       ├── resolvers/
│       ├── types/           # @ObjectType, @InputType (code-first)
│       └── loaders/         # DataLoader factories
├── shared/                  # utilitários transversais sem regra de negócio
├── app.module.ts
└── main.ts
```

## Fluxo de uma requisição

Exemplo: `POST /api/v1/orders` (criar pedido).

1. **presentation** recebe a requisição; `JwtAuthGuard` valida o token; `RolesGuard` checa o papel;
   `CreateOrderDto` valida o payload (class-validator).
2. O controller chama `CreateOrderUseCase.execute(input)` com os dados já validados.
3. **application** carrega cliente e produtos pelos repositórios (portas), resolve o **preço** pela
   tabela do cliente, verifica **limite de crédito** e **disponibilidade de estoque**.
4. **domain** aplica as invariantes: cria a `Order`, decide o status (confirmado vs. em aprovação) e
   a reserva de estoque. Se algo violar a regra, lança um erro de domínio.
5. **infra** persiste (`OrderRepository` Prisma) e usa Redis para a chave de idempotência.
6. **presentation** traduz o resultado no corpo da resposta; um erro de domínio vira 409/422 via
   `DomainExceptionFilter`.

## Injeção de dependência

- Portas são expostas como **tokens** de injeção (ex.: `ORDER_REPOSITORY`) e ligadas às
  implementações no módulo (`{ provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository }`).
- Casos de uso são `@Injectable()` e recebem as portas no construtor; nunca instanciam Prisma/Redis.
- Em teste, o token é substituído por um **repositório em memória** — é o que permite testar casos de
  uso sem banco (critério da Fase 1).

## Tratamento de erros

- **Domínio:** `DomainError` (base) + específicos (`InsufficientCreditError`, `InsufficientStockError`,
  `OrderNotApprovableError`, `CustomerInactiveError`, ...). São erros de negócio, sem HTTP no nome.
- **Application:** converte/encapsula quando precisa de contexto adicional; não sabe HTTP.
- **Presentation:** `DomainExceptionFilter` mapeia o erro para o envelope documentado em
  `contratos-api.md` e o status correto (ex.: crédito insuficiente → 422; conflito de estado → 409).

## Transações e concorrência

- **Reserva de estoque** acontece em uma transação: lê-se a linha de estoque com lock
  (`SELECT ... FOR UPDATE` via transação Prisma) e só reserva se `em mãos − reservado >= pedido`.
- Alternativa/complemento: `UPDATE ... SET reserved = reserved + :q WHERE on_hand - reserved >= :q`
  e checar linhas afetadas. A decisão final está na ADR nº 8.
- **Idempotência:** a chave vai para uma `unique constraint` no banco **e** para o Redis (lock curto
  - resposta armazenada), cobrindo corrida e retry. Detalhe na ADR nº 9.

## Testes por camada

| Camada       | Ferramenta                | O que cobre                                              |
| ------------ | ------------------------- | -------------------------------------------------------- |
| domain       | Vitest unit               | invariantes, value objects, máquina de estados do pedido |
| application  | Vitest unit + fakes       | casos de uso com repositórios em memória (sem banco)     |
| infra        | Vitest integração         | repositórios Prisma contra um Postgres de teste          |
| presentation | e2e (supertest / GraphQL) | fluxo HTTP completo: auth, validação, erros, status      |

Fluxos com **concorrência real** (estoque) e **idempotência** rodam em e2e com Postgres + Redis do
Docker Compose, porque só o banco de verdade prova a proteção.

## Observabilidade (Fase 6)

- **Logs estruturados** em JSON (nível, contexto, `correlationId`), como no worker do Larear.
- **Health checks** com `@nestjs/terminus`: API, Postgres e Redis.
- **Métricas/tracing** (OpenTelemetry, cache hit/miss) ficam como evolução opcional, não bloqueiam o DoD.
