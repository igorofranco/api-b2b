<!--
docs/contratos-api.md — convenções, endpoints REST e schema GraphQL planejados.
Documento de planejamento. Texto em pt-BR. Implementação nas Fases 2–4 (ver ../PLANO.md).
-->

# Contratos da API

O mesmo domínio (`dominio.md`) é exposto em duas interfaces sobre os **mesmos casos de uso**:

- **REST** (`/api/v1`) para operações administrativas e de **escrita** (criar, aprovar, cancelar,
  cadastrar), onde códigos de status e verbos deixam a intenção explícita.
- **GraphQL** (`/graphql`) para **consulta flexível** do catálogo e dos pedidos, onde o cliente
  escolhe os campos, combina recursos e evita over-fetching.

> Não é "dois backends": são duas portas de entrada para os mesmos casos de uso. Isso é o principal
> argumento de entrevista sobre o desenho (ver ADR nº 4).

## Convenções gerais

- **Base:** `/api/v1` para REST; `/graphql` para GraphQL. Versionamento por prefixo de rota.
- **Formato:** JSON; datas em ISO 8601 (UTC); dinheiro em **centavos inteiros** + campo de moeda.
- **Autenticação:** `Authorization: Bearer <jwt>` nas rotas/consultas protegidas.
- **Idempotência:** header `Idempotency-Key` (UUID) nas operações de escrita não idempotentes
  (criação de pedido).
- **Paginação REST:** query `page` (1-based) e `limit` (padrão 20, máx 100).
- **Ordenação/filtro REST:** `sort` (ex.: `-createdAt`) e filtros por campo (ex.: `status=confirmed`).

### Envelope de erro (REST)

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "INSUFFICIENT_CREDIT",
  "message": "O pedido excede o limite de crédito disponível do cliente.",
  "details": { "creditLimit": 500000, "exposure": 620000 },
  "path": "/api/v1/orders",
  "timestamp": "2026-10-01T12:00:00.000Z"
}
```

Códigos de negócio estáveis (`code`) para o cliente reagir sem parsear texto:

| Erro de domínio | HTTP | `code` |
|---|---|---|
| não autenticado | 401 | `UNAUTHENTICATED` |
| sem permissão para o papel | 403 | `FORBIDDEN` |
| validação de payload | 400 | `VALIDATION_ERROR` |
| produto/cliente inexistente | 404 | `NOT_FOUND` |
| cliente inativo | 422 | `CUSTOMER_INACTIVE` |
| crédito insuficiente | 422 | `INSUFFICIENT_CREDIT` |
| estoque insuficiente | 422 | `INSUFFICIENT_STOCK` |
| transição de status inválida | 409 | `INVALID_ORDER_STATE` |
| chave de idempotência divergente | 409 | `IDEMPOTENCY_CONFLICT` |

## REST — recursos

### Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/login` | público | email + senha → access token |
| GET | `/auth/me` | autenticado | dados do usuário logado |

### Clientes (admin)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/customers` | admin | lista paginada (filtro `status`, busca por nome/CNPJ) |
| GET | `/customers/:id` | admin | detalhe + exposição atual e limite |
| POST | `/customers` | admin | cria cliente (com tabela de preço e limite) |
| PATCH | `/customers/:id` | admin | atualiza dados e limite |
| PATCH | `/customers/:id/status` | admin | ativa/inativa |

### Produtos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/products` | autenticado | lista paginada (filtro `status`, busca por nome/SKU) |
| GET | `/products/:id` | autenticado | detalhe (com preço para o cliente, se cliente) |
| POST | `/products` | admin | cria produto |
| PATCH | `/products/:id` | admin | atualiza produto |
| PATCH | `/products/:id/status` | admin | ativa/inativa |

### Tabelas de preço (admin)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/price-tables` | admin | lista tabelas |
| GET | `/price-tables/:id` | admin | detalhe + itens |
| POST | `/price-tables` | admin | cria tabela |
| PUT | `/price-tables/:id/items` | admin | define/substitui preços por produto |

### Pedidos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/orders` | cliente, admin | cria pedido (header `Idempotency-Key`) |
| GET | `/orders` | autenticado | lista (cliente vê os seus) |
| GET | `/orders/:id` | autenticado | detalhe com itens e status |
| POST | `/orders/:id/approve` | admin | aprova pedido em `pending_approval` |
| POST | `/orders/:id/reject` | admin | rejeita pedido em `pending_approval` |
| POST | `/orders/:id/cancel` | admin, cliente | cancela pedido `confirmed` e libera reserva |

### Exemplo — criar pedido

```http
POST /api/v1/orders
Authorization: Bearer <jwt>
Idempotency-Key: 6f2a1c3e-...
Content-Type: application/json

{
  "items": [
    { "productId": "p_1", "quantity": 10 },
    { "productId": "p_2", "quantity": 2 }
  ]
}
```

Resposta `201` (confirmado, dentro do limite):

```json
{
  "id": "o_1",
  "status": "confirmed",
  "customerId": "c_1",
  "items": [
    { "productId": "p_1", "quantity": 10, "unitPriceCents": 1500, "subtotalCents": 15000 },
    { "productId": "p_2", "quantity": 2, "unitPriceCents": 4200, "subtotalCents": 8400 }
  ],
  "totalCents": 23400,
  "createdAt": "2026-10-01T12:00:00.000Z"
}
```

Resposta `202` (acima do limite, em aprovação): mesmo corpo com `"status": "pending_approval"`.

## GraphQL

Code-first (NestJS + Apollo). O schema espelha os casos de uso e **não duplica regra**: resolvers
chamam os mesmos use-cases do REST.

### Tipos

```graphql
type Product {
  id: ID!
  sku: String!
  name: String!
  description: String
  unit: String!
  basePriceCents: Int!
  status: ProductStatus!
  priceForCustomer(customerId: ID!): Int   # preço resolvido pela tabela do cliente
}

type Customer {
  id: ID!
  name: String!
  status: CustomerStatus!
  creditLimitCents: Int!
  exposureCents: Int!
  orders(first: Int, after: String, status: OrderStatus): OrderConnection!
}

type Order {
  id: ID!
  status: OrderStatus!
  customer: Customer!
  items: [OrderItem!]!
  totalCents: Int!
  createdAt: DateTime!
}

type OrderItem {
  product: Product!
  quantity: Int!
  unitPriceCents: Int!
  subtotalCents: Int!
}
```

### Queries

```graphql
type Query {
  products(
    filter: ProductFilter
    sort: ProductSort
    page: PaginationInput
  ): ProductConnection!

  product(id: ID!): Product

  orders(
    filter: OrderFilter
    page: PaginationInput
  ): OrderConnection!

  order(id: ID!): Order
}
```

- Paginação por **conexão** (`edges`/`node`/`pageInfo`/`totalCount`) para carteira de página.
- `filter`, `sort` e `page` entram como `input`, validados por `class-validator` (ArgumentPipe).

### Mutations

```graphql
type Mutation {
  createOrder(input: CreateOrderInput!, idempotencyKey: ID!): Order!
  approveOrder(id: ID!): Order!
  rejectOrder(id: ID!, reason: String): Order!
  login(email: String!, password: String!): AuthPayload!
}
```

> Escrita de catálogo/cliente fica **só no REST** (admin, status HTTP explícito). O GraphQL cobre
> leitura ampla + as operações de pedido que o cliente consome.

### Exemplo — catálogo com preço por cliente

```graphql
query Catalog($customerId: ID!, $page: PaginationInput) {
  products(filter: { status: ACTIVE }, sort: { field: NAME, direction: ASC }, page: $page) {
    totalCount
    edges {
      node {
        sku
        name
        basePriceCents
        priceForCustomer(customerId: $customerId)
      }
    }
  }
}
```

### N+1 e DataLoader

Consultas que atravessam **produto → preço → cliente** ou **pedido → itens → produto** são o ponto
clássico de N+1. Cada resolver que busca por lote tem um **DataLoader** próprio, criado por
requisição no contexto:

- `PriceByCustomerLoader` (chave: `productId + customerId`).
- `CustomerLoader` (chave: `customerId`).
- `OrderItemsLoader` / `ProductLoader` (chave: `orderId` / `productId`).

**Prova:** um teste conta as queries emitidas ao resolver uma consulta com N produtos e afirma que o
número **não cresce** com N (ver critério de pronto da Fase 3).

### Autorização no GraphQL

Os resolvers usam o mesmo `JwtAuthGuard`/RBAC: o usuário vem no contexto e um `RolesGuard` de
resolver protege mutations administrativas. A regra de negócio (crédito, estoque) permanece nos
casos de uso, nunca no resolver.
