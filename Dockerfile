FROM node:20-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

USER node

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
