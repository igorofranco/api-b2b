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
**Node.js, CI/CD, GraphQL, Jest**, além de NestJS, Clean Architecture/SOLID e Prisma. O domínio
(preço por contrato, limite de crédito, reserva de estoque, idempotência) existe para haver
**regra de negócio real** a demonstrar, e não um CRUD.

## Stack

- **Runtime:** Node.js (LTS atual) + TypeScript em modo strict
- **Framework:** NestJS (módulos, DI, guards, pipes, interceptors)
- **Persistência:** PostgreSQL + Prisma (migrations e seed)
- **APIs:** REST versionado + GraphQL code-first (Apollo) com DataLoader
- **Cache / idempotência:** Redis
- **Testes:** Jest (unit) + supertest (e2e), cobertura no CI
- **Infra:** Docker Compose (dev) e Docker + systemd na VPS (produção), GitHub Actions

## Como rodar

> Ainda não há código: o projeto está na **Fase 0 (Fundação)**. Este README será completado com os
> comandos reais quando a fundação estiver de pé (ver `PLANO.md`).

```bash
# previsto
cp .env.example .env
docker compose up -d      # API + Postgres + Redis
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

| Ação        | Comando                 |
| ----------- | ----------------------- |
| Dev         | `npm run start:dev`     |
| Build       | `npm run build`         |
| Typecheck   | `npm run typecheck`     |
| Lint        | `npm run lint`          |
| Formatar    | `npm run format`        |
| Testes      | `npm run test`          |
| Testes e2e  | `npm run test:e2e`      |
| Cobertura   | `npm run test:coverage` |

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
