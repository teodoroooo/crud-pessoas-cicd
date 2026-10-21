# Etapa 1: instala somente as dependências de produção
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Etapa 2: imagem final enxuta
FROM node:24-alpine
LABEL org.opencontainers.image.source="https://github.com/teodoroooo/crud-pessoas-cicd" \
      org.opencontainers.image.description="CRUD de pessoas (CPF, nome, data de nascimento e idade)"
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]
