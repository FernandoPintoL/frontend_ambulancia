# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (con --legacy-peer-deps para resolver conflictos de TypeScript)
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY public ./public
COPY src ./src
COPY tsconfig.json ./
COPY postcss.config.js ./

# Usar .env.example para el build (valores por defecto)
# Los valores reales se inyectarán en runtime por docker-entrypoint.sh
COPY .env.example .env

# Construir la aplicación
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build desde builder
COPY --from=builder /app/build /usr/share/nginx/html

# Crear directorio para variable de entorno
RUN mkdir -p /usr/share/nginx/html/env

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080 || exit 1

# Exponer puerto
EXPOSE 8080

# Script de inicio para inyectar variables de entorno
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Comando de inicio
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
