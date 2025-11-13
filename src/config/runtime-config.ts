/**
 * Runtime Configuration Loader
 * Carga variables de configuración en runtime para ambientes Docker/Railway
 *
 * Orden de precedencia:
 * 1. Variables cargadas desde /env/config.json (Docker runtime)
 * 2. process.env (variables de compilación)
 * 3. Valores por defecto
 */

interface RuntimeConfig {
  REACT_APP_GRAPHQL_URL: string;
  REACT_APP_WS_URL: string;
  GOOGLE_API_KEY: string;
  REACT_APP_AUTH_GRAPHQL_URL?: string;
  REACT_APP_API_URL?: string;
  REACT_APP_ENV?: string;
}

let runtimeConfig: RuntimeConfig | null = null;

/**
 * Cargar configuración desde /env/config.json (Docker runtime)
 * Este archivo es generado por docker-entrypoint.sh en contenedor
 */
async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Si ya fue cargado, devolverlo en caché
  if (runtimeConfig) {
    return runtimeConfig;
  }

  const config: RuntimeConfig = {
    REACT_APP_GRAPHQL_URL: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:4004',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  };

  // Intenta cargar desde archivo de configuración Docker
  try {
    const response = await fetch('/env/config.json');
    if (response.ok) {
      const dockerConfig = await response.json();
      console.log('✅ Config cargada desde Docker: /env/config.json');

      // Mezclar configuración Docker con la del build (Docker override)
      runtimeConfig = {
        ...config,
        ...dockerConfig,
      };

      return runtimeConfig;
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar config.json de Docker, usando variables de build');
  }

  // Si no hay config de Docker, usar la del build
  runtimeConfig = config;
  return runtimeConfig;
}

/**
 * Obtener variable de configuración
 */
export function getConfig(key: keyof RuntimeConfig): string {
  if (!runtimeConfig) {
    throw new Error(
      `Configuración no cargada. Llama a 'loadRuntimeConfig()' primero en index.tsx`
    );
  }

  const value = runtimeConfig[key];

  if (!value) {
    console.warn(`⚠️ Variable ${key} no configurada, usando default`);
  }

  return value || '';
}

/**
 * Obtener toda la configuración
 */
export function getAllConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    throw new Error(
      `Configuración no cargada. Llama a 'loadRuntimeConfig()' primero`
    );
  }

  return runtimeConfig;
}

/**
 * Inicializar configuración
 * DEBE ser llamado antes de renderizar la app en index.tsx
 */
export async function initializeConfig(): Promise<RuntimeConfig> {
  const config = await loadRuntimeConfig();

  console.log('🔧 Configuración cargada:', {
    REACT_APP_GRAPHQL_URL: config.REACT_APP_GRAPHQL_URL,
    REACT_APP_WS_URL: config.REACT_APP_WS_URL,
    GOOGLE_API_KEY: config.GOOGLE_API_KEY ? '***' : 'NO CONFIGURADO',
  });

  return config;
}

export type { RuntimeConfig };
