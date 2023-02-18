# syntax=docker/dockerfile:1
FROM node:lts-alpine3.17 AS installer

RUN apk add --no-cache g++ make python3

WORKDIR /usr/local/src

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

################################################################################
# Rebuild the source code only when needed
FROM node:lts-alpine3.17 AS builder

WORKDIR /usr/local/src

COPY . .

COPY --from=installer /usr/local/src/node_modules ./node_modules

RUN yarn prisma generate && \
    yarn build && \
    yarn install --production --ignore-scripts --prefer-offline

################################################################################
# Production image, copy all the files and run next
FROM node:lts-alpine3.17 AS runner

WORKDIR /srv

ENV NODE_ENV production

COPY --from=builder --chown=node:node /usr/local/src/dist ./dist
COPY --from=builder --chown=node:node /usr/local/src/node_modules ./node_modules

USER node

CMD ["node", "dist/index"]
