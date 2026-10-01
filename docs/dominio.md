<!--
docs/dominio.md — entidades, invariantes, máquina de estados e modelo de dados (ERD).
Documento de planejamento. Texto em pt-BR. Fonte das regras: ../PLANO.md e AGENTS.md.
-->

# Domínio e modelo de dados

Contexto delimitado (bounded context): **gestão comercial B2B**. O sistema cobre catálogo com preço
por contrato, clientes com limite de crédito, pedidos com fluxo de aprovação e estoque reservado na
confirmação.

## Entidades e value objects

### Value objects

| VO | Descrição | Invariantes |
|---|---|---|
| `Money` | valor monetário em centavos + moeda (BRL) | não negativo quando usado como preço; aritmética segura (sem float) |
| `Sku` | código do produto | único, formato normalizado (maiúsculas, sem espaço) |
| `Quantity` | quantidade inteira | > 0; nunca fracionária |
| `Cnpj` | documento do cliente | 14 dígitos, validação de dígitos verificadores |
| `IdempotencyKey` | chave de deduplicação | não vazia; escopo por cliente |

### Entidades

| Entidade | Raiz de agregado? | Campos principais |
|---|---|---|
| `Customer` | sim | id, nome, `Cnpj`, status (`active`/`inactive`), `creditLimit`, priceTableId |
| `Product` | sim | id, `Sku`, nome, descrição, unidade, basePrice, status |
| `PriceTable` | sim | id, nome, vigência (`validFrom`/`validTo`), moeda |
| `PriceTableItem` | (entidade de `PriceTable`) | priceTableId, productId, preço |
| `Stock` | sim (por produto) | productId, `quantityOnHand`, `quantityReserved` |
| `Order` | sim | id, customerId, status, items, totais, idempotencyKey, createdBy, datas |
| `OrderItem` | (entidade de `Order`) | productId, quantidade, `unitPrice` (snapshot), subtotal |
| `StockReservation` | entidade própria | orderId, productId, quantidade, status, expiraEm |
| `User` | sim | id, email, passwordHash, role (`admin`/`cliente`), customerId (nulo p/ admin) |

### Agregados e fronteiras

- **`Order`** é o agregado central: `OrderItem`s vivem dentro dele; toda mudança passa pela raiz.
- **`Customer`** controla o próprio limite de crédito; a exposição é calculada a partir dos pedidos
  em aberto.
- **`Stock`** é agregado próprio por produto, para permitir reserva concorrente sem carregar o pedido.
- **`StockReservation`** liga pedido e estoque; a reserva é o que garante "não vender o que não existe".

## Invariantes (regras de negócio)

1. **Preço por contrato:** o preço unitário do item é o da `PriceTable` do cliente; se não houver
   item para o produto, cai no `basePrice` do produto. O preço é **congelado (snapshot)** no item do
   pedido na criação — mudar a tabela depois não altera o pedido.
2. **Limite de crédito:** o pedido só confirma direto se
   `total do pedido + exposição em aberto do cliente <= creditLimit`. Acima disso, vai para
   `pending_approval`. `exposição em aberto` = soma dos pedidos em `pending_approval` + `confirmed`
   ainda não faturados.
3. **Reserva de estoque:** só se confirma (ou aprova) com disponibilidade
   `quantityOnHand - quantityReserved >= quantidade pedida` para **todos** os itens. A reserva é
   atômica: sob criação concorrente, o estoque **nunca** fica negativo.
4. **Status do pedido:** só transita pela máquina de estados abaixo; transição inválida é erro.
5. **Cliente inativo:** não pode criar pedido (`CustomerInactiveError`).
6. **Produto inativo:** não pode entrar em pedido novo.
7. **Idempotência:** a mesma `(customerId, idempotencyKey)` retorna o **mesmo** pedido, sem criar
   outro, mesmo sob retry.

## Máquina de estados do pedido

```
                 cria (dentro do limite)
   (novo) ─────────────────────────────────► confirmed ──► cancelled
      │                                          ▲
      │ cria (acima do limite)                   │ aprovar
      ▼                                          │
 pending_approval ───────────────────────────►  │
      │                                          │
      │ rejeitar                                 │
      ▼                                          │
  rejected                              (reserva liberada no cancel/reject)
```

| Status | Significado | Quem gera | Efeito no estoque |
|---|---|---|---|
| `pending_approval` | acima do limite, aguardando admin | criação | ainda não reserva (a reserva é feita na aprovação) |
| `confirmed` | confirmado (direto ou após aprovação) | criação ou aprovação | reserva criada |
| `rejected` | recusado pelo admin | aprovação | nenhuma reserva |
| `cancelled` | cancelado após confirmação | admin/cliente | reserva liberada |

> Decisão de desenho: a reserva só é criada na **confirmação** (ADR nº 8). Isso evita segurar
> estoque por pedidos que talvez nunca sejam aprovados.

## Modelo de dados (ERD)

```
 Customer 1 ──── * Order * ──── 1 PriceTable
    │                │                │
    │                │                │ *
    │                *           PriceTableItem * ── 1 Product
    │           OrderItem * ────────────────┘
    │                │
    │                └── * StockReservation * ── 1 Stock ── 1 Product
    │
    └── * User (customerId nulo = admin)
```

### Tabelas (esboço)

- `customers` (id, name, cnpj unique, status, credit_limit, price_table_id → price_tables)
- `price_tables` (id, name, currency, valid_from, valid_to)
- `price_table_items` (id, price_table_id, product_id, price_cents, unique(price_table_id, product_id))
- `products` (id, sku unique, name, description, unit, base_price_cents, status)
- `stocks` (product_id pk, quantity_on_hand, quantity_reserved)
- `orders` (id, customer_id → customers, status, total_cents, idempotency_key,
  unique(customer_id, idempotency_key), created_by → users, created_at, updated_at)
- `order_items` (id, order_id → orders, product_id → products, quantity, unit_price_cents, subtotal_cents)
- `stock_reservations` (id, order_id → orders, product_id → products, quantity, status, created_at)
- `users` (id, email unique, password_hash, role, customer_id → customers nullable)

### Índices mínimos

- `orders (customer_id, status)` — cálculo de exposição e listagem por cliente.
- `orders (customer_id, idempotency_key)` — idempotência (constraint única).
- `order_items (order_id)`, `stock_reservations (order_id)`.
- `price_table_items (price_table_id, product_id)` — resolução de preço.
- `products (sku)` e `customers (cnpj)` — únicos.

> O schema Prisma real é escrito na Fase 1; este documento é o contrato que ele deve cumprir.
> Dinheiro é armazenado em **centavos (inteiro)**, nunca em ponto flutuante.

## Seed de dados realistas (Fase 1)

- 1 admin + 3 clientes (um com cliente-usuário), cada cliente com sua `PriceTable` (preços
  diferentes para os mesmos produtos).
- ~20 produtos com SKU, unidade e preço de tabela.
- Estoque variado, incluindo um produto com estoque baixo (para forçar conflito nos testes).
- Tabela de preço com vigência para exercitar o log de resolução de preço.
