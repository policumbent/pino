FROM node:erbium
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
CMD "npm" "start"
