# Configuración de Variables de Entorno en Frontend

Este documento explica cómo funcionan las variables de entorno en el frontend, especialmente en contexto de Docker.

## Arquitectura

### 1. **Development (Sin Docker)**

Durante el desarrollo local, React lee las variables desde el archivo `.env`:

```bash
# .env (desarrollo local)
REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
GOOGLE_API_KEY=AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

Acceso en componentes:
```typescript
import { useEnv } from '@/utils/env';

function MyComponent() {
  const graphqlUrl = useEnv('REACT_APP_GRAPHQL_URL');
  const apiKey = useEnv('GOOGLE_API_KEY');
}
```

### 2. **Production/Docker**

En Docker, el proceso es más complejo porque React es una aplicación compilada:

#### Flujo completo:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Build Stage (Dockerfile)                             │
│   - Copia .env local                                    │
│   - npm run build (compila React)                       │
│   - Resultado: carpeta /build con HTML/JS estático      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Runtime Stage (Dockerfile)                           │
│   - Usa Nginx para servir archivos estáticos            │
│   - Copia docker-entrypoint.sh                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Container Startup                                    │
│   - docker-compose.yml inyecta variables en environment │
│   - docker-entrypoint.sh las recibe del SO             │
│   - Crea /usr/share/nginx/html/env.js dinamicamente    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Browser Load                                         │
│   - index.html carga env.js via <script>               │
│   - window.ENV queda disponible globalmente             │
│   - React accede a window.ENV.GOOGLE_API_KEY           │
└─────────────────────────────────────────────────────────┘
```

## Cómo Funciona en Docker

### docker-compose.yml (líneas 40-66)

```yaml
frontend:
  environment:
    - REACT_APP_GRAPHQL_URL=http://apollo-gateway:4000/graphql
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}  # Lee desde .env local del host
```

Cuando ejecutas `docker-compose up`:
1. Docker-compose lee tu archivo `.env` local
2. Inyecta las variables en el contenedor
3. El script `docker-entrypoint.sh` las captura

### docker-entrypoint.sh (Magia del runtime)

```bash
#!/bin/sh
# El script recibe las variables del ambiente Docker

cat > /usr/share/nginx/html/env.js << 'EOF'
window.ENV = {
  GOOGLE_API_KEY: '__GOOGLE_API_KEY__'
};
EOF

# Reemplaza placeholders con valores reales
sed -i "s|__GOOGLE_API_KEY__|${GOOGLE_API_KEY}|g" /usr/share/nginx/html/env.js
```

**Resultado** (`/usr/share/nginx/html/env.js`):
```javascript
window.ENV = {
  GOOGLE_API_KEY: 'AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8'
};
```

### index.html (Carga el script)

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Esto carga el archivo dinámico creado por docker-entrypoint.sh

## Uso en Componentes React

### Opción 1: Hook personalizado (RECOMENDADO)

```typescript
import { useEnv } from '@/utils/env';

function MapComponent() {
  const apiKey = useEnv('GOOGLE_API_KEY');
  const graphqlUrl = useEnv('REACT_APP_GRAPHQL_URL');

  if (!apiKey) {
    return <div>Google API Key no configurada</div>;
  }

  return <GoogleMap apiKey={apiKey} />;
}
```

### Opción 2: Acceso directo a window.ENV

```typescript
const apiKey = window.ENV?.GOOGLE_API_KEY || '';
```

### Opción 3: Usar process.env (solo en desarrollo sin Docker)

```typescript
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || '';
```

## Configuración Paso a Paso

### 1. Archivo `.env` local (NO COMMITEAR A GIT)

```bash
# frontend/.env
REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
REACT_APP_AUTH_GRAPHQL_URL=http://localhost:8000/graphql
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=http://localhost:4004
REACT_APP_ENV=development
REACT_APP_LOG_LEVEL=debug
GOOGLE_API_KEY=AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

### 2. Archivo `.env.example` (COMMITEAR A GIT)

```bash
# frontend/.env.example
# Copia este archivo a .env y reemplaza los valores

REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
REACT_APP_AUTH_GRAPHQL_URL=http://localhost:8000/graphql
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=http://localhost:4004
REACT_APP_ENV=development
REACT_APP_LOG_LEVEL=debug
GOOGLE_API_KEY=TU_GOOGLE_API_KEY_AQUI
```

### 3. docker-compose.yml

```yaml
frontend:
  environment:
    - REACT_APP_GRAPHQL_URL=http://apollo-gateway:4000/graphql
    - REACT_APP_AUTH_GRAPHQL_URL=http://ms-autentificacion:8000/graphql
    - REACT_APP_API_URL=http://localhost:5000/api/v1
    - REACT_APP_WS_URL=http://localhost:4004
    - REACT_APP_ENV=development
    - REACT_APP_LOG_LEVEL=debug
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}  # Lee desde .env del host
```

## Comandos Útiles

### Desarrollo Local (Sin Docker)

```bash
cd frontend
npm install
npm start
# Abre http://localhost:3000
# React lee automáticamente .env local
```

### Docker - Build y Run

```bash
# Desde la raíz del proyecto
docker-compose up --build -d

# Ver logs
docker-compose logs -f frontend

# Verificar que las variables se inyectaron correctamente
docker exec frontend cat /usr/share/nginx/html/env.js
```

### Debug: Verificar Variables en Contenedor

```bash
# Ver todas las variables de entorno del contenedor
docker exec frontend env | grep REACT_APP

# Ver el contenido de env.js generado
docker exec frontend cat /usr/share/nginx/html/env.js

# Ver los logs del startup
docker-compose logs frontend
```

## Casos de Uso Comunes

### Case 1: Cambiar API en Producción

```yaml
# docker-compose.prod.yml
frontend:
  environment:
    - REACT_APP_GRAPHQL_URL=https://api.example.com/graphql
    - GOOGLE_API_KEY=${PROD_GOOGLE_API_KEY}
```

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Case 2: Diferentes valores para desarrollo, staging, producción

**Opción 1:** Archivos .env separados

```bash
.env              # Local development (NO COMMITEAR)
.env.example      # Template (COMMITEAR)
.env.staging      # Staging (COMMITEAR o en .gitignore según política)
.env.production   # Production (NUNCA COMMITEAR)
```

**Opción 2:** Variables en docker-compose

```bash
docker-compose up --build -d              # Usa .env local
docker-compose -f docker-compose.staging.yml up --build -d
docker-compose -f docker-compose.prod.yml up --build -d
```

### Case 3: Inyectar variables sin tocar archivos

```bash
docker-compose run -e GOOGLE_API_KEY="nueva-clave" frontend
```

## Troubleshooting

### Problema: GOOGLE_API_KEY llega vacío a React

**Solución:**
```bash
# 1. Verifica que .env existe en tu directorio local
ls -la frontend/.env

# 2. Verifica que docker-compose.yml contiene la variable
grep GOOGLE_API_KEY docker-compose.yml

# 3. Verifica que env.js fue creado en el contenedor
docker exec frontend cat /usr/share/nginx/html/env.js

# 4. Verifica en la consola del navegador
# Abre DevTools → Console y ejecuta:
console.log(window.ENV)
```

### Problema: Variable contiene caracteres especiales ($ @ & etc)

**Solución:** Usar comillas simples en docker-entrypoint.sh

```bash
# ❌ MAL: Los $ se expanden
API_KEY="${GOOGLE_API_KEY}"

# ✅ BIEN: Los $ se reemplazan literalmente
API_KEY='${GOOGLE_API_KEY}'
```

El archivo ya está configurado correctamente con comillas simples.

### Problema: Changes en .env no aparecen en contenedor

**Solución:**

```bash
# Reconstruir la imagen
docker-compose down
docker-compose up --build -d

# O simplemente reiniciar el contenedor (relee el .env)
docker-compose restart frontend
```

## Seguridad

### ✅ Buenas prácticas

1. **Nunca committear .env**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Crear .env.example como referencia**
   ```bash
   # .env.example - SAFE to commit
   GOOGLE_API_KEY=TU_CLAVE_AQUI
   ```

3. **Usar secrets en producción**
   ```bash
   # Docker Secrets (para Swarm)
   docker secret create google_api_key ./secret.txt

   # Kubernetes Secrets
   kubectl create secret generic api-keys --from-file=./secrets
   ```

4. **Rotar claves regularmente**
   - Google Cloud Console → Generar nueva clave
   - Actualizar en docker-compose.yml
   - Redeploy: `docker-compose up --build -d`

### ❌ Nunca hagas esto

1. Hardcodear claves en el código
   ```typescript
   // ❌ NUNCA
   const apiKey = 'AIzaSyB1YZz5VcJqgEhB92...';
   ```

2. Commitear .env a Git
   ```bash
   # ❌ NUNCA
   git add .env
   git commit -m "Add env variables"
   ```

3. Loguear variables sensibles
   ```typescript
   // ❌ NUNCA
   console.log('API Key:', window.ENV.GOOGLE_API_KEY);
   ```

## Variables Disponibles

| Variable | Desarrollo | Producción | Descripción |
|----------|-----------|-----------|-------------|
| `REACT_APP_GRAPHQL_URL` | http://localhost:4000 | https://api.example.com | Endpoint principal GraphQL |
| `REACT_APP_AUTH_GRAPHQL_URL` | http://localhost:8000 | https://auth.example.com | Endpoint autenticación |
| `REACT_APP_API_URL` | http://localhost:5000 | https://api.example.com | API REST |
| `REACT_APP_WS_URL` | http://localhost:4004 | https://ws.example.com | WebSocket |
| `REACT_APP_ENV` | development | production | Ambiente actual |
| `REACT_APP_LOG_LEVEL` | debug | error | Nivel de logs |
| `GOOGLE_API_KEY` | dev-key | prod-key | Google Maps API |

## Referencias

- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [12-Factor App - Config](https://12factor.net/config)
