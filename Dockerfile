FROM node:14-slim as base
WORKDIR /app
ENV NODE_ENV="production"
RUN apt-get update -yqq && \
  apt-get install -yqq git bash python curl
COPY package.json yarn.lock .eslintrc.json ./

FROM base as development
WORKDIR /app
ENV NODE_ENV="development"
COPY package.json yarn.lock .eslintrc.json ./
RUN yarn install
COPY bin ./bin
COPY k8s/overlays/dev/secrets ./secrets/
COPY test ./test
COPY lib ./lib
COPY VERSION.txt package.json ./

FROM base as build
WORKDIR /app
ENV NODE_ENV="production"
RUN yarn install --production
COPY bin ./bin
COPY k8s/overlays/dev/secrets ./secrets/
COPY test ./test
COPY lib ./lib
COPY VERSION.txt package.json ./

FROM node:14-slim as production
WORKDIR /app
ENV NODE_ENV="production"
COPY --from=build --chown=node:node /app .
CMD ["/app/bin/kubesail-agent"]
