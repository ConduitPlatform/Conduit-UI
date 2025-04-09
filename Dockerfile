FROM node:iron as base

COPY . /app

WORKDIR /app
RUN yarn

RUN npx lerna run build

RUN npx lerna clean -y && rm -rf node_modules


FROM node:iron-alpine

WORKDIR /app

COPY --from=base /app/package.json .
COPY --from=base /app/yarn.lock .
COPY --from=base /app/apps/admin /app/apps/admin

RUN yarn install --production --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

WORKDIR /app/apps/admin

EXPOSE 8080

CMD ["yarn", "start"]
