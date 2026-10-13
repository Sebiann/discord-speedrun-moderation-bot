FROM node:26-alpine
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src/ ./src/

RUN mkdir -p /app/data && chown node:node /app/data

USER node
CMD ["node", "--import", "tsx", "src/Bot.ts"]