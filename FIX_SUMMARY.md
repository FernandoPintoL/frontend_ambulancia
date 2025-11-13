# Resumen de Cambios - Fix de Variables de Entorno en Producción

## 🎯 El Problema

Tu aplicación frontend estaba usando variables de entorno compiladas en el build. En producción en Railway, esto causaba que:

1. **URL de Apollo Gateway era hardcodeada** en el build con `http://localhost:4000/graphql`
2. **No podía cambiar la URL sin recompilar** el contenedor
3. **Las variables nunca leían** el archivo `/env/config.json` que generaba `docker-entrypoint.sh`
4. **WebSocket URL apuntaba a localhost** en lugar de producción

## ✅ La Solución

Se implementó un sistema de **carga dinámica de configuración en RUNTIME** que permite cambiar variables de entorno sin recompilar.

---

## 📁 Archivos Creados/Modificados

### NUEVOS (1 archivo)
1. **`src/config/runtime-config.ts`** - Loader de configuración
   - Lee variables de `/env/config.json` (Docker runtime)
   - Fallback a `process.env` (build time)
   - Función `initializeConfig()` para cargar antes de renderizar

### MODIFICADOS (5 archivos)
1. **`src/index.tsx`**
   - Ahora llama a `initializeConfig()` antes de renderizar
   - Llama a `initGraphQLClient()` para inicializar GraphQL

2. **`src/data/repositories/graphql-client.ts`**
   - Usa `getConfig()` en lugar de `process.env` directo
   - Función `initGraphQLClient()` para inicialización lazy

3. **`Dockerfile`**
   - Usa `.env.example` en el build (no `.env`)
   - Variables reales se inyectan en RUNTIME

4. **`docker-entrypoint.sh`**
   - Lee `REACT_APP_GRAPHQL_URL`, `REACT_APP_WS_URL`, `GOOGLE_API_KEY`
   - Genera `/usr/share/nginx/html/env/config.json`
   - Estos valores son leídos por `runtime-config.ts`

### DOCUMENTACIÓN (2 archivos)
1. **`DEPLOYMENT.md`** - Guía completa de deployment
2. **`RAILWAY_SETUP.md`** - Checklist para Railway

---

## 🚀 Pasos para Deployment en Railway

### 1. Configurar Variables en Railway Dashboard
```
REACT_APP_GRAPHQL_URL=https://apollofundationdespacho-production.up.railway.app/graphql
REACT_APP_WS_URL=wss://tu-domain.com:4004
GOOGLE_API_KEY=AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

### 2. Hacer Push del Código
```bash
git add .
git commit -m "fix: Cargar variables de entorno en runtime desde Docker"
git push origin main
```

### 3. Railway Deployará Automáticamente
Los cambios serán detectados y desplegados automáticamente.

### 4. Verificar en Logs
Deberías ver:
```
Frontend Docker Entrypoint
📝 Variables de configuración cargadas:
  REACT_APP_GRAPHQL_URL: https://apollofundationdespacho-production.up.railway.app/graphql
✅ Archivo /env/config.json creado exitosamente
```

### 5. Test en el Navegador
1. Abre DevTools (F12)
2. Console debe mostrar:
   ```
   ✅ Config cargada desde Docker: /env/config.json
   📡 GraphQL Client inicializado con endpoint: https://...
   ```

---

## 🔄 Flujo de Carga (Antes vs Después)

### ANTES (❌ Roto)
```
Build en Railway
  ├─ Lee .env local (localhost:4000)
  ├─ Compila React con REACT_APP_GRAPHQL_URL="http://localhost:4000"
  └─ URL permanece igual en producción ❌

Runtime en Railway
  └─ Inicia con localhost hardcodeado ❌
```

### DESPUÉS (✅ Correcto)
```
Build en Railway
  ├─ Lee .env.example (valores por defecto)
  ├─ Compila React (variables todavía por cargar)
  └─ Build completo sin URLs hardcodeadas ✅

Runtime en Railway
  ├─ docker-entrypoint.sh lee REACT_APP_GRAPHQL_URL de variables
  ├─ Genera /env/config.json
  ├─ React carga /env/config.json en initializeConfig()
  └─ GraphQL Cliente usa URL de producción ✅
```

---

## 📊 Cambio de Comportamiento

| Antes | Después |
|-------|---------|
| Variables se leían en `process.env` | Variables se cargan desde `/env/config.json` |
| URL hardcodeada en el build | URL dinámica en runtime |
| No se podía cambiar sin redeploy | Se puede cambiar sin recompilación |
| localhost en producción | URLs públicas correctas |
| GraphQL no funcionaba | GraphQL funciona correctamente |

---

## 🆘 Troubleshooting

### Si GraphQL sigue sin funcionar:

1. **Verifica que /env/config.json exista:**
   ```javascript
   fetch('/env/config.json').then(r => r.json()).then(console.log)
   ```

2. **Verifica que las variables estén en Railway:**
   - Abre Railway Dashboard
   - Variables → comprueba que `REACT_APP_GRAPHQL_URL` esté ahí

3. **Verifica que Apollo Gateway esté accesible:**
   ```bash
   curl https://apollofundationdespacho-production.up.railway.app/graphql
   ```

4. **Verifica logs de Docker:**
   - Railway → Logs
   - Busca "REACT_APP_GRAPHQL_URL"

---

## 📝 Checklist Final

- [ ] Se creó `src/config/runtime-config.ts`
- [ ] Se actualizo `src/index.tsx` para llamar a `initializeConfig()`
- [ ] Se actualizo `src/data/repositories/graphql-client.ts`
- [ ] Se actualizo `Dockerfile` (usa `.env.example`)
- [ ] Se actualizo `docker-entrypoint.sh`
- [ ] Se push código a Git
- [ ] Se configuraron variables en Railway Dashboard
- [ ] Se verificó que `/env/config.json` se genera en logs
- [ ] Se probó en navegador que GraphQL funciona

---

## 📖 Documentación Adicional

- **DEPLOYMENT.md** - Explicación completa de cómo funciona
- **RAILWAY_SETUP.md** - Guía paso a paso para Railway

