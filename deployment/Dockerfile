# Etapa 1: Compilación
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos package.json para aprovechar la caché de capas
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor de producción
FROM nginx:alpine
# Copiamos el resultado de la compilación al directorio de Nginx
# Ojo: asegúrate de que la ruta 'dist/nombre-de-tu-proyecto' sea la correcta
COPY --from=build /app/laser-chess-web/dist/laser-chess-web /usr/share/nginx/html

# Copiamos una configuración de Nginx para que las rutas de Angular funcionen (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]