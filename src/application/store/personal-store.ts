/**
 * Personal Store
 * Application Layer - State Management with Zustand
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Personal, CreatePersonalInput, UpdatePersonalInput } from '../../data/repositories/personal-repository';
import { personalRepository } from '../../data/repositories/personal-repository';
import { websocketService } from '../../data/repositories/websocket-service';

interface PersonalState {
  // State
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
  setFilters: (filters: PersonalState['filters']) => void;
  clearError: () => void;
  reset: () => void;
}

export const usePersonalStore = create<PersonalState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    personales: [],
    selectedPersonal: null,
    loading: false,
    error: null,
    filters: {},

    // Actions
    loadPersonales: async (rol?: string, estado?: string, disponibles?: boolean) => {
      set({ loading: true, error: null });
      try {
        const personales = await personalRepository.listPersonales(rol, estado, disponibles);
        set({ personales, filters: { rol, estado, disponibles } });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    selectPersonal: async (personalId: string) => {
      set({ loading: true, error: null });
      try {
        const selectedPersonal = await personalRepository.getPersonal(personalId);
        set({ selectedPersonal });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    createPersonal: async (data: CreatePersonalInput) => {
      set({ loading: true, error: null });
      try {
        const newPersonal = await personalRepository.createPersonal(data);
        set((state) => ({
          personales: [newPersonal, ...state.personales],
        }));
        return newPersonal;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        set({ error: errorMsg });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    updatePersonal: async (data: UpdatePersonalInput) => {
      set({ loading: true, error: null });
      try {
        const updated = await personalRepository.updatePersonal(data);
        set((state) => ({
          personales: state.personales.map((p) => (p.id === updated.id ? updated : p)),
          selectedPersonal:
            state.selectedPersonal?.id === updated.id ? (updated as any) : state.selectedPersonal,
        }));
        return updated;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    changePersonalStatus: async (personalId: string, status: string) => {
      set({ loading: true, error: null });
      try {
        const updated = await personalRepository.changePersonalStatus(personalId, status as any);
        set((state) => ({
          personales: state.personales.map((p) => (p.id === updated.id ? updated : p)),
          selectedPersonal:
            state.selectedPersonal?.id === updated.id ? (updated as any) : state.selectedPersonal,
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    setFilters: (filters: PersonalState['filters']) => {
      set((state) => ({ filters: { ...state.filters, ...filters } }));
    },

    clearError: () => set({ error: null }),

    reset: () => {
      set({
        personales: [],
        selectedPersonal: null,
        loading: false,
        error: null,
        filters: {},
      });
    },
  }))
);

/**
 * Initialize WebSocket listeners for real-time personal updates
 */
export const initializeWebSocketListenersPersonal = () => {
  // Listen for new personal created
  websocketService.subscribe('personal_created', (data: any) => {
    const { personal } = data;
    usePersonalStore.setState((state) => ({
      personales: [personal, ...state.personales],
    }));
  });

  // Listen for personal updated
  websocketService.subscribe('personal_updated', (data: any) => {
    const { personal } = data;
    usePersonalStore.setState((state) => ({
      personales: state.personales.map((p) => (p.id === personal.id ? personal : p)),
      selectedPersonal: state.selectedPersonal?.id === personal.id ? (personal as any) : state.selectedPersonal,
    }));
  });

  // Listen for personal status changed
  websocketService.subscribe('personal_status_changed', (data: any) => {
    const { personalId, estado } = data;
    usePersonalStore.setState((state) => ({
      personales: state.personales.map((p) =>
        p.id === personalId ? { ...p, estado } as any : p
      ),
      selectedPersonal:
        state.selectedPersonal?.id === personalId
          ? { ...state.selectedPersonal, estado } as any
          : state.selectedPersonal,
    }));
  });

  console.log('Personal WebSocket listeners initialized');
};
