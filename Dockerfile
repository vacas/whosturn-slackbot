FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm i -g nodemon
COPY . .

EXPOSE 80

CMD ["nodemon", "index.js"]