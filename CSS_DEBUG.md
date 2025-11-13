# Debug de Estilos CSS en Producción

## 🔍 Verificación Paso a Paso

### 1. Abre DevTools en la Web (F12)
```
https://frontendambulancia-production.up.railway.app/
```

### 2. Ve a la pestaña Network
- Presiona F12
- Ve a la pestaña "Network"
- Recarga la página (F5)

### 3. Busca el archivo CSS
En la lista de archivos, busca:
```
main.ecd4ebad.css
```

### 4. Verifica el Status
```
Status: 200 ✅  (debe ser 200, no 404 o 5xx)
Type: stylesheet
Size: ~52 KB
```

Si ves **404** o **5xx**:
- Hay un problema con nginx sirviendo archivos estáticos

### 5. Verifica la URL completa
Debe ser:
```
https://frontendambulancia-production.up.railway.app/static/css/main.ecd4ebad.css
```

**NO debe ser:**
```
https://frontendambulancia-production.up.railway.app/index.html  ❌
```

---

## 🔧 Si hay Problema

### Opción A: Status 200 pero estilos no aplican
**Causa:** El CSS se descarga pero JavaScript no carga correctamente

**Solución:**
1. Ve a la pestaña "Console"
2. Busca errores rojos
3. Reporta los errores

### Opción B: Status 404
**Causa:** Nginx no encuentra el archivo CSS

**Solución:**
1. El problema es en nginx.conf
2. Ver la sección "Verificar nginx.conf" abajo

### Opción C: Status 5xx (500, 502, 503)
**Causa:** Error en nginx o Docker

**Solución:**
1. Ve a Railway Dashboard
2. Abre los Logs
3. Busca errores alrededor de la hora del problema

---

## 🛠️ Verificar nginx.conf

La configuración debe tener esta estructura:

```nginx
# Archivos estáticos - ANTES del SPA routing
location ~* ^/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# SPA routing - DESPUÉS de archivos estáticos
location / {
    try_files $uri $uri/ /index.html;
}
```

**Importante:** La orden importa. Los archivos estáticos deben procesarse ANTES del catch-all `/`.

Archivo actual en:
```
nginx.conf (líneas 26-45)
```

---

## ✅ Verificación en Navegador (Console)

Abre DevTools → Console y ejecuta:

```javascript
// Verificar que fetch funciona
fetch('/static/css/main.ecd4ebad.css')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', {
      'Content-Type': r.headers.get('content-type'),
      'Cache-Control': r.headers.get('cache-control')
    });
    return r.text();
  })
  .then(text => console.log('CSS Size:', text.length, 'bytes'))
  .catch(err => console.error('Error:', err));
```

**Resultado esperado:**
```
Status: 200
Headers: {Content-Type: "text/css", Cache-Control: "public, immutable"}
CSS Size: 52609 bytes
```

---

## 📝 Checklist de Diagnóstico

- [ ] DevTools Network muestra `main.ecd4ebad.css` con Status 200
- [ ] La URL es `/static/css/main.ecd4ebad.css`
- [ ] Console no muestra errores rojos
- [ ] El CSS fetch devuelve Status 200
- [ ] Los estilos se aplican en la página

---

## 🚨 Si Nada de Esto Ayuda

1. Fuerza limpieza de caché:
   - DevTools → Application → Clear Storage → Clear All
   - O en otro navegador/incógnito

2. Verifica que Railway haya redeployado:
   - Railway Dashboard → Logs
   - Busca "Compiled successfully" en logs de build
   - O busca "🚀 Iniciando nginx..."

3. Si los logs muestran error en build:
   - Probablemente hay un problema con `npm run build`
   - Ver logs completos en Railway

4. Verifica que el archivo CSS existe en el contenedor:
   - En Railway, no hay forma de acceder a shell
   - Pero puedes verificar via Network tab que se descarga

---

## 📊 Resumen Esperado

```
✅ index.html - Status 200
✅ main.js - Status 200 (from /static/js/)
✅ main.css - Status 200 (from /static/css/)
✅ /env/config.json - Status 200
✅ Página renderiza con estilos
```

Si ves todo esto, **los estilos deberían verse correctamente**.

