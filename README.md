<!--
README.md — porta de entrada do repositório.
Escreva IMPACTO antes de STACK (regra 17 do AGENTS.md do repositório de carreira).
Status e fases em PLANO.md; convenções de trabalho em AGENTS.md.
-->

# api-b2b

[![CI](https://github.com/igorofranco/api-b2b/actions/workflows/ci.yml/badge.svg)](https://github.com/igorofranco/api-b2b/actions/workflows/ci.yml)

API de gestão comercial **B2B**: cada cliente compra pelo **preço do próprio contrato**, monta
pedidos que só são confirmados **dentro do próprio limite de crédito** (acima disso entram em
aprovação) e têm **estoque reservado na confirmação** para não vender o que não existe.

O catálogo, os clientes e os pedidos são expostos em **REST e GraphQL sobre o mesmo domínio**:
REST para as operações administrativas (escrita), GraphQL para a consulta flexível do catálogo e
dos pedidos (leitura), resolvendo o clássico problema de preço por cliente sem inflar a resposta com
N+1.

## Por que ele existe

Peça de portfólio que fecha, com código em produção, os gaps de maior frequência nas vagas alvo:
**Node.js, CI/CD e GraphQL**, além de NestJS, Clean Architecture/SOLID, Prisma e testes
unitários/e2e. O domínio (preço por contrato, limite de crédito, reserva de estoque, idempotência)
existe para haver **regra de negócio real** a demonstrar, e não um CRUD.

## Stack

- **Runtime:** Node.js (LTS atual) + TypeScript em modo strict
- **Framework:** NestJS (módulos, DI, guards, pipes, interceptors)
- **Persistência:** PostgreSQL + Prisma (migrations e seed)
- **APIs:** REST versionado + GraphQL code-first (Apollo) com DataLoader
- **Cache / idempotência:** Redis
- **Testes:** Vitest (unit + e2e) + supertest, cobertura no CI
- **Infra:** Docker Compose (dev) e Docker + systemd na VPS (produção), GitHub Actions

## Como rodar

### Com Docker (recomendado)

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec api npm run prisma:deploy
docker compose exec api npm run prisma:seed
# API em http://localhost:3000/health
```

O `docker compose` sobe a API, o PostgreSQL e o Redis. O `DATABASE_URL` do `.env` aponta para
`localhost:5433` (porta do Postgres exposta para rodar migrations/seed da máquina local); dentro da
rede do Compose a API fala com `postgres:5432`.

### Local (sem Docker)

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

> `npm install` gera o client do Prisma automaticamente (`postinstall`).

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

## Autenticação e REST

A Fase 2 entrega login com JWT, autorização por papel (`admin`/`cliente`) e os endpoints REST de
clientes, produtos e tabelas de preço (paginados). Toda rota, exceto login e `/health`, exige o
header `Authorization: Bearer <jwt>`. A documentação interativa fica em
[http://localhost:3000/docs](http://localhost:3000/docs).

O seed cria dois usuários para desenvolvimento:

| Papel     | E-mail                    | Senha        |
| --------- | ------------------------- | ------------ |
| `admin`   | `admin@api-b2b.dev`       | `admin123`   |
| `cliente` | `compras@metalurgica.dev` | `cliente123` |

```bash
# Login e uso do token
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@api-b2b.dev","password":"admin123"}'

curl -s http://localhost:3000/api/v1/customers?page=1&limit=20 \
  -H "Authorization: Bearer <accessToken>"
```

## Documentação

- **Plano de construção e progresso:** [`PLANO.md`](PLANO.md)
- **Como trabalhar no repo:** [`AGENTS.md`](AGENTS.md)
- **Arquitetura e camadas:** [`docs/arquitetura.md`](docs/arquitetura.md)
- **Domínio e modelo de dados:** [`docs/dominio.md`](docs/dominio.md)
- **Contratos REST e GraphQL:** [`docs/contratos-api.md`](docs/contratos-api.md)
- **Decisões de arquitetura (ADRs):** [`docs/decisoes.md`](docs/decisoes.md)
- **Backlog por fase:** [`docs/backlog.md`](docs/backlog.md)
- **Roteiro de defesa do projeto:** [`docs/defesa-entrevista.md`](docs/defesa-entrevista.md)

## Demo

TBD (URL pública na Fase 6).

## Origem do projeto

Plano de origem (fonte da verdade de método e status) no repositório de carreira:
`../carreira/projetos-portfolio/01-api-b2b/plano.md`.
