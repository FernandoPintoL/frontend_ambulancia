// @ts-nocheck
/**
 * Auth Repository
 * Data Layer - Authentication API communication
 *
 * IMPORTANTE: Este repositorio usa el cliente Apollo Gateway compartido
 * El Gateway expone los mutations/queries de autenticación federados
 * No se conecta directamente a ms_autentificacion
 */

import { gql } from 'graphql-request';
import { graphqlClient, updateGraphQLHeaders } from './graphql-client';

// ============================================================
// QUERIES
// ============================================================

export const VALIDATE_TOKEN = gql`
  query ValidateToken($token: String!) {
    validateToken(token: $token) {
      isValid
      expiresAt
      userId
      message
    }
  }
`;

// ============================================================
// MUTATIONS
// ============================================================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      token
      tokenType
      expiresAt
      user {
        id
        name
        email
        phone
        status
        roles {
          id
          name
          description
        }
        permissions {
          id
          name
          description
        }
      }
      permissions {
        id
        name
        description
      }
    }
  }
`;

export const LOGIN_WHATSAPP_MUTATION = gql`
  mutation LoginWhatsApp($phone: String!) {
    loginWhatsApp(phone: $phone) {
      success
      message
      token
      tokenType
      expiresAt
      user {
        id
        name
        email
        phone
        status
        roles {
          id
          name
        }
        permissions {
          id
          name
        }
      }
      isNewUser
      requiresSetup
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      success
      message
      token
      tokenType
      expiresAt
      user {
        id
        name
        email
        roles {
          name
        }
        permissions {
          name
        }
      }
      permissions {
        id
        name
      }
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    token: string;
    tokenType: string;
    expiresAt: string;
    user: User;
    permissions: Permission[];
  };
}

export interface LoginWhatsAppResponse {
  loginWhatsApp: {
    success: boolean;
    message: string;
    token: string;
    tokenType: string;
    expiresAt: string;
    user: User;
    isNewUser: boolean;
    requiresSetup: boolean;
  };
}

export interface LogoutResponse {
  logout: {
    success: boolean;
    message: string;
  };
}

export interface RefreshTokenResponse {
  refreshToken: {
    success: boolean;
    message: string;
    token: string;
    tokenType: string;
    expiresAt: string;
    user: User;
    permissions: Permission[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

// ============================================================
// API METHODS
// ============================================================

/**
 * Extrae el mensaje de error más amigable de errores de GraphQL
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Si es un error de GraphQL de graphql-request
    const message = error.message;

    // Buscar mensaje de validación (ej: "La contraseña es incorrecta.")
    const validationMatch = message.match(/("message":"([^"]+)")/);
    if (validationMatch) {
      return validationMatch[2];
    }

    // Si contiene "response" en el mensaje, extraer la parte principal
    if (message.includes('Response to preflight request')) {
      return 'Error de conexión: El servidor no permitió la solicitud (CORS)';
    }

    // Fallback: retornar el mensaje del error
    return message;
  }

  return 'An error occurred';
}

export const authRepository = {
  /**
   * Login con email y contraseña
   *
   * Flujo:
   * 1. Frontend → Apollo Gateway (puerto 4000)
   * 2. Apollo Gateway → ms_autentificacion (puerto 8000, interno)
   * 3. ms_autentificacion retorna token Sanctum
   * 4. Token se guarda en localStorage
   * 5. Futuras requests incluyen token en Authorization header
   */
  async login(email: string, password: string): Promise<LoginResponse['login']> {
    try {
      const response = await graphqlClient.request<LoginResponse>(
        LOGIN_MUTATION,
        { email, password }
      );
      return response.login;
    } catch (error) {
      const message = extractErrorMessage(error);
      const err = new Error(message);
      throw err;
    }
  },

  /**
   * Login con WhatsApp (número de teléfono)
   * Mismo flujo que login() pero con numero de teléfono
   */
  async loginWhatsApp(phone: string): Promise<LoginWhatsAppResponse['loginWhatsApp']> {
    try {
      const response = await graphqlClient.request<LoginWhatsAppResponse>(
        LOGIN_WHATSAPP_MUTATION,
        { phone }
      );
      return response.loginWhatsApp;
    } catch (error) {
      const message = extractErrorMessage(error);
      const err = new Error(message);
      throw err;
    }
  },

  /**
   * Logout - revoca el token
   *
   * El token se envía en el header Authorization
   * Apollo Gateway lo valida y lo pasa a ms_autentificacion
   */
  async logout(token: string): Promise<LogoutResponse['logout']> {
    try {
      // Actualizar headers del cliente compartido con el token
      updateGraphQLHeaders({ Authorization: `Bearer ${token}` });

      const response = await graphqlClient.request<LogoutResponse>(LOGOUT_MUTATION);

      // Limpiar el header después
      updateGraphQLHeaders({ Authorization: '' });

      return response.logout;
    } catch (error) {
      const message = extractErrorMessage(error);
      const err = new Error(message);
      throw err;
    }
  },

  /**
   * Refrescar token
   *
   * Solicita un nuevo token al Gateway
   * El Gateway valida el token antiguo contra ms_autentificacion
   */
  async refreshToken(token: string): Promise<RefreshTokenResponse['refreshToken']> {
    try {
      const response = await graphqlClient.request<RefreshTokenResponse>(
        REFRESH_TOKEN_MUTATION,
        { token }
      );
      return response.refreshToken;
    } catch (error) {
      const message = extractErrorMessage(error);
      const err = new Error(message);
      throw err;
    }
  },

  /**
   * Validar token
   *
   * El token se envía como parámetro en la query
   * Apollo Gateway lo valida contra ms_autentificacion
   */
  async validateToken(token: string) {
    try {
      const response = await graphqlClient.request<any>(VALIDATE_TOKEN, { token });
      return response.validateToken;
    } catch (error) {
      const message = extractErrorMessage(error);
      const err = new Error(message);
      throw err;
    }
  },
};
