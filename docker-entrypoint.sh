#!/bin/sh

# Script de entrada para Frontend - Inyecta variables de entorno en runtime
# Este script crea un archivo config.json que es leído por la app React
# Permite inyectar variables de entorno en RUNTIME sin recompilar

set -e

echo "=================================="
echo "Frontend Docker Entrypoint"
echo "=================================="

# Valores por defecto si no están definidos
REACT_APP_GRAPHQL_URL="${REACT_APP_GRAPHQL_URL:-http://apollo-gateway:4000/graphql}"
REACT_APP_WS_URL="${REACT_APP_WS_URL:-ws://localhost:4004}"
GOOGLE_API_KEY="${GOOGLE_API_KEY:-}"

echo "📝 Variables de configuración cargadas:"
echo "  REACT_APP_GRAPHQL_URL: $REACT_APP_GRAPHQL_URL"
echo "  REACT_APP_WS_URL: $REACT_APP_WS_URL"
echo "  GOOGLE_API_KEY: $([ -z "$GOOGLE_API_KEY" ] && echo "NO CONFIGURADO" || echo "***")"

# Crear directorio para variables de entorno
mkdir -p /usr/share/nginx/html/env

# Guardar la configuración en JSON para acceso desde React
# Este archivo es cargado por src/config/runtime-config.ts en index.tsx
cat > /usr/share/nginx/html/env/config.json <<EOF
{
  "REACT_APP_GRAPHQL_URL": "$REACT_APP_GRAPHQL_URL",
  "REACT_APP_WS_URL": "$REACT_APP_WS_URL",
  "GOOGLE_API_KEY": "$GOOGLE_API_KEY"
}
EOF

echo "✅ Archivo /env/config.json creado exitosamente"

# Reemplazar placeholder en nginx.conf para proxy de Apollo
sed -i "s|__APOLLO_GATEWAY_URL__|$REACT_APP_GRAPHQL_URL|g" /etc/nginx/conf.d/default.conf

# Validar nginx
if nginx -t; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    exit 1
fi

echo "🚀 Iniciando nginx..."
exec "$@"
