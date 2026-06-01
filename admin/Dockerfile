FROM node:22-bookworm-slim AS base

# Stage 1: install ALL deps (dev + prod) for build
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN rm -f package-lock.json && npm install --include=optional --no-audit --no-fund

# Stage 2: build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: prod-only deps
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN rm -f package-lock.json && npm install --omit=dev --include=optional --no-audit --no-fund && npm cache clean --force

# Stage 4: runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/data

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /data && chown -R nextjs:nodejs /data

# Production node_modules
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Built Next app
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate-prod.mjs && npx next start"]
