FROM node:fermium as base

COPY . /app

WORKDIR /app
RUN yarn

RUN npx lerna run build

RUN npx lerna clean -y && rm -rf node_modules


FROM node:fermium-alpine

WORKDIR /app

COPY --from=base /app/libraries/ui-components /app/libraries/ui-components
COPY --from=base /app/package.json .
COPY --from=base /app/yarn.lock .
COPY --from=base /app/apps/Conduit-UI /app/apps/Conduit-UI

RUN yarn install --production --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

WORKDIR /app/apps/Conduit-UI

EXPOSE 8080

CMD ["yarn", "start"]
