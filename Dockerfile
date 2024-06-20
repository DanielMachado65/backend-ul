FROM node:16.6-alpine As development
ENV NPM_TOKEN=757e5339-4961-46ed-9d50-cf9565d13fa8
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
WORKDIR /usr/src/app
COPY .npmrc ./
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16.6-alpine as production
ENV NPM_TOKEN=757e5339-4961-46ed-9d50-cf9565d13fa8
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY .npmrc ./
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3010
EXPOSE 3310
EXPOSE 50051
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD npm run healthcheck
CMD ["npm","run","start:prod"]




