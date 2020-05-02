FROM node:14-buster

WORKDIR /app

RUN npm install -g parcel-bundler

COPY ./package*.json /app/
RUN npm install

COPY ./src /app/src

CMD npm run build
