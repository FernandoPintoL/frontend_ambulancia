// @ts-nocheck
/**
 * usePersonal Hook
 * Application Layer - Custom React Hook for Personal operations
 */

import { useCallback } from 'react';
import { usePersonalStore } from '../store/personal-store';
import { Personal, CreatePersonalInput, UpdatePersonalInput } from '../../data/repositories/personal-repository';

export interface UsePersonalResult {
  personales: Personal[];
  selectedPersonal: Personal | null;
  loading: boolean;
  error: string | null;
  filters: {
    rol?: string;
    estado?: string;
    disponibles?: boolean;
  };

  // Actions
  loadPersonales: (rol?: string, estado?: string, disponibles?: boolean) => Promise<void>;
  selectPersonal: (personalId: string) => Promise<void>;
  createPersonal: (data: CreatePersonalInput) => Promise<Personal>;
  updatePersonal: (data: UpdatePersonalInput) => Promise<Personal>;
  changePersonalStatus: (
    personalId: string,
    status: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones'
  ) => Promise<void>;
  setFilters: (filters: any) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook to manage personal/staff operations
 */
export const usePersonal = (): UsePersonalResult => {
  const {
    personales,
    selectedPersonal,
    loading,
    error,
    filters,
    loadPersonales,
    selectPersonal,
    createPersonal,
    updatePersonal,
    changePersonalStatus,
    setFilters,
    clearError,
    reset,
  } = usePersonalStore();

  const memoizedLoadPersonales = useCallback(
    (rol?: string, estado?: string, disponibles?: boolean) => {
      return loadPersonales(rol, estado, disponibles);
    },
    [loadPersonales]
  );

  const memoizedSelectPersonal = useCallback(
    (personalId: string) => {
      return selectPersonal(personalId);
    },
    [selectPersonal]
  );

  const memoizedCreatePersonal = useCallback(
    (data: CreatePersonalInput) => {
      return createPersonal(data);
    },
    [createPersonal]
  );

  const memoizedUpdatePersonal = useCallback(
    (data: UpdatePersonalInput) => {
      return updatePersonal(data);
    },
    [updatePersonal]
  );

  const memoizedChangePersonalStatus = useCallback(
    (personalId: string, status: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones') => {
      return changePersonalStatus(personalId, status);
    },
    [changePersonalStatus]
  );

  return {
    personales,
    selectedPersonal,
    loading,
    error,
    filters,
    loadPersonales: memoizedLoadPersonales,
    selectPersonal: memoizedSelectPersonal,
    createPersonal: memoizedCreatePersonal,
    updatePersonal: memoizedUpdatePersonal,
    changePersonalStatus: memoizedChangePersonalStatus,
    setFilters,
    clearError,
    reset,
  };
};
