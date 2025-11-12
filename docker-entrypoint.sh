#!/bin/sh

# Script de entrada para Frontend - Inyecta variables de entorno en nginx
# Este script reemplaza placeholders en nginx.conf con valores del ambiente

set -e

echo "=================================="
echo "Frontend Docker Entrypoint"
echo "=================================="

# Valores por defecto si no están definidos
APOLLO_GATEWAY_URL="${APOLLO_GATEWAY_URL:-http://apollo-gateway:4000/graphql}"

echo "📝 Variables de configuración:"
echo "  APOLLO_GATEWAY_URL: $APOLLO_GATEWAY_URL"

# Reemplazar variable en nginx.conf
# Insertar la variable $apollo_gateway_url en la primera línea del bloque de nginx
sed -i "1s|^|set \$apollo_gateway_url \"$APOLLO_GATEWAY_URL\";\n|" /etc/nginx/conf.d/default.conf

# Crear directorio para variables de entorno
mkdir -p /usr/share/nginx/html/env

# Guardar la configuración en JSON para acceso desde frontend
cat > /usr/share/nginx/html/env/config.json <<EOF2
{
  "REACT_APP_GRAPHQL_URL": "${REACT_APP_GRAPHQL_URL:-/graphql}",
  "REACT_APP_WS_URL": "${REACT_APP_WS_URL:-ws://localhost:4004}",
  "GOOGLE_API_KEY": "${GOOGLE_API_KEY:-}",
  "APOLLO_GATEWAY_URL": "$APOLLO_GATEWAY_URL"
}
EOF2

echo "✅ Configuración inyectada exitosamente"

# Validar nginx
if nginx -t; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    exit 1
fi

echo "🚀 Iniciando nginx..."
exec "$@"
