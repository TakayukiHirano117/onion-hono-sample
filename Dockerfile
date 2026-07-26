# Production image for ECS Fargate (linux/amd64).
# Local hot-reload continues to use `bun run dev`.

FROM oven/bun:1.2 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.2 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    NODE_CONFIG_ENV=production

RUN groupadd --system --gid 1001 app \
  && useradd --system --uid 1001 --gid app app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json ./
COPY config ./config
COPY src ./src

USER app
EXPOSE 3000

CMD ["bun", "run", "src/cmd/bun.ts"]
