# syntax=docker/dockerfile:1

# Imagem de desenvolvimento: usada pelo `docker compose up` para subir a API com
# hot reload. A imagem de produção (multi-stage) entra na Fase 6.
FROM node:24-alpine AS development

ENV NODE_ENV=development
WORKDIR /app

# O `postinstall` roda `prisma generate`, então o schema precisa existir antes do `npm ci`.
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
