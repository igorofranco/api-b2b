<!--
docs/backlog.md — ordem de execução: como cada fase vira blocos de 2h/dia.
Não duplica os checklists de ../PLANO.md; organiza a sequência e as dependências.
Texto em pt-BR.
-->

# Backlog e ordem de execução

O `PLANO.md` diz **o que** construir em cada fase. Este documento diz **em que ordem** e **em quantos
blocos de 2h** (bloco 1 do dia), para não haver dúvida ao abrir o bloco de projeto.

## Como usar

1. Abra a fase atual no `PLANO.md`.
2. Pegue o próximo item aberto respeitando as **dependências** abaixo.
3. O bloco só fecha com **artefato** (commit/PR). Se não fechar, o item continua aberto.

## Regras de sequenciamento

- **Domain antes de infra:** primeiro as entidades/invariantes, depois a persistência. Nunca o contrário.
- **Casos de uso antes da borda:** REST/GraphQL só depois do caso de uso existir (reuso, não duplicação).
- **Estoque e idempotência depois de auth:** os fluxos críticos dependem de usuário autenticado.
- **Nada de "regra de negócio" na Fase 0:** se aparecer regra durante a fundação, ela espera.

## Fase 0 — Fundação (recomendada em 2 blocos)

| Bloco | Entrega                                                                                                   | Depende de |
| ----- | --------------------------------------------------------------------------------------------------------- | ---------- |
| 0.1   | `git init` + `.gitignore` + scaffold NestJS + `tsconfig` strict + `main.ts`/`AppModule` + `/health`       | —          |
| 0.2   | oxlint `--type-aware` + Prettier + Vitest (unit/e2e) + `Dockerfile`/`docker-compose.yml` + `.env.example` | 0.1        |
| 0.3   | GitHub Actions (lint + typecheck + test + build) + README com badge + repo público                        | 0.2        |

## Fase 1 — Domínio e camadas (4–5 blocos)

| Bloco | Entrega                                                                         | Depende de |
| ----- | ------------------------------------------------------------------------------- | ---------- |
| 1.1   | Value objects (`Money`, `Sku`, `Quantity`, `Cnpj`) + erros de domínio           | Fase 0     |
| 1.2   | Entidades e invariantes (`Customer`, `Product`, `PriceTable`, `Order`, `Stock`) | 1.1        |
| 1.3   | Portas (interfaces de repositório) + casos de uso + fakes in-memory             | 1.2        |
| 1.4   | Schema Prisma + migration + mapeadores + repositórios concretos                 | 1.3        |
| 1.5   | Seed realista + testes unitários dos casos de uso (sem banco) + PR              | 1.4        |

## Fase 2 — Auth e REST base (4–5 blocos)

| Bloco | Entrega                                                                     | Depende de |
| ----- | --------------------------------------------------------------------------- | ---------- |
| 2.1   | `User` + hash + login JWT + `JwtAuthGuard`                                  | Fase 1     |
| 2.2   | RBAC (`@Roles` + `RolesGuard`) + `ValidationPipe` + `DomainExceptionFilter` | 2.1        |
| 2.3   | REST de clientes (CRUD + status + paginação)                                | 2.2        |
| 2.4   | REST de produtos + tabelas de preço                                         | 2.3        |
| 2.5   | Swagger + e2e (login, 401, 403, validação) + PR                             | 2.4        |

## Fase 3 — GraphQL (5–6 blocos)

| Bloco | Entrega                                                  | Depende de |
| ----- | -------------------------------------------------------- | ---------- |
| 3.1   | Apollo + schema code-first (tipos e queries de catálogo) | Fase 2     |
| 3.2   | Resolvers sobre os casos de uso + contexto de auth       | 3.1        |
| 3.3   | Filtro, paginação (conexão) e ordenação                  | 3.2        |
| 3.4   | DataLoaders (preço, cliente, itens)                      | 3.3        |
| 3.5   | Teste de N+1 (contador de queries) + sandbox + PR        | 3.4        |

## Fase 4 — Pedidos e Redis (4–5 blocos)

| Bloco | Entrega                                                           | Depende de |
| ----- | ----------------------------------------------------------------- | ---------- |
| 4.1   | Caso de uso de criação de pedido + resolução de preço + snapshot  | Fase 3     |
| 4.2   | Limite de crédito + máquina de estados (confirmar vs. aprovar)    | 4.1        |
| 4.3   | Reserva de estoque transacional + aprovação/rejeição/cancelamento | 4.2        |
| 4.4   | Idempotência (Redis + unique) + cache de catálogo com invalidação | 4.3        |
| 4.5   | REST de pedidos + testes de concorrência e idempotência + PR      | 4.4        |

## Fase 5 — Testes e cobertura (3–4 blocos)

| Bloco | Entrega                                                             | Depende de |
| ----- | ------------------------------------------------------------------- | ---------- |
| 5.1   | Revisão dos unitários dos casos de uso + cenários de borda          | Fase 4     |
| 5.2   | e2e dos fluxos críticos (pedido, aprovação, estoque, auth, GraphQL) | 5.1        |
| 5.3   | Thresholds no Vitest/CI + cobertura no README + PR                  | 5.2        |

## Fase 6 — Deploy e doc (3–4 blocos)

| Bloco | Entrega                                                     | Depende de |
| ----- | ----------------------------------------------------------- | ---------- |
| 6.1   | `Dockerfile` de produção + deploy na VPS (Docker + systemd) | Fase 5     |
| 6.2   | Health checks + logs estruturados + migrations no deploy    | 6.1        |
| 6.3   | Deploy automatizado no Actions + URL pública                | 6.2        |
| 6.4   | README final (impacto > stack) + registro no carreira + PR  | 6.3        |

## Próximo passo imediato

Abrir o bloco **0.1**: `git init`, `.gitignore`, scaffold NestJS e `/health`. Ver `PLANO.md`,
Fase 0.
