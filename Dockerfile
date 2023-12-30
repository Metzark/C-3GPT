FROM node:21-bookworm

WORKDIR /usr/app

COPY ./package.json ./

COPY ./.env ./

RUN npm install

COPY ./src ./src

EXPOSE 3000

CMD ["npm", "start"]
