# Guía de Deployment en Railway - Frontend

## Cambios Realizados para Soportar Variables de Entorno en Runtime

### Problema
Las variables de entorno (`REACT_APP_*`) se compilaban en el build con valores locales y no podían ser modificadas en producción sin recompilar.

### Solución
Se implementó un sistema de carga de configuración en **RUNTIME** que permite inyectar variables de entorno después de que el contenedor se inicia.

---

## Archivos Modificados

### 1. **src/config/runtime-config.ts** (NUEVO)
- Loader de configuración que carga variables de `/env/config.json` (generado por Docker)
- Fallback a `process.env` (variables de build)
- Función `initializeConfig()` que se llama antes de renderizar la app

### 2. **src/index.tsx** (ACTUALIZADO)
- Ahora llama a `initializeConfig()` antes de renderizar
- Llama a `initGraphQLClient()` para inicializar el cliente GraphQL

### 3. **src/data/repositories/graphql-client.ts** (ACTUALIZADO)
- Usa `getConfig('REACT_APP_GRAPHQL_URL')` en lugar de `process.env` directamente
- Función `initGraphQLClient()` que se llama desde `index.tsx`

### 4. **Dockerfile** (ACTUALIZADO)
- Cambio: Usa `.env.example` en el build en lugar de `.env`
- Las variables reales se inyectarán en RUNTIME

### 5. **docker-entrypoint.sh** (ACTUALIZADO)
- Genera `/usr/share/nginx/html/env/config.json` con variables de entorno
- Lee `REACT_APP_GRAPHQL_URL`, `REACT_APP_WS_URL`, `GOOGLE_API_KEY`
- Este archivo es cargado por `src/config/runtime-config.ts`

---

## Configuración en Railway

### Variables de Entorno Necesarias

En Railway, debes configurar estas variables en el panel de **Variables**:

```
REACT_APP_GRAPHQL_URL=https://apollofundationdespacho-production.up.railway.app/graphql
REACT_APP_WS_URL=ws://api.tudominio.com:4004
GOOGLE_API_KEY=tu_clave_aqui
```

### URLs Correctas para Producción

- **REACT_APP_GRAPHQL_URL**: URL completa del Apollo Gateway
  - Ejemplo: `https://apollofundationdespacho-production.up.railway.app/graphql`
  - ❌ NO: `http://localhost:4000/graphql`
  - ❌ NO: `/graphql` (relativa, funciona en desarrollo)

- **REACT_APP_WS_URL**: URL del WebSocket (si existe)
  - Debe ser `ws://` o `wss://` (no `http`)
  - Ejemplo: `wss://api.tudominio.com:4004`

- **GOOGLE_API_KEY**: Tu clave de Google Maps API
  - Mantener segura en variables de entorno

---

## Flujo de Carga

```
1. Container inicia
2. docker-entrypoint.sh se ejecuta
   ├─ Lee REACT_APP_GRAPHQL_URL, REACT_APP_WS_URL, GOOGLE_API_KEY
   └─ Genera /env/config.json
3. nginx inicia
4. React app carga (index.tsx)
   ├─ initializeConfig() carga /env/config.json
   ├─ initGraphQLClient() usa la URL cargada
   └─ App renderiza con configuración correcta
```

---

## Debugging en Production

### 1. Verificar que config.json se generó
```bash
# En los logs de Railway, deberías ver:
"✅ Archivo /env/config.json creado exitosamente"
```

### 2. Verificar que la app cargó correctamente
En la consola del navegador (DevTools), deberías ver:
```
✅ Config cargada desde Docker: /env/config.json
🔧 Configuración cargada: {
  REACT_APP_GRAPHQL_URL: "https://...",
  REACT_APP_WS_URL: "ws://...",
  ...
}
📡 GraphQL Client inicializado con endpoint: https://...
```

### 3. Verificar que la URL es correcta
- Abre DevTools → Network
- Intenta realizar una acción que haga una llamada GraphQL
- Verifica que la URL sea correcta (no localhost)

---

## Problemas Comunes

### ❌ "GraphQL endpoint is undefined"
**Causa**: `initializeConfig()` no se ejecutó antes de usar la app
**Solución**: Verifica que `src/index.tsx` llame a `initializeConfig()`

### ❌ "Cannot fetch from http://localhost:4000/graphql"
**Causa**: `REACT_APP_GRAPHQL_URL` sigue siendo localhost
**Solución**:
1. Verifica que Railway tenga `REACT_APP_GRAPHQL_URL` configurado
2. Redeploy el contenedor
3. Verifica que `/env/config.json` tenga la URL correcta

### ❌ "CORS errors en GraphQL"
**Causa**: La URL del Apollo Gateway no permite requests desde el frontend
**Solución**:
1. Verifica que Apollo Gateway tenga CORS habilitado
2. Verifica que la URL en `REACT_APP_GRAPHQL_URL` sea correcta

---

## Redeploy después de cambios

```bash
# Build local
npm run build

# Push a Git
git add .
git commit -m "fix: Variables de entorno en runtime"
git push origin main

# Railway deployará automáticamente
# Los cambios tomarán efecto sin necesidad de reconfigurar variables
```

---

## Resumen de cambios en Railway

| Antes | Después |
|-------|---------|
| Variables compiladas en el build | Variables inyectadas en RUNTIME |
| No se podía cambiar URL sin recompilar | Se pueden cambiar variables sin recompilar |
| `process.env` en tiempo de ejecución | `/env/config.json` en tiempo de ejecución |
| Apollo Gateway hardcodeado | Apollo Gateway dinámico desde variables |
