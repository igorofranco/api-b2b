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
docker compose up --build
# API em http://localhost:3000/health
```

### Local (sem Docker)

```bash
cp .env.example .env
npm install
npm run start:dev
```

> Postgres e Redis entram no `docker compose` junto com suas fases (ver `PLANO.md`).

| Ação       | Comando                 |
| ---------- | ----------------------- |
| Dev        | `npm run start:dev`     |
| Build      | `npm run build`         |
| Typecheck  | `npm run typecheck`     |
| Lint       | `npm run lint`          |
| Formatar   | `npm run format`        |
| Testes     | `npm run test`          |
| Testes e2e | `npm run test:e2e`      |
| Cobertura  | `npm run test:coverage` |

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
