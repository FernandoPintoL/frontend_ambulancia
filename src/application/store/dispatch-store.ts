/**
 * Dispatch Store
 * Application Layer - State Management with Zustand
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Dispatch } from '../../data/repositories/dispatch-repository';
import { dispatchService } from '../services/dispatch-service';
import { dispatchRepository } from '../../data/repositories/dispatch-repository';

interface DispatchState {
  // State
  dispatches: Dispatch[];
  selectedDispatch: Dispatch | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    hours?: number;
  };

  // Actions
  loadDispatches: (status?: string, limit?: number) => Promise<void>;
  loadRecentDispatches: (hours?: number) => Promise<void>;
  selectDispatch: (dispatchId: string) => Promise<void>;
  createDispatch: (data: any) => Promise<any>;
  updateStatus: (dispatchId: string, status: string) => Promise<void>;
  completeDispatch: (dispatchId: string, feedback: any) => Promise<void>;
  setFilters: (filters: DispatchState['filters']) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDispatchStore = create<DispatchState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    dispatches: [],
    selectedDispatch: null,
    loading: false,
    error: null,
    filters: { hours: 24 },

    // Actions
    loadDispatches: async (status?: string, limit: number = 20) => {
      set({ loading: true, error: null });
      try {
        const dispatches = await dispatchRepository.listDispatches(status, limit);
        set({ dispatches });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    loadRecentDispatches: async (hours: number = 24) => {
      set({ loading: true, error: null });
      try {
        const overview = await dispatchService.getDispatchOverview(hours);
        set({ dispatches: overview.dispatches });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    selectDispatch: async (dispatchId: string) => {
      set({ loading: true, error: null });
      try {
        const dispatch = await dispatchService.getDispatchWithDetails(dispatchId);
        set({ selectedDispatch: dispatch as any });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    createDispatch: async (data: any) => {
      set({ loading: true, error: null });
      try {
        const result = await dispatchService.createDispatchWithPrediction(data);
        set((state) => ({
          dispatches: [result.dispatch, ...state.dispatches],
        }));
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        set({ error: errorMsg });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    updateStatus: async (dispatchId: string, status: string) => {
      set({ loading: true, error: null });
      try {
        const updated = await dispatchService.updateDispatchStatus(dispatchId, status);
        set((state) => ({
          dispatches: state.dispatches.map((d) => (d.id === dispatchId ? updated : d)),
          selectedDispatch:
            state.selectedDispatch?.id === dispatchId ? (updated as any) : state.selectedDispatch,
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    completeDispatch: async (dispatchId: string, feedback: any) => {
      set({ loading: true, error: null });
      try {
        await dispatchService.completeDispatch(dispatchId, feedback);
        set((state) => ({
          dispatches: state.dispatches.map((d) =>
            d.id === dispatchId ? { ...d, status: 'completed' } : d
          ),
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    setFilters: (filters: DispatchState['filters']) => {
      set({ filters: { ...get().filters, ...filters } });
    },

    clearError: () => set({ error: null }),

    reset: () => {
      set({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        filters: { hours: 24 },
      });
    },
  }))
);
