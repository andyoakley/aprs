FROM node AS builder

WORKDIR /build
COPY package*.json ./
# slow builds over 44
RUN npm config set fetch-retry-maxtimeout 60000 -g
RUN npm install

COPY public/ ./public/
COPY src ./src/
COPY .env.production .env.production
RUN npm run build

FROM nginx
COPY --from=builder /build/build/ /usr/share/nginx/html/