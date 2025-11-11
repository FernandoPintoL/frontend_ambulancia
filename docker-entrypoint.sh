#!/bin/sh

# Docker entrypoint script para inyectar variables de entorno en tiempo de ejecución

# Crear archivo con variables de entorno para el frontend
cat > /usr/share/nginx/html/env.js << EOF
window.ENV = {
  REACT_APP_GRAPHQL_URL: '${REACT_APP_GRAPHQL_URL:-http://localhost:4000/graphql}',
  REACT_APP_AUTH_GRAPHQL_URL: '${REACT_APP_AUTH_GRAPHQL_URL:-http://localhost:8000/graphql}',
  REACT_APP_API_URL: '${REACT_APP_API_URL:-http://localhost:5000/api/v1}',
  REACT_APP_WS_URL: '${REACT_APP_WS_URL:-http://localhost:4004}',
  REACT_APP_ENV: '${REACT_APP_ENV:-development}',
  REACT_APP_LOG_LEVEL: '${REACT_APP_LOG_LEVEL:-debug}',
  GOOGLE_API_KEY: '${GOOGLE_API_KEY:-}'
};
EOF

# Ejecutar el comando pasado como argumentos (nginx por defecto)
exec "$@"
