FROM oven/bun:1

WORKDIR /app

COPY package.json ./
RUN bun install

COPY tsconfig.json ./
COPY config ./config
COPY src ./src

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "dev"]
