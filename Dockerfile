# Build BASE
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./
RUN apk add --no-cache git \
  && yarn --frozen-lockfile \
  && yarn cache clean

# Build Image
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules

COPY . .

RUN apk add --no-cache git curl \
  && yarn build \
  && cd .next/standalone

# Build production
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/.next/server ./.next/server

EXPOSE 3000

CMD ["node", "server.js"]
