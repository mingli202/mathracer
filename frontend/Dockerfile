FROM oven/bun:1

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
