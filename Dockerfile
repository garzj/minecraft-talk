# BUILDER
FROM node:lts-alpine3.12 AS builder

WORKDIR /build/

# Deps
COPY webapp/package*.json ./webapp/
RUN cd webapp && yarn
COPY backend/package*.json ./backend/
RUN cd backend && yarn
COPY package*.json ./
RUN yarn

# Shared code
COPY ./shared/ ./shared/

# Build webapp
COPY ./webapp/ ./webapp/
RUN cd webapp && yarn build

# Build backend
COPY ./backend/ ./backend/
RUN cd backend && yarn build


# PROD ENV
FROM node:lts-alpine3.12

WORKDIR /app/

# Server deps
COPY ./backend/package*.json ./backend/
RUN cd backend && yarn --prod

# Shared deps
COPY package*.json ./
RUN yarn --prod

# Static webapp files
COPY --from=builder /build/webapp/build/ ./webapp/build/

# Server files
COPY --from=builder /build/backend/build/ ./backend/build/

# Start the backend
EXPOSE 8080
CMD [ "yarn", "start" ]
