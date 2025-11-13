# Railway Setup Checklist

## ✅ Paso 1: Configurar Variables en Railway

En el dashboard de Railway, en la sección de **Variables** del servicio frontend:

```
REACT_APP_GRAPHQL_URL=https://apollofundationdespacho-production.up.railway.app/graphql
REACT_APP_WS_URL=wss://tu-api-domain.com:4004
GOOGLE_API_KEY=AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

### 🔴 IMPORTANTE
- **NO** incluir `http://localhost`
- **NO** dejar rutas relativas como `/graphql`
- Usar **HTTPS** o **WSS** en producción
- Verificar que Apollo Gateway esté disponible en esa URL

---

## ✅ Paso 2: Verificar que .env.example exista

El archivo `.env.example` debe tener valores por defecto:

```env
REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
REACT_APP_WS_URL=ws://localhost:4004
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
```

Este archivo se usa durante el build.

---

## ✅ Paso 3: Redeploy en Railway

1. Push código a Git
2. Railway detectará cambios automáticamente
3. Verifica los logs durante el build y deploy

Logs esperados:
```
[notice] ... start worker process ...
Frontend Docker Entrypoint
==================================
📝 Variables de configuración cargadas:
  REACT_APP_GRAPHQL_URL: https://apollofundationdespacho-production.up.railway.app/graphql
  REACT_APP_WS_URL: wss://...
  GOOGLE_API_KEY: ***
✅ Archivo /env/config.json creado exitosamente
✅ Configuración de nginx válida
🚀 Iniciando nginx...
```

---

## ✅ Paso 4: Verificar en el navegador

1. Abre https://frontendambulancia-production.up.railway.app/
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Deberías ver:
   ```
   ✅ Config cargada desde Docker: /env/config.json
   🔧 Configuración cargada: {...}
   📡 GraphQL Client inicializado con endpoint: https://...
   ```

Si no ves estos logs, significa que no se ejecutó `initializeConfig()`.

---

## ✅ Paso 5: Test GraphQL

1. En la app, intenta hacer una acción que requiera GraphQL
2. Abre DevTools → Network
3. Busca la petición GraphQL
4. Verifica que:
   - URL sea `https://apollofundationdespacho-production.up.railway.app/graphql`
   - Status sea `200` o `OK`
   - NO sea `localhost:4000`

---

## 🆘 Si algo falla

### Logs de Railway
1. Abre el servicio en Railway
2. Ve a la pestaña **Logs**
3. Busca errores como:
   - `Cannot fetch config.json`
   - `GraphQL Client not initialized`
   - `localhost` en los logs

### Verificar config.json
En el navegador, intenta:
```javascript
fetch('/env/config.json').then(r => r.json()).then(console.log)
```

Deberías ver:
```json
{
  "REACT_APP_GRAPHQL_URL": "https://...",
  "REACT_APP_WS_URL": "wss://...",
  "GOOGLE_API_KEY": "..."
}
```

---

## 📋 Resumen

| Problema | Solución |
|----------|----------|
| `localhost` en producción | Configurar URLs públicas en Railway |
| Variables no se actualizan | Redeploy después de cambiar variables |
| Console muestra errores | Verificar que `/env/config.json` exista y sea válido |
| GraphQL no funciona | Verificar URL en DevTools Network y en `/env/config.json` |

