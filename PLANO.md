<!--
PLANO.md — plano de construção e progresso do api-b2b.
Espelha o plano de origem (../carreira/projetos-portfolio/01-api-b2b/plano.md) e o detalha.
Marque os itens com [x] ao concluir cada um. Texto em pt-BR.
-->

# Plano e progresso — api-b2b

> API B2B de catálogo e pedidos: preço por contrato, aprovação por limite de crédito e reserva de
> estoque na confirmação, exposta em **REST e GraphQL sobre o mesmo domínio**.
> Objetivo: provar Node/NestJS + GraphQL + Prisma + Postgres + Redis + Jest + Docker + CI/CD, com
> regra de negócio real e decisões **explicáveis em voz alta**.
>
> **Fonte da verdade de método e status:** `../carreira/projetos-portfolio/01-api-b2b/plano.md`.
> Este arquivo é a cópia executável, com o detalhamento por tarefa.

Atualizado em 2026-10-01.

## Regras do projeto

- **Escopo fechado por fase.** Nada de "explorar" ou "aprofundar": ou tem entrega verificável, ou não é fase.
- **Artefato ao fim de cada fase** (commit, PR, README, demo). Fase sem artefato não fecha.
- **Material sob demanda.** Se travar num conceito, consulte a bibliografia da fase
  (`../carreira/perfil/recursos-estudo.md`) e volte a implementar.
- **Sem quebrar o funil.** O bloco de projeto é 2h/dia; o funil da busca ativa tem precedência.
- **Teto de 2h/dia (bloco 1).** Se uma fase não caiba na estimativa, divida em duas; não estenda a fase.

## Visão do produto

O catálogo tem preços que variam por cliente conforme contrato; o cliente monta pedidos que só são
confirmados dentro do próprio limite de crédito (acima disso, exigem aprovação); o estoque é
reservado na confirmação para não vender o que não existe. O sistema expõe **REST e GraphQL sobre o
mesmo domínio**: REST para operações administrativas (escrita), GraphQL para consulta flexível do
catálogo e dos pedidos (leitura), com DataLoader contra N+1.

Detalhamento: domínio em `docs/dominio.md`, contratos em `docs/contratos-api.md`, camadas em
`docs/arquitetura.md`.

## Progresso das fases

| Fase | Nome | Status | Artefato |
|---|---|---|---|
| 0 | Fundação | não iniciada | repo público + CI verde |
| 1 | Domínio e camadas | não iniciada | PR domínio + persistência testados |
| 2 | Auth e REST base | não iniciada | PR auth + REST com e2e |
| 3 | GraphQL | não iniciada | PR schema + DataLoader + teste de N+1 |
| 4 | Pedidos e Redis | não iniciada | PR fluxo de pedidos + concorrência/idempotência |
| 5 | Testes e cobertura | não iniciada | PR consolidação + cobertura no README |
| 6 | Deploy e doc | não iniciada | demo no ar + README |

---

## Fase 0 — Fundação

- **Escopo:** repositório, projeto NestJS, padrões de qualidade, ambiente de dev e CI rodando.
  **Fora:** qualquer regra de negócio.
- **Tecnologias a implementar:** NestJS, TypeScript strict, ESLint + Prettier, Jest, Docker Compose,
  GitHub Actions.
- **Critério de pronto:** `docker compose up` sobe a API; `npm run lint/typecheck/test/build` passam;
  CI verde no GitHub em push e PR.
- **Artefato:** repositório público + workflow verde (badge no README).
- **Estimativa:** 3–4 dias.

Tarefas:

- [ ] `git init`, `.gitignore`, `.node-version`, `opencode.jsonc` e estrutura de pastas
- [ ] Projeto NestJS criado; `main.ts` e `AppModule`
- [ ] `tsconfig.json` em modo strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- [ ] ESLint (flat) + Prettier configurados (`lint`, `format`, `format:check`)
- [ ] Jest configurado (unit + e2e) com script de cobertura
- [ ] `.env.example` com as variáveis de ambiente (sem segredos reais)
- [ ] `Dockerfile` de dev e `docker-compose.yml` com a API (Postgres e Redis entram na Fase 1/4)
- [ ] Endpoint de health (`/health`) respondendo
- [ ] GitHub Actions: `lint + typecheck + test + build` em push e PR
- [ ] README inicial (o que é, como rodar) e badge do CI
- [ ] Repositório público no GitHub e CI verde no primeiro push

*Consulta sob demanda:* NestJS fundamentos, TS strict, Jest setup, Docker Compose, GitHub Actions —
`../carreira/perfil/recursos-estudo.md`, Fase 0.

---

## Fase 1 — Domínio e camadas

- **Escopo:** modelo de domínio e persistência, com as camadas separadas. **Fora:** autenticação e
  API externa.
- **Tecnologias a implementar:** Clean Architecture (domain / application / infra), entidades, casos
  de uso, repositórios (interfaces + implementação), Prisma, PostgreSQL, migrations e seed.
- **Critério de pronto:** migrations e seed rodam; testes unitários dos casos de uso passam sem tocar
  o banco; troca de implementação de repositório não altera o domínio.
- **Artefato:** PR com domínio + persistência cobertos por testes.
- **Estimativa:** 4–5 dias.

Tarefas:

- [ ] Entidades e value objects do domínio (cliente, produto, tabela de preço, pedido, item, estoque)
- [ ] Invariantes de negócio no domínio (preço resolvido, disponibilidade, transição de status)
- [ ] Interfaces de repositório no domínio (portas)
- [ ] Casos de uso da Fase 1 com regra isolada da infra
- [ ] Schema Prisma + relations + índices; primeira migration
- [ ] Implementação Prisma dos repositórios + mapeadores (domínio ↔ persistência)
- [ ] Seed de dados realistas (clientes, produtos, tabelas de preço, estoque)
- [ ] Testes unitários dos casos de uso com repositórios em memória (sem banco)
- [ ] Fakes/in-memory repositories reutilizáveis nos testes

*Consulta sob demanda:* Clean Architecture, Prisma + NestJS, modelagem/indexação Postgres —
`../carreira/perfil/recursos-estudo.md`, Fase 1.

---

## Fase 2 — Auth e REST base

- **Escopo:** autenticação, autorização e endpoints REST de clientes e produtos. **Fora:** GraphQL e
  pedidos.
- **Tecnologias a implementar:** JWT, RBAC com guards, class-validator/class-transformer, REST
  versionado, tratamento de erro consistente.
- **Critério de pronto:** rotas protegidas retornam 401/403 corretos; validação rejeita payload
  inválido; e2e cobrindo o fluxo de login e um recurso protegido.
- **Artefato:** PR com auth + REST base, testes e2e passando.
- **Estimativa:** 4–5 dias.

Tarefas:

- [ ] Entidade `User` + persistência; hash de senha (bcrypt/argon2)
- [ ] Login com JWT (access token) e guard de autenticação
- [ ] RBAC: papéis `admin` / `cliente` com guards e decorator `@Roles`
- [ ] DTOs validados (class-validator) e `ValidationPipe` global
- [ ] Exception filter padronizando o envelope de erro (ver `docs/contratos-api.md`)
- [ ] REST de clientes: listar (paginação/filtro), detalhar, criar, atualizar, ativar/inativar
- [ ] REST de produtos: listar (paginação/filtro), detalhar, criar, atualizar, ativar/inativar
- [ ] REST de tabelas de preço (vínculo cliente ↔ preços)
- [ ] Documentação da API (Swagger/OpenAPI) exposta em `/docs`
- [ ] Testes e2e (supertest): login, 401 sem token, 403 de papel, validação de payload

*Consulta sob demanda:* NestJS auth/RBAC e validação — `../carreira/perfil/recursos-estudo.md`, Fase 2.

---

## Fase 3 — GraphQL

- **Escopo:** expor o mesmo domínio em GraphQL, com consulta eficiente. **Fora:** pedidos (Fase 4).
- **Tecnologias a implementar:** GraphQL code-first (NestJS), resolvers, DataLoader contra N+1,
  filtros, paginação e ordenação.
- **Critério de pronto:** consulta que atravessa produto → tabela de preço → cliente resolve sem N+1
  (comprovado por log/contador de queries); testes cobrindo os resolvers.
- **Artefato:** PR com schema GraphQL funcional + playground e teste de N+1.
- **Estimativa:** 5–6 dias.

Tarefas:

- [ ] Schema code-first: tipos, queries e mutations espelhando o REST
- [ ] Resolvers sobre os casos de uso existentes (reuso, não duplicação)
- [ ] DataLoaders: preço por cliente, cliente por pedido, itens por pedido
- [ ] Filtros, paginação e ordenação na consulta de catálogo
- [ ] Contexto de autenticação/autorização nos resolvers (mesmo RBAC do REST)
- [ ] Testes dos resolvers + teste que comprova ausência de N+1 (contador de queries)
- [ ] Playground/Apollo Sandbox habilitado em dev com exemplos no README

*Consulta sob demanda:* GraphQL code-first, Apollo, DataLoader — `../carreira/perfil/recursos-estudo.md`, Fase 3.

---

## Fase 4 — Pedidos e Redis

- **Escopo:** o fluxo comercial completo e o uso de Redis. **Fora:** deploy.
- **Tecnologias a implementar:** criação de pedido, aprovação por limite de crédito, reserva de
  estoque, Redis (cache + idempotência), filas se necessário.
- **Critério de pronto:** pedido acima do limite entra em aprovação; estoque não fica negativo sob
  criação concorrente; requisição repetida com a mesma chave de idempotência não duplica pedido
  (testado).
- **Artefato:** PR com fluxo de pedidos + testes de concorrência e idempotência.
- **Estimativa:** 4–5 dias.

Tarefas:

- [ ] Criação de pedido com itens, preço vigente por cliente e validação
- [ ] Limite de crédito: confirmação direta vs. fluxo de aprovação (máquina de estados)
- [ ] Aprovação/rejeição por admin com registro de quem/quando
- [ ] Reserva de estoque com proteção contra concorrência (transação + locking)
- [ ] Liberação/consumo da reserva ao cancelar/confirmar
- [ ] Chave de idempotência na criação de pedido (Redis + unique constraint)
- [ ] Cache de catálogo com invalidação (chaves/TTL por domínio)
- [ ] Testes de concorrência (criações simultâneas) e de idempotência (retry)
- [ ] REST de pedidos: criar, listar, detalhar, aprovar, rejeitar, cancelar

*Consulta sob demanda:* Redis, BullMQ, idempotência — `../carreira/perfil/recursos-estudo.md`, Fase 4.

---

## Fase 5 — Testes e cobertura

- **Escopo:** consolidar a suíte e medir cobertura dos fluxos críticos. **Fora:** código novo de produto.
- **Tecnologias a implementar:** Jest (unit + e2e), supertest, cobertura com thresholds no CI.
- **Critério de pronto:** CI falha se a cobertura cair abaixo do limite; fluxos críticos (pedido,
  aprovação, estoque, auth) cobertos.
- **Artefato:** PR de consolidação de testes + cobertura publicada no README.
- **Estimativa:** 3–4 dias.

Tarefas:

- [ ] Revisar e completar testes unitários dos casos de uso
- [ ] e2e dos fluxos críticos: pedido, aprovação, estoque, auth, GraphQL
- [ ] Cenários de borda: limite de crédito exato, estoque no limite, payload inválido, sem permissão
- [ ] Thresholds de cobertura no Jest e no CI
- [ ] Cobertura reportada no README (badge ou tabela)

*Consulta sob demanda:* Jest, e2e com supertest, thresholds — `../carreira/perfil/recursos-estudo.md`, Fase 5.

---

## Fase 6 — Deploy, observabilidade e documentação

- **Escopo:** colocar no ar, torná-lo observável e documentá-lo para quem lê o portfólio. **Fora:** features novas.
- **Tecnologias a implementar:** deploy em VPS (Docker + systemd, como no Larear), logs estruturados,
  health checks (`@nestjs/terminus`), deploy automatizado no workflow, README (impacto antes de stack).
- **Critério de pronto:** API acessível por URL; health check responde; um push na main dispara
  deploy; README explica o produto antes das tecnologias.
- **Artefato:** demo no ar + README publicado.
- **Estimativa:** 3–4 dias.

Tarefas:

- [ ] `Dockerfile` de produção (multi-stage) e imagem enxuta
- [ ] Deploy na VPS com Docker + systemd (referência: Larear)
- [ ] Postgres e Redis gerenciados/servidos na VPS + migrations aplicadas no deploy
- [ ] Health checks (`@nestjs/terminus`: db, redis) e logs estruturados (JSON com nível/contexto)
- [ ] Deploy automatizado no GitHub Actions ao dar merge na main
- [ ] URL pública + link no README e no perfil de portfólio
- [ ] README final: impacto do produto, domínio, decisões de arquitetura, como rodar, link da demo
- [ ] Registrar o projeto em `../carreira/perfil/habilidades.md` e no índice de portfólio

*Consulta sob demanda:* deploy, observabilidade, README — `../carreira/perfil/recursos-estudo.md`, Fase 6.

---

## Critério de pronto do projeto (definition of done)

- [ ] API no ar e acessível (ou execução reprodutível documentada)
- [ ] CI verde (lint + typecheck + test + build) e deploy automatizado
- [ ] Cobertura medida e suficiente nos fluxos críticos (pedido, aprovação, estoque, auth)
- [ ] README com impacto antes de stack
- [ ] REST e GraphQL funcionando sobre o mesmo domínio
- [ ] Decisões explicáveis em voz alta sem consultar o código (Clean Architecture, DataLoader, idempotência)
- [ ] Registrado em `../carreira/perfil/habilidades.md` (evidência) e no índice de portfólio

## Estimativa

A 2h/dia (bloco 1), o projeto fecha em **4 a 5 semanas** (~18–22 dias úteis):

| Fase | Estimativa |
|---|---|
| 0 — Fundação | 3–4 dias |
| 1 — Domínio e camadas | 4–5 dias |
| 2 — Auth e REST base | 4–5 dias |
| 3 — GraphQL | 5–6 dias |
| 4 — Pedidos e Redis | 4–5 dias |
| 5 — Testes e cobertura | 3–4 dias |
| 6 — Deploy e doc | 3–4 dias |

> Estimativas de referência, não compromisso: o funil tem precedência e pode empurrar a fase. Se
> atrasar, ajuste aqui em vez de cortar o funil.

## Referências

- Plano de origem (fonte da verdade): `../carreira/projetos-portfolio/01-api-b2b/plano.md`
- Índice de portfólio: `../carreira/projetos-portfolio/README.md`
- Rotina do dia: `../carreira/planejamento/cronograma.md`
- Método: `../carreira/planejamento/filosofia-busca.md`
- Bibliografia de apoio: `../carreira/perfil/recursos-estudo.md`
- Habilidades e evidências: `../carreira/perfil/habilidades.md`
- Documentos deste repo: `docs/arquitetura.md`, `docs/dominio.md`, `docs/contratos-api.md`,
  `docs/decisoes.md`, `docs/backlog.md`, `docs/defesa-entrevista.md`
