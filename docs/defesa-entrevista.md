<!--
docs/defesa-entrevista.md — roteiro para explicar o projeto em voz alta.
Critério de pronto do projeto: "decisões explicáveis em voz alta sem consultar o código".
Texto em pt-BR. Primeira pessoa. Referências: decisoes.md, arquitetura.md, dominio.md, contratos-api.md.
-->

# Defesa do projeto (roteiro para entrevista)

Respostas curtas para as perguntas que o projeto foi desenhado a provocar. Ensaie **falando**, não
lendo. Cada resposta aponta para o documento/arquivo que a sustenta.

## 1. "Me conta o que é esse projeto."

É uma API B2B de catálogo e pedidos. Cada cliente compra pelo preço do próprio contrato, monta pedidos
que só confirmam dentro do limite de crédito (acima disso entram em aprovação) e o estoque é reservado
na confirmação para não vender o que não existe. O mesmo domínio é exposto em REST e GraphQL sobre os
mesmos casos de uso.

**Por que o domínio foi escolhido:** CRUD puro não demonstra arquitetura. Preço por contrato, limite de
crédito e concorrência de estoque dão regra de negócio real para discutir. (`AGENTS.md`)

## 2. "Por que NestJS e não Express?"

Express puro prova menos do que as vagas pedem: eu queria demonstrar módulos, injeção de dependência,
guards, pipes, interceptors e exception filters, que é o vocabulário de backend Node sênior. O
domínio fica fora do framework, então a escolha do NestJS não contamina a regra de negócio. (ADR nº 1)

## 3. "Como está organizado o código?"

Quatro camadas com dependência apontando para dentro: `domain`, `application`, `infra` e
`presentation`. O `domain` não importa NestJS nem Prisma: só entidades, value objects, invariantes e
interfaces de repositório. A `application` tem os casos de uso, que dependem das **portas**; a `infra`
implementa essas portas com Prisma e Redis; a `presentation` só chama caso de uso. (`arquitetura.md`,
ADR nº 2)

**Como provo:** os testes de caso de uso rodam com repositórios em memória, sem banco.

## 4. "Onde fica a regra de negócio?"

No domínio e nos casos de uso, nunca no controller/resolver. O controller e o resolver são finos:
validam a entrada, chamam o caso de uso e traduzem o resultado. A regra de crédito, preço e estoque
vive no caso de uso com o domínio. (`arquitetura.md`, `dominio.md`)

## 5. "Por que REST e GraphQL ao mesmo tempo?"

As operações administrativas e de escrita ficam no REST, onde verbo e status HTTP deixam a intenção
explícita. A consulta flexível de catálogo e pedidos fica no GraphQL, onde o cliente escolhe os
campos e evita over-fetching. As duas bordas chamam os mesmos casos de uso, então não há regra
duplicada. (ADR nº 4, `contratos-api.md`)

## 6. "Como você resolve N+1 no GraphQL?"

Com DataLoader por requisição. Toda consulta que atravessa produto → preço → cliente ou pedido →
itens → produto passa por um loader que agrupa as chaves e faz uma query em lote. A prova é um teste
que conta as queries: o número não cresce com a quantidade de itens da resposta. (ADR nº 5,
`contratos-api.md`)

## 7. "E a concorrência no estoque?"

A reserva roda em transação com lock da linha de estoque e só efetiva se `em mãos − reservado >=
quantidade`. Duas requisições simultâneas não podem reservar a mesma peça. O teste é e2e, com
criações concorrentes contra o Postgres real, e verifica que o estoque nunca fica negativo. (ADR nº 8)

## 8. "Como garante que um retry não duplica o pedido?"

Com uma chave de idempotência no header. A chave é deduplicada no Redis (lock curto + resposta
guardada com TTL) e protegida por uma unique constraint `(customerId, idempotencyKey)` no banco, para
valer entre réplicas. Retry com o mesmo payload devolve o mesmo pedido; payload divergente devolve
409. (ADR nº 9)

## 9. "Como você testa?"

Testes unitários por camada: domínio testa invariantes e a máquina de estados; casos de uso testam com
repositórios em memória, sem banco. e2e com supertest cobre os fluxos HTTP (auth, validação, erros de
status) e o GraphQL. Os fluxos que dependem de concorrência e idempotência rodam e2e com Postgres e
Redis reais, porque só o banco prova a proteção. A cobertura tem threshold no CI. (`arquitetura.md`,
Fase 5)

## 10. "O que você faria diferente ou escalaria depois?"

Evolução natural: cache com métricas de hit/miss, tracing com OpenTelemetry, filas (BullMQ) para
eventos de pedido, refresh token, e separar catálogo e pedidos em serviços se o volume exigir. Não
entram no escopo porque o projeto é uma prova e o funil tem precedência, mas sei onde encaixariam.
(ADR nº 6, `PLANO.md`)

## Checklist de ensaio

- [ ] Sei contar o produto em 30 segundos, **impacto antes de stack**.
- [ ] Sei desenhar as quatro camadas e a regra de dependência de cabeça.
- [ ] Sei explicar preço por contrato, crédito e reserva sem olhar o código.
- [ ] Sei defender por que a reserva é na confirmação e não na criação.
- [ ] Sei explicar DataLoader e como o teste prova a ausência de N+1.
- [ ] Sei explicar idempotência (Redis + unique) e a diferença de payload divergente.
- [ ] Sei dizer o que ficou fora do escopo e por quê.
