FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g ts-node

EXPOSE 3000

CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]