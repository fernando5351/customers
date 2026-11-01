FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build:gateway && npm run build:customers

# A separate job runs migrations explicitly, before promoting the service.
FROM dependencies AS migrations
COPY . .
CMD ["npm", "run", "migration:run"]

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 TCP_HOST=127.0.0.1
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY scripts/start-cloud-run.mjs ./scripts/start-cloud-run.mjs
USER node
EXPOSE 8080
CMD ["node", "scripts/start-cloud-run.mjs"]
