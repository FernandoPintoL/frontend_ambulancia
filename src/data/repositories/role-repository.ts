// @ts-nocheck
/**
 * Role Repository
 * Data Layer - Role and Permission Management
 *
 * IMPORTANTE: Este repositorio usa el cliente Apollo Gateway compartido
 * El Gateway expone las queries/mutations de roles y permisos federados
 * No se conecta directamente a ms_autentificacion
 *
 * El token se maneja automáticamente por auth-store actualizando los headers globales
 */

import { gql } from 'graphql-request';
import { graphqlClient, updateGraphQLHeaders } from './graphql-client';

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
   *
   * Flujo:
   * 1. Frontend → Apollo Gateway (puerto 4000)
   * 2. Apollo Gateway valida token contra ms_autentificacion (puerto 8000)
   * 3. Apollo Gateway → ms_autentificacion (obtiene roles)
   * 4. Response retorna al frontend
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response: any = await graphqlClient.request(GET_ROLES);
      return response.roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get all permissions
   *
   * Mismo flujo que getRoles()
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response: any = await graphqlClient.request(GET_PERMISSIONS);
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
