# ─────────────────────────────────────────────────
# Stage 1: Base — dependencias comunes
# ─────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++   # para compilar módulos nativos (pg, etc.)
COPY package*.json ./

# ─────────────────────────────────────────────────
# Stage 2: Development — hot-reload con ts-node
# ─────────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ─────────────────────────────────────────────────
# Stage 3: Builder — compila TypeScript
# ─────────────────────────────────────────────────
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci --only=production
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────
# Stage 4: Production — imagen final mínima
# ─────────────────────────────────────────────────
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copia solo lo necesario para producción
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health/liveness || exit 1

CMD ["node", "dist/main"]
