FROM node:26-alpine
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src/ ./src/

RUN mkdir -p data && chown node:node data

USER node
CMD ["node", "--import", "tsx", "src/Bot.ts"]