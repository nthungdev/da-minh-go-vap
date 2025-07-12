
FROM node:22-slim AS base

# Install dependencies
FROM base AS deps

WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm
RUN pnpm i --frozen-lockfile


FROM base AS builder

WORKDIR /app
COPY . .

COPY --from=deps /app/node_modules ./node_modules

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm
RUN pnpm run build:compile


FROM base AS runner

WORKDIR /app
COPY . .

ENV NODE_ENV=production

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN corepack enable pnpm
# RUN pnpm install

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "pnpm run payload migrate && pnpm run build:generate && node server.js"]
