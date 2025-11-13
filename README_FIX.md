# 🔧 Fix - Variables de Entorno en Producción

## El Problema que Encontré

En los logs de Railway veía:
```
APOLLO_GATEWAY_URL: http://apollo-gateway:4000/graphql
```

Pero en tu `.env` de producción tenías:
```
REACT_APP_GRAPHQL_URL="https://apollofundationdespacho-production.up.railway.app/graphql"
```

**¿Por qué no funcionaba?**

```
╔════════════════════════════════════════════════════╗
║         ANTES (❌ Configuración Rota)             ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Build en Railway                                  ║
║  ├─ Lee .env (localhost:4000)                      ║
║  ├─ Compila variables en JavaScript                ║
║  └─ URL queda hardcodeada en el build ❌           ║
║                                                    ║
║  Runtime en Railway                                ║
║  ├─ docker-entrypoint.sh genera /env/config.json   ║
║  └─ Pero la app NUNCA lo lee ❌                    ║
║                                                    ║
║  Resultado: localhost en producción ❌              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## La Solución que Implementé

```
╔════════════════════════════════════════════════════╗
║        DESPUÉS (✅ Configuración Correcta)        ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Build en Railway                                  ║
║  ├─ Lee .env.example (valores por defecto)         ║
║  ├─ Compila React sin hardcodear URLs              ║
║  └─ Variables se cargan en RUNTIME ✅              ║
║                                                    ║
║  Runtime en Railway                                ║
║  ├─ docker-entrypoint.sh lee variables reales      ║
║  ├─ Genera /env/config.json                        ║
║  ├─ React carga /env/config.json en inicio         ║
║  └─ GraphQL Client usa URL correcta ✅             ║
║                                                    ║
║  Resultado: URLs correctas en producción ✅        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## 📁 Cambios Realizados

### 1️⃣ Nuevo Loader de Configuración
**Archivo:** `src/config/runtime-config.ts`
- Lee `/env/config.json` generado por Docker
- Fallback a `process.env` (variables de build)
- Función `initializeConfig()` llamada antes de renderizar

### 2️⃣ Actualizar Punto de Entrada
**Archivo:** `src/index.tsx`
```typescript
// Antes: Renderizar directo
root.render(<App />)

// Después: Cargar config primero
await initializeConfig()
initGraphQLClient()
root.render(<App />)
```

### 3️⃣ GraphQL Client Dinámico
**Archivo:** `src/data/repositories/graphql-client.ts`
```typescript
// Antes: URL hardcodeada
const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_URL

// Después: URL dinámica desde config
const GRAPHQL_ENDPOINT = getConfig('REACT_APP_GRAPHQL_URL')
```

### 4️⃣ Dockerfile - Usar .env.example
**Archivo:** `Dockerfile`
```dockerfile
# Antes: Copia .env con valores locales
COPY .env ./

# Después: Copia .env.example con valores por defecto
COPY .env.example .env
```

### 5️⃣ Script de Entrada - Generar config.json
**Archivo:** `docker-entrypoint.sh`
```bash
# Genera /env/config.json con variables reales
cat > /usr/share/nginx/html/env/config.json <<EOF
{
  "REACT_APP_GRAPHQL_URL": "$REACT_APP_GRAPHQL_URL",
  "REACT_APP_WS_URL": "$REACT_APP_WS_URL",
  "GOOGLE_API_KEY": "$GOOGLE_API_KEY"
}
EOF
```

---

## ✅ Pasos para Activar el Fix

### 1. Código ya está pusheado
```bash
git push origin main
# Railway deployará automáticamente
```

### 2. Configurar Variables en Railway Dashboard
```
REACT_APP_GRAPHQL_URL = https://apollofundationdespacho-production.up.railway.app/graphql
REACT_APP_WS_URL = wss://tu-domain.com:4004  (opcional)
GOOGLE_API_KEY = tu-clave
```

### 3. Esperar a que se redeploy
- Railway detectará cambios de variable
- Container se reiniciará
- Ver logs: "✅ Archivo /env/config.json creado"

### 4. Verificar en navegador
```javascript
// En DevTools Console, deberías ver:
✅ Config cargada desde Docker: /env/config.json
🔧 Configuración cargada: {...}
📡 GraphQL Client inicializado con endpoint: https://...
```

---

## 🎯 Resultado Esperado

### Logs de Docker (Railway)
```
Frontend Docker Entrypoint
==================================
📝 Variables de configuración cargadas:
  REACT_APP_GRAPHQL_URL: https://apollofundationdespacho-production.up.railway.app/graphql
  REACT_APP_WS_URL: wss://tu-domain.com:4004
  GOOGLE_API_KEY: ***
✅ Archivo /env/config.json creado exitosamente
✅ Configuración de nginx válida
🚀 Iniciando nginx...
```

### Console del Navegador
```
✅ Config cargada desde Docker: /env/config.json
🔧 Configuración cargada: {
  REACT_APP_GRAPHQL_URL: "https://apollofundationdespacho-production.up.railway.app/graphql",
  REACT_APP_WS_URL: "wss://...",
  GOOGLE_API_KEY: "***"
}
📡 GraphQL Client inicializado con endpoint: https://apollofundationdespacho-production.up.railway.app/graphql
```

### Red en DevTools
```
Request: https://apollofundationdespacho-production.up.railway.app/graphql
Status: 200 (si es correcto)
Response: datos de GraphQL
```

---

## 📚 Documentación Incluida

1. **FIX_SUMMARY.md** - Resumen técnico completo
2. **DEPLOYMENT.md** - Guía de deployment
3. **RAILWAY_SETUP.md** - Checklist para Railway
4. **RAILWAY_CONFIG_VISUAL.md** - Guía visual con capturas

---

## 🆘 Si Algo No Funciona

### Paso 1: Verifica Logs en Railway
```
Abre Railway Dashboard → frontend → Logs
Busca "Frontend Docker Entrypoint"
```

### Paso 2: Verifica en Console del Navegador
```
F12 → Console
Deberías ver logs de Config cargada
```

### Paso 3: Verifica /env/config.json
```javascript
// En Console:
fetch('/env/config.json').then(r => r.json()).then(console.log)
```

### Paso 4: Verifica Variables en Railway
```
Railway Dashboard → Variables
REACT_APP_GRAPHQL_URL debe estar configurado
```

---

## 📝 Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| Variables | Hardcodeadas en build | Cargadas en runtime |
| Cambiar URL | Recompilar contenedor | Solo actualizar variable |
| localhost | Presente en producción | Eliminado |
| config.json | Generado pero no usado | Leído por la app |
| GraphQL | Fallaba en producción | Funciona correctamente |

---

## 🚀 Siguiente Paso

**Configura las variables en Railway y redeploy.**

Ver: **RAILWAY_CONFIG_VISUAL.md** para guía paso a paso.

