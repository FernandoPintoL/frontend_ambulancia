# Ejemplos de Uso - Variables de Entorno

## Ejemplo 1: Componente de Mapa con Google API Key

### Archivo: `src/presentation/components/MapWithApiKey.tsx`

```typescript
import React, { useEffect } from 'react';
import { useEnv } from '@/utils/env';
import toast from 'react-hot-toast';

interface MapWithApiKeyProps {
  onMapReady?: () => void;
}

export function MapWithApiKey({ onMapReady }: MapWithApiKeyProps) {
  const googleApiKey = useEnv('GOOGLE_API_KEY', '');

  useEffect(() => {
    // Validar que la API key está configurada
    if (!googleApiKey) {
      toast.error('Google API Key no está configurada');
      return;
    }

    // Cargar Google Maps script con la API key
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      onMapReady?.();
      toast.success('Google Maps cargado correctamente');
    };
    script.onerror = () => {
      toast.error('Error cargando Google Maps. Verifica la API Key.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [googleApiKey, onMapReady]);

  return (
    <div>
      {googleApiKey ? (
        <div id="map" style={{ width: '100%', height: '500px' }}></div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            ⚠️ Google API Key no configurada.
            Agrega GOOGLE_API_KEY a tu .env
          </p>
        </div>
      )}
    </div>
  );
}
```

## Ejemplo 2: Hook personalizado para la configuración de GraphQL

### Archivo: `src/application/hooks/useApiConfig.ts`

```typescript
import { useEnv } from '@/utils/env';

export function useApiConfig() {
  const graphqlUrl = useEnv('REACT_APP_GRAPHQL_URL');
  const authGraphqlUrl = useEnv('REACT_APP_AUTH_GRAPHQL_URL');
  const apiUrl = useEnv('REACT_APP_API_URL');
  const wsUrl = useEnv('REACT_APP_WS_URL');
  const env = useEnv('REACT_APP_ENV');
  const logLevel = useEnv('REACT_APP_LOG_LEVEL');

  return {
    graphqlUrl,
    authGraphqlUrl,
    apiUrl,
    wsUrl,
    env,
    logLevel,
    isProduction: env === 'production',
    isDevelopment: env === 'development',
  };
}

// Uso en componentes:
export function MyComponent() {
  const { graphqlUrl, isProduction } = useApiConfig();

  if (isProduction) {
    console.log('Running in production with API:', graphqlUrl);
  }

  return <div>...</div>;
}
```

## Ejemplo 3: Cliente Apollo configurado dinámicamente

### Archivo: `src/data/repositories/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { useEnv } from '@/utils/env';

export function createApolloClient() {
  // Obtener URL de GraphQL desde variables de entorno
  const graphqlUrl = useEnv(
    'REACT_APP_GRAPHQL_URL',
    'http://localhost:4000/graphql'
  );

  console.log('Creating Apollo Client with URL:', graphqlUrl);

  const httpLink = new HttpLink({
    uri: graphqlUrl,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
}
```

## Ejemplo 4: Service de Mapas con variables dinámicas

### Archivo: `src/data/repositories/google-maps-service.ts` (Actualizado)

```typescript
import { useEnv } from '@/utils/env';

export class GoogleMapsService {
  private static apiKey: string;

  static initialize() {
    // Obtener API Key en el tiempo de ejecución
    try {
      GoogleMapsService.apiKey = useEnv('GOOGLE_API_KEY', '');
    } catch (e) {
      console.warn('GOOGLE_API_KEY not configured', e);
      GoogleMapsService.apiKey = '';
    }
  }

  static getApiKey(): string {
    return GoogleMapsService.apiKey;
  }

  static createMarkerIconUrl(color: string, label: string): string {
    // Crear ícono de marcador personalizado
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23${color}">
      <path d="M12 0C7.6 0 4 3.6 4 8c0 5 8 16 8 16s8-11 8-16c0-4.4-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
      <text x="12" y="14" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${label}</text>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  static calculateDistance(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Inicializar cuando la app arranca
GoogleMapsService.initialize();
```

## Ejemplo 5: Componente de Configuración con Validación

### Archivo: `src/presentation/components/ConfigValidator.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useEnv, getAllEnv } from '@/utils/env';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ConfigValidator() {
  const [configStatus, setConfigStatus] = useState<
    Record<string, { configured: boolean; value: string }>
  >({});

  useEffect(() => {
    const env = getAllEnv();
    const status: typeof configStatus = {};

    // Validar cada variable
    const requiredVars: (keyof typeof env)[] = [
      'REACT_APP_GRAPHQL_URL',
      'REACT_APP_AUTH_GRAPHQL_URL',
      'REACT_APP_API_URL',
      'GOOGLE_API_KEY',
    ];

    requiredVars.forEach((key) => {
      const value = env[key] as string;
      status[key] = {
        configured: !!value && value.length > 0,
        value: value || '(no configurada)',
      };
    });

    setConfigStatus(status);

    // Log de configuración
    console.group('Configuration Status');
    Object.entries(status).forEach(([key, { configured, value }]) => {
      console.log(`${key}: ${configured ? '✓' : '✗'} ${value}`);
    });
    console.groupEnd();
  }, []);

  const allConfigured = Object.values(configStatus).every((s) => s.configured);

  return (
    <div className="mt-4 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        {allConfigured ? (
          <>
            <CheckCircle2 className="text-green-600" size={20} />
            <h3 className="font-semibold text-green-900">Configuración OK</h3>
          </>
        ) : (
          <>
            <AlertCircle className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-yellow-900">
              Faltan variables de configuración
            </h3>
          </>
        )}
      </div>

      <ul className="space-y-2 text-sm">
        {Object.entries(configStatus).map(([key, { configured, value }]) => (
          <li key={key} className="flex items-center gap-2">
            <span className={configured ? 'text-green-600' : 'text-yellow-600'}>
              {configured ? '✓' : '✗'}
            </span>
            <code className="text-xs font-mono">{key}</code>
            {configured && (
              <span className="text-gray-600 truncate">
                ({value.substring(0, 30)}...)
              </span>
            )}
          </li>
        ))}
      </ul>

      {!allConfigured && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <p>Algunas variables no están configuradas.</p>
          <p>Verifica tu archivo .env o docker-compose.yml</p>
        </div>
      )}
    </div>
  );
}
```

## Ejemplo 6: Inicialización en el App principal

### Archivo: `src/presentation/App.tsx` (Fragmento)

```typescript
import { useEffect } from 'react';
import { getAllEnv } from '@/utils/env';
import { GoogleMapsService } from '@/data/repositories/google-maps-service';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/data/repositories/apollo-client';

function App() {
  useEffect(() => {
    // Log de configuración al inicio
    const env = getAllEnv();
    console.log('Frontend Environment:', {
      env: env.REACT_APP_ENV,
      graphqlUrl: env.REACT_APP_GRAPHQL_URL,
      apiUrl: env.REACT_APP_API_URL,
      hasGoogleApiKey: !!env.GOOGLE_API_KEY,
    });

    // Inicializar servicios
    GoogleMapsService.initialize();
  }, []);

  const apolloClient = createApolloClient();

  return (
    <ApolloProvider client={apolloClient}>
      {/* Tu aplicación */}
    </ApolloProvider>
  );
}

export default App;
```

## Checklist de Integración

- [ ] Copia `useEnv` hook desde `src/utils/env.ts`
- [ ] Reemplaza hardcoded URLs con `useEnv('REACT_APP_...')`
- [ ] Actualiza `index.html` con `<script src="%PUBLIC_URL%/env.js"></script>`
- [ ] Verifica `docker-entrypoint.sh` está en el Dockerfile
- [ ] Agrega variables a `docker-compose.yml` en sección `environment`
- [ ] Prueba con `docker exec frontend cat /usr/share/nginx/html/env.js`
- [ ] Verifica en navegador: `console.log(window.ENV)`

## Testing

### Test de variables de entorno

```typescript
// src/__tests__/utils/env.test.ts
import { getEnv, useEnv } from '@/utils/env';

describe('Environment Variables', () => {
  beforeEach(() => {
    // Setup window.ENV para tests
    window.ENV = {
      REACT_APP_GRAPHQL_URL: 'http://test:4000/graphql',
      GOOGLE_API_KEY: 'test-key-123',
    };
  });

  test('getEnv debe retornar valor desde window.ENV', () => {
    const url = getEnv('REACT_APP_GRAPHQL_URL');
    expect(url).toBe('http://test:4000/graphql');
  });

  test('getEnv debe usar default si no existe', () => {
    const missing = getEnv('REACT_APP_MISSING', 'default-value');
    expect(missing).toBe('default-value');
  });

  test('getEnv debe lanzar error si no existe y no hay default', () => {
    expect(() => getEnv('REACT_APP_MISSING')).toThrow();
  });

  test('getEnv debe priorizar window.ENV sobre process.env', () => {
    process.env.REACT_APP_GRAPHQL_URL = 'http://process:4000';
    window.ENV!.REACT_APP_GRAPHQL_URL = 'http://window:4000';

    const url = getEnv('REACT_APP_GRAPHQL_URL');
    expect(url).toBe('http://window:4000'); // window.ENV tiene prioridad
  });
});
```

## Debugging

### Ver variables en el navegador

```javascript
// Abre DevTools Console y ejecuta:
console.log(window.ENV);
```

### Ver variables en el contenedor

```bash
# Ver el archivo generado
docker exec frontend cat /usr/share/nginx/html/env.js

# Ver las variables de entorno del contenedor
docker exec frontend env | grep REACT_APP
```

### Ver logs del entrypoint

```bash
# Ver los logs del contenedor al iniciar
docker-compose logs -f frontend | head -20
```
