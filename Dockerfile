#Compilación de Angular
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/laser-chess-web /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]