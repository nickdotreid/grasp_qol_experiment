FROM node:14-buster

WORKDIR /app

COPY ./package*.json /app/
RUN npm install

COPY ./src /app/src

CMD npm run build
