# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
# Prisma's postinstall requires configuration that is only available after the
# source tree is copied. Generate the client explicitly in the builder stage.
RUN npm ci --ignore-scripts

FROM dependencies AS builder
COPY . .
# Prisma generation reads DIRECT_URL from prisma.config.ts but does not connect
# to this placeholder database during client generation.
RUN DIRECT_URL=postgresql://build:build@localhost:5432/build npm run prisma:generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
