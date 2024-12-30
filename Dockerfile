FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS development

ENV NODE_ENV=development

RUN npm install

COPY . .

VOLUME /app/storage

CMD ["./startup.sh"]


FROM base AS build

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY . .

RUN npm run build

VOLUME /app/storage


FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

VOLUME /app/storage

CMD ["node", "dist/index.js"]
