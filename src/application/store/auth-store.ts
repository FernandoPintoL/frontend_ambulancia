/**
 * Auth Store
 * Application Layer - Authentication State Management with Zustand
 */

import { create } from 'zustand';
import { authRepository, User as RepositoryUser } from '../../data/repositories/auth-repository';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: string;
  roles: Array<{ id: string; name: string }>;
  permissions: Array<{ id: string; name: string }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWhatsApp: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null, tokenType?: string | null, expiresAt?: string | null) => void;
  clearError: () => void;
}

const TOKEN_KEY = 'auth_token';
const TOKEN_TYPE_KEY = 'auth_token_type';
const EXPIRES_AT_KEY = 'auth_expires_at';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem(TOKEN_KEY),
  tokenType: localStorage.getItem(TOKEN_TYPE_KEY),
  expiresAt: localStorage.getItem(EXPIRES_AT_KEY),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authRepository.login(email, password);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Convertir usuario del repositorio al formato de la app
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        phone: response.user.phone,
        status: response.user.status,
        roles: response.user.roles,
        permissions: response.user.permissions,
      };

      // Guardar en localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(TOKEN_TYPE_KEY, response.tokenType);
      localStorage.setItem(EXPIRES_AT_KEY, response.expiresAt || '');
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        user,
        token: response.token,
        tokenType: response.tokenType,
        expiresAt: response.expiresAt || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loginWhatsApp: async (phone: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authRepository.loginWhatsApp(phone);

      if (!response.success) {
        throw new Error(response.message || 'WhatsApp login failed');
      }

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        phone: response.user.phone,
        status: response.user.status,
        roles: response.user.roles,
        permissions: response.user.permissions,
      };

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(TOKEN_TYPE_KEY, response.tokenType);
      localStorage.setItem(EXPIRES_AT_KEY, response.expiresAt || '');
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        user,
        token: response.token,
        tokenType: response.tokenType,
        expiresAt: response.expiresAt || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WhatsApp login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const token = get().token;
      if (token) {
        try {
          await authRepository.logout(token);
        } catch (error) {
          // Si el logout falla en el servidor, igual limpiamos localStorage
          console.error('Logout error:', error);
        }
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_TYPE_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
      localStorage.removeItem(USER_KEY);

      set({ user: null, token: null, tokenType: null, expiresAt: null, error: null });
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user });
  },

  setToken: (token: string | null, tokenType: string | null = null, expiresAt: string | null = null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      if (tokenType) localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
      if (expiresAt) localStorage.setItem(EXPIRES_AT_KEY, expiresAt);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_TYPE_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
    }
    set({ token, tokenType, expiresAt });
  },

  clearError: () => set({ error: null }),
}));
