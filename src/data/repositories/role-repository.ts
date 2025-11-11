// @ts-nocheck
/**
 * Role Repository
 * Data Layer - Role and Permission Management
 * Communicates with ms_autentificacion microservice
 */

import { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

/**
 * Create an authenticated GraphQL client with the current auth token
 */
export function getAuthenticatedGraphQLClient(): GraphQLClient {
  const client = new GraphQLClient(
    (process.env as any).REACT_APP_AUTH_GRAPHQL_URL || 'http://localhost:8000/graphql'
  );

  // Get token from localStorage
  const token = localStorage.getItem('auth_token');
  const tokenType = localStorage.getItem('auth_token_type') || 'Bearer';

  if (token) {
    client.setHeader('Authorization', `${tokenType} ${token}`);
  }

  return client;
}

// GraphQL Queries
const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      description
      permissions {
        id
        name
        description
      }
    }
  }
`;

const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions {
      id
      name
      description
    }
  }
`;

class RoleRepository {
  /**
   * Get all roles with their permissions
   */
  async getRoles(): Promise<Role[]> {
    try {
      const client = getAuthenticatedGraphQLClient();
      const response: any = await client.request(GET_ROLES);
      return response.roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const client = getAuthenticatedGraphQLClient();
      const response: any = await client.request(GET_PERMISSIONS);
      return response.permissions || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const roles = await this.getRoles();
      return roles.find((r) => r.id === roleId) || null;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }
}

export const roleRepository = new RoleRepository();
