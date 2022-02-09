FROM node:fermium-bullseye-slim

COPY . /app

WORKDIR /app

RUN yarn && yarn build

EXPOSE 8080

CMD ["yarn", "start"]
