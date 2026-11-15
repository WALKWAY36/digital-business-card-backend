FROM node:24-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*


FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci


FROM dependencies AS build

COPY . .

RUN POSTGRES_HOST=127.0.0.1 \
    POSTGRES_PORT=5432 \
    POSTGRES_DB=build \
    POSTGRES_USER=build \
    POSTGRES_PASSWORD=build \
    npm run prisma:generate

RUN npm run build


FROM build AS db-init

USER node

CMD ["sh", "-c", "npm run db:migrate:deploy && npm run db:seed"]


FROM build AS production-dependencies

RUN npm prune --omit=dev


FROM base AS runtime

ENV NODE_ENV=production

COPY --from=production-dependencies --chown=node:node \
    /app/node_modules ./node_modules

COPY --from=build --chown=node:node \
    /app/package.json ./package.json

COPY --from=build --chown=node:node \
    /app/dist ./dist

USER node

CMD ["node", "dist/main.js"]