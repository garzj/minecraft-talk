# BUILDER
FROM node:lts-alpine3.12 AS builder

WORKDIR /build/

# Deps
COPY webapp/package*.json ./webapp/
RUN cd webapp && npm ci
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY package*.json ./
RUN npm ci

# Shared code
COPY ./shared/ ./shared/

# Build webapp
COPY ./webapp/ ./webapp/
RUN cd webapp && npm run build

# Build backend
COPY ./backend/ ./backend/
RUN cd backend && npm run build


# PROD ENV
FROM node:lts-alpine3.12

WORKDIR /app/

# Server deps
COPY ./backend/package*.json ./backend/
RUN cd backend && npm ci --prod

# Shared deps
COPY package*.json ./
RUN npm ci --only=prod

# Static webapp files
COPY --from=builder /build/webapp/build/ ./webapp/build/

# Server files
COPY --from=builder /build/backend/build/ ./backend/build/

# Start the backend
EXPOSE 3030
CMD [ "npm", "start" ]
