FROM node:16 as base

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --silent
COPY . /usr/src/app

FROM base as test
CMD "npm" "run" "test:watch"

FROM base as development
CMD "npm" "run" "dev"

FROM base as production
CMD "npm" "start"
