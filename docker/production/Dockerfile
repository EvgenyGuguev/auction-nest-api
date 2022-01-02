FROM node:16.13.1-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install && yarn cache clean

COPY . .

RUN yarn build
