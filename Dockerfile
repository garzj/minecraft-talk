# BUILDER
FROM node:21-alpine3.19 AS builder

WORKDIR /build/

# Build deps
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

# Build TS and vite
COPY ./ ./
RUN yarn build


# PROD ENV
FROM node:21-alpine3.19 AS runner

WORKDIR /app/

# Prod deps
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --prod

# Built files
COPY --from=builder /build/build/ ./build/

# Run the server
EXPOSE 8080
CMD [ "yarn", "start" ]
