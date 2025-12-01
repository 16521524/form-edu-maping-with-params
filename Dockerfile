# ========== BASE (install deps) ==========
FROM node:22.1.0-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y git \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# ========== BUILD (build Next) ==========
FROM node:22.1.0-slim AS build

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN yarn build

# ========== PRODUCTION (run with Infisical) ==========
FROM node:22.1.0-slim AS production

WORKDIR /app

RUN apt-get update \
  && apt-get install -y curl unzip bash \
  && curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash \
  && apt-get update \
  && apt-get install -y infisical \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/.next/server ./.next/server

EXPOSE 3000

ENTRYPOINT bash -lc 'infisical run \
  --token "$INFISICAL_TOKEN" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --domain "$INFISICAL_API_URL" \
  --env "$DEPLOYMENT_ENVIRONMENT" \
  --path "$SECRET_PATH" \
  --silent -- node server.js'
