# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder — instala deps y compila TypeScript
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifests primero (aprovecha caché de Docker)
COPY package*.json ./
COPY tsconfig.json ./

# Instalar TODAS las deps (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente y compilar
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production — imagen final liviana (sin devDeps ni fuentes .ts)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Solo deps de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar solo el output compilado del stage anterior
COPY --from=builder /app/dist ./dist

# Cambiar dueño de los archivos al usuario no-root
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Healthcheck interno (útil para Docker y para el step de CI/CD)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]