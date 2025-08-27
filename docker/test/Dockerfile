
FROM node:22-slim AS base


FROM base AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./

RUN corepack enable pnpm
RUN pnpm i --frozen-lockfile


FROM base AS builder

WORKDIR /app
COPY . .
COPY .env.test .env.production
COPY --from=deps /app/node_modules ./node_modules

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm
RUN pnpm run build:compile


FROM base AS runner

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

RUN corepack enable pnpm

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
