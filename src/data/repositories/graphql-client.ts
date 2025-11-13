// @ts-nocheck
/**
 * GraphQL Client Configuration
 * Data Layer - API Communication
 *
 * IMPORTANTE: Usa getConfig() para obtener la URL de runtime
 * Esto permite que funcione con variables de entorno inyectadas por Docker
 */

import { GraphQLClient } from 'graphql-request';
import { getConfig } from '../../config/runtime-config';

let graphqlClientInstance: GraphQLClient | null = null;

/**
 * Inicializar el cliente GraphQL con la URL de runtime
 * Se llama automáticamente por index.tsx antes de renderizar la app
 */
export function initGraphQLClient(): GraphQLClient {
  if (graphqlClientInstance) {
    return graphqlClientInstance;
  }

  // Obtener URL de GraphQL desde configuración runtime (Docker o build)
  const GRAPHQL_ENDPOINT = getConfig('REACT_APP_GRAPHQL_URL');

  console.log(`📡 GraphQL Client inicializado con endpoint: ${GRAPHQL_ENDPOINT}`);

  graphqlClientInstance = new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return graphqlClientInstance;
}

/**
 * Obtener cliente GraphQL (debe estar inicializado primero)
 */
export function getGraphQLClient(): GraphQLClient {
  if (!graphqlClientInstance) {
    console.error('❌ GraphQL Client no inicializado. Verifica que index.tsx llame a initializeConfig()');
    throw new Error('GraphQL Client not initialized');
  }
  return graphqlClientInstance;
}

/**
 * GraphQL client instance - retrocompatibilidad con código existente
 * Usar getGraphQLClient() en su lugar
 */
export const graphqlClient = new Proxy({}, {
  get: () => {
    return getGraphQLClient();
  },
}) as any;

/**
 * Update GraphQL client headers (e.g., for authentication token)
 */
export const updateGraphQLHeaders = (headers: Record<string, string>) => {
  const client = getGraphQLClient();
  client.setHeader('Authorization', headers.Authorization || '');
};

/**
 * Get current GraphQL endpoint
 */
export const getGraphQLEndpoint = (): string => {
  return getConfig('REACT_APP_GRAPHQL_URL');
};

export default graphqlClient;
