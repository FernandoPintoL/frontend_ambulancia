// @ts-nocheck
/**
 * GraphQL Client Configuration
 * Data Layer - API Communication
 */

import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:5000/graphql';

/**
 * GraphQL client instance
 * Handles all GraphQL requests to backend
 */
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

/**
 * Update GraphQL client headers (e.g., for authentication token)
 */
export const updateGraphQLHeaders = (headers: Record<string, string>) => {
  graphqlClient.setHeader('Authorization', headers.Authorization || '');
};

/**
 * Get current GraphQL endpoint
 */
export const getGraphQLEndpoint = (): string => {
  return GRAPHQL_ENDPOINT;
};

export default graphqlClient;
