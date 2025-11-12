/**
 * Utility para acceder a variables de entorno
 * Soporta tanto REACT_APP_* en build time como window.ENV en runtime
 */

// Tipo para las variables de entorno disponibles
interface EnvironmentVariables {
  REACT_APP_GRAPHQL_URL: string;
  REACT_APP_AUTH_GRAPHQL_URL: string;
  REACT_APP_API_URL: string;
  REACT_APP_WS_URL: string;
  REACT_APP_ENV: 'development' | 'production' | 'staging';
  REACT_APP_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  GOOGLE_API_KEY: string;
}

// Extender window para que TypeScript reconozca window.ENV
declare global {
  interface Window {
    ENV?: Partial<EnvironmentVariables>;
  }
}

/**
 * Obtiene una variable de entorno
 * Primero intenta obtener desde window.ENV (inyectado en runtime por Docker)
 * Luego intenta desde process.env (build time)
 * Finalmente usa un valor por defecto
 */
export function getEnv<K extends keyof EnvironmentVariables>(
  key: K,
  defaultValue?: EnvironmentVariables[K]
): EnvironmentVariables[K] {
  // 1. Intentar obtener desde window.ENV (runtime - Docker)
  if (typeof window !== 'undefined' && window.ENV?.[key]) {
    return window.ENV[key] as EnvironmentVariables[K];
  }

  // 2. Intentar obtener desde process.env (build time)
  const processEnv = process.env[`REACT_APP_${key}`];
  if (processEnv) {
    return processEnv as EnvironmentVariables[K];
  }

  // 3. Usar valor por defecto o lanzar error
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(
    `Variable de entorno ${key} no encontrada. Asegúrate de que esté definida en .env o en el apartado environment del docker-compose.yml`
  );
}

/**
 * Obtiene todas las variables de entorno disponibles
 */
export function getAllEnv(): Partial<EnvironmentVariables> {
  return {
    ...(typeof window !== 'undefined' ? window.ENV : {}),
    REACT_APP_GRAPHQL_URL:
      getEnv('REACT_APP_GRAPHQL_URL', 'http://localhost:4000/graphql'),
    REACT_APP_AUTH_GRAPHQL_URL:
      getEnv('REACT_APP_AUTH_GRAPHQL_URL', 'http://localhost:8000/graphql'),
    REACT_APP_API_URL:
      getEnv('REACT_APP_API_URL', 'http://localhost:5000/api/v1'),
    REACT_APP_WS_URL:
      getEnv('REACT_APP_WS_URL', 'http://localhost:4004'),
    REACT_APP_ENV:
      getEnv('REACT_APP_ENV', 'development') as EnvironmentVariables['REACT_APP_ENV'],
    REACT_APP_LOG_LEVEL:
      getEnv('REACT_APP_LOG_LEVEL', 'debug') as EnvironmentVariables['REACT_APP_LOG_LEVEL'],
    GOOGLE_API_KEY: getEnv('GOOGLE_API_KEY', ''),
  };
}

/**
 * Hook de React para acceder a las variables de entorno
 */
export function useEnv<K extends keyof EnvironmentVariables>(
  key: K,
  defaultValue?: EnvironmentVariables[K]
): EnvironmentVariables[K] {
  return getEnv(key, defaultValue);
}
