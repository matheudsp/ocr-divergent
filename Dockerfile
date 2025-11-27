# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências de sistema necessárias para buildar módulos nativos (se houver)
RUN apk add --no-cache openssl

COPY package.json ./

# Instala TODAS as dependências (incluindo devDependencies para o build)
RUN npm install

COPY . .

# Variável dummy para o Prisma Generate funcionar no build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy_db"

# Gera o cliente do Prisma
RUN npx prisma generate

# Builda o projeto (TypeScript -> JS)
RUN npm run build

# --- O PULO DO GATO (Prune) ---
# Remove as devDependencies (types, tsx, vitest, etc), deixando apenas o necessário para produção.
RUN npm prune --production

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas dependências de sistema necessárias para execução (Openssl para o Prisma)
RUN apk add --no-cache openssl

# Copia o package.json (útil para alguns frameworks checarem versão)
COPY --from=builder /app/package.json ./package.json

# Copia os módulos já limpos do builder (Sem npm install aqui! \o/)
COPY --from=builder /app/node_modules ./node_modules

# Copia o código compilado
COPY --from=builder /app/dist ./dist

# Copia o cliente Prisma gerado (importante pois você configurou output customizado no schema)
COPY --from=builder /app/src/infra/config/prisma/generated ./src/infra/config/prisma/generated
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main.js"]