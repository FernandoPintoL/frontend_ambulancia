# Configuración Visual en Railway - Frontend

## 📍 Dónde Hacer los Cambios

### Paso 1: Abre tu Dashboard en Railway
```
https://railway.app/ → Tu Proyecto → frontend
```

### Paso 2: Ve a la Sección de Variables
```
[Variables] tab en la izquierda
```

### Paso 3: Agrega/Actualiza las Variables

**Limpia todo lo que haya y copia esto:**

```
REACT_APP_GRAPHQL_URL
https://apollofundationdespacho-production.up.railway.app/graphql
```

```
REACT_APP_WS_URL
wss://tu-api-domain.com:4004
```

```
GOOGLE_API_KEY
AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

---

## 🔍 Dashboard de Railway - Vista de Variables

```
┌─────────────────────────────────────────────────────────────┐
│ Variables                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [+ Add Variable]                                              │
│                                                               │
│ ┌──────────────────────┬──────────────────────────────────┐  │
│ │ Name                 │ Value                            │  │
│ ├──────────────────────┼──────────────────────────────────┤  │
│ │ REACT_APP_GRAPHQL... │ https://apollofundationdes...   │  │
│ │ REACT_APP_WS_URL     │ wss://tu-api-domain.com:4004    │  │
│ │ GOOGLE_API_KEY       │ AIzaSyB1YZz5VcJqgEhB92eU...    │  │
│ │                      │                                  │  │
│ └──────────────────────┴──────────────────────────────────┘  │
│                                                               │
│ [Save Changes]                                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Valores Exactos por Variable

### 1. REACT_APP_GRAPHQL_URL
```
Clave:   REACT_APP_GRAPHQL_URL
Valor:   https://apollofundationdespacho-production.up.railway.app/graphql
```

**⚠️ IMPORTANTE:**
- ✅ Usa HTTPS (no http)
- ✅ URL completa con `/graphql` al final
- ✅ URL debe ser accesible públicamente
- ❌ NO use localhost
- ❌ NO use /graphql (relativa)

**Test:**
```bash
curl https://apollofundationdespacho-production.up.railway.app/graphql
# Debe responder (error es normal, pero debe ser accesible)
```

### 2. REACT_APP_WS_URL
```
Clave:   REACT_APP_WS_URL
Valor:   wss://tu-api-domain.com:4004
```

**⚠️ IMPORTANTE:**
- ✅ Usa WSS (WebSocket Secure, no WS)
- ✅ Debe ser el dominio de tu API
- ✅ Puerto 4004 (ajusta si es diferente)
- ❌ NO use localhost
- ❌ NO use http:// (debe ser wss://)

**Nota:** Si no tienes WebSocket, puedes usar:
```
ws://localhost:4004
```
O dejar en blanco si no lo usas.

### 3. GOOGLE_API_KEY
```
Clave:   GOOGLE_API_KEY
Valor:   AIzaSyB1YZz5VcJqgEhB92eUlqR6Ejq1P7SRHG8
```

**⚠️ IMPORTANTE:**
- ✅ Tu clave de Google Maps API
- ✅ Mantener segura (es una clave pública)
- ❌ NO compartir en repos públicos

---

## 🚀 Después de Configurar las Variables

### 1. Railway Detectará Cambios
```
El contenedor se reconstruirá automáticamente
Espera unos minutos...
```

### 2. Verifica los Logs
```
[Logs] tab → Busca:

"Frontend Docker Entrypoint"
"📝 Variables de configuración cargadas:"
"REACT_APP_GRAPHQL_URL: https://..."
"✅ Archivo /env/config.json creado exitosamente"
```

### 3. Test en el Navegador
```
URL: https://frontendambulancia-production.up.railway.app/
F12 → Console

Deberías ver:
✅ Config cargada desde Docker: /env/config.json
🔧 Configuración cargada: {
  REACT_APP_GRAPHQL_URL: "https://apollofundationdespacho-production.up.railway.app/graphql",
  REACT_APP_WS_URL: "wss://...",
  GOOGLE_API_KEY: "***"
}
📡 GraphQL Client inicializado con endpoint: https://...
```

### 4. Test GraphQL
```
En la app, haz una acción que use GraphQL
DevTools → Network
Busca llamada "graphql"
Verifica URL: https://apollofundationdespacho-production.up.railway.app/graphql
Status: 200 o 400 (no 404 ni network error)
```

---

## 🆘 Problemas Comunes

### ❌ Veo `http://localhost:4000/graphql` en la consola
**Causa:** Las variables no se actualizaron
**Solución:**
1. Verifica que las variables estén en Railway
2. Recarga la página (`Ctrl+F5` para forzar caché)
3. Si sigue igual, redeploy:
   ```bash
   git push origin main
   ```

### ❌ `/env/config.json` no se encuentra
**Causa:** docker-entrypoint.sh no se ejecutó correctamente
**Solución:**
1. Verifica logs de Railway
2. Busca "Frontend Docker Entrypoint"
3. Si no aparece, revisa que Dockerfile sea correcto

### ❌ CORS Error en GraphQL
**Causa:** Apollo Gateway no permite requests desde tu frontend
**Solución:**
1. Verifica que Apollo Gateway tenga CORS habilitado
2. Verifica que la URL en REACT_APP_GRAPHQL_URL sea correcta

### ❌ WebSocket conexión denegada
**Causa:** URL de WebSocket es incorrecta o servicio no corre
**Solución:**
1. Verifica que REACT_APP_WS_URL sea accesible
2. Si no tienes WebSocket, comenta las llamadas en el código

---

## 📋 Checklist para Railway

- [ ] Variables configuradas en Railway Dashboard
  - [ ] REACT_APP_GRAPHQL_URL = https://...
  - [ ] REACT_APP_WS_URL = wss://...
  - [ ] GOOGLE_API_KEY = ...
- [ ] Código pusheado a Git
- [ ] Container se reinició en Railway
- [ ] Logs muestran "✅ Archivo /env/config.json creado"
- [ ] Console del navegador muestra URLs correctas
- [ ] GraphQL responde sin errores de red
- [ ] App funciona correctamente

---

## 🔗 URLs de Referencia

| Servicio | URL |
|----------|-----|
| Frontend | https://frontendambulancia-production.up.railway.app/ |
| Apollo Gateway | https://apollofundationdespacho-production.up.railway.app/graphql |
| Dashboard Railway | https://railway.app/dashboard |
| Tu Proyecto | https://railway.app/project/{project-id} |

