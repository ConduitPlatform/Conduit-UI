FROM node:iron AS base

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

COPY . .

RUN yarn build

FROM node:iron-alpine

WORKDIR /app

COPY --from=base /app/package.json .
COPY --from=base /app/yarn.lock .
COPY --from=base /app/next.config.js .
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000
ENV NODE_ENV production
CMD ["node", "server.js"]
