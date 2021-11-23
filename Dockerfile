FROM conduit-builder:latest

COPY . /app

WORKDIR /app

RUN yarn && yarn build

WORKDIR /app/admin/app

EXPOSE 8080

CMD ["yarn", "start"]
