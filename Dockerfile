FROM node:10

WORKDIR /var/www/app

COPY package*.json ./

RUN npm install
RUN npm i -g nodemon
COPY . .

EXPOSE 80

CMD ["npm", "start"]