// @ts-nocheck
/**
 * Dispatch Store
 * Application Layer - State Management with Zustand
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Dispatch } from '../../data/repositories/dispatch-repository';
import { dispatchService } from '../services/dispatch-service';
import { dispatchRepository } from '../../data/repositories/dispatch-repository';
import { websocketService } from '../../data/repositories/websocket-service';

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
  selectDispatch: (dispatchId: string | number) => Promise<void>;
  createDispatch: (data: any) => Promise<any>;
  updateStatus: (dispatchId: string | number, status: string) => Promise<void>;
  completeDispatch: (dispatchId: string | number, feedback: any) => Promise<void>;
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
    loadDispatches: async (estado?: string, limit: number = 50) => {
      set({ loading: true, error: null });
      try {
        const dispatches = await dispatchRepository.listDispatches(estado, limit);
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

    selectDispatch: async (dispatchId: string | number) => {
      set({ loading: true, error: null });
      try {
        const id = typeof dispatchId === 'string' ? parseInt(dispatchId) : dispatchId;
        const dispatch = await dispatchService.getDispatchWithDetails(id);
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

    updateStatus: async (dispatchId: string | number, status: string) => {
      set({ loading: true, error: null });
      try {
        const id = typeof dispatchId === 'string' ? parseInt(dispatchId) : dispatchId;
        const updated = await dispatchService.updateDispatchStatus(id, status);
        const idString = String(id);
        set((state) => ({
          dispatches: state.dispatches.map((d) => (d.id === idString ? updated : d)),
          selectedDispatch:
            state.selectedDispatch?.id === idString ? (updated as any) : state.selectedDispatch,
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        set({ loading: false });
      }
    },

    completeDispatch: async (dispatchId: string | number, feedback: any) => {
      set({ loading: true, error: null });
      try {
        const id = typeof dispatchId === 'string' ? parseInt(dispatchId) : dispatchId;
        await dispatchService.completeDispatch(id, feedback);
        const idString = String(id);
        set((state) => ({
          dispatches: state.dispatches.map((d) =>
            d.id === idString ? ({ ...d, status: 'completed' } as any) : d
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

/**
 * Initialize WebSocket listeners for real-time updates
 */
export const initializeWebSocketListeners = () => {
  // Listen for dispatch status changes
  websocketService.subscribe('dispatch_status_changed', (data: any) => {
    const { dispatchId, status } = data;
    useDispatchStore.setState((state) => ({
      dispatches: state.dispatches.map((d) => (d.id === dispatchId ? ({ ...d, status } as any) : d)),
      selectedDispatch: state.selectedDispatch?.id === dispatchId ? ({ ...state.selectedDispatch, status } as any) : state.selectedDispatch,
    }));
  });

  // Listen for dispatch completion
  websocketService.subscribe('dispatch_completed', (data: any) => {
    const { dispatchId } = data;
    useDispatchStore.setState((state) => ({
      dispatches: state.dispatches.map((d) => (d.id === dispatchId ? ({ ...d, status: 'completed' } as any) : d)),
      selectedDispatch: state.selectedDispatch?.id === dispatchId ? ({ ...state.selectedDispatch, status: 'completed' } as any) : state.selectedDispatch,
    }));
  });

  // Listen for new dispatches
  websocketService.subscribe('dispatch_created', (data: any) => {
    const { dispatch } = data;
    useDispatchStore.setState((state) => ({
      dispatches: [dispatch as any, ...state.dispatches],
    }));
  });

  // Listen for ambulance location updates
  websocketService.subscribe('ambulance_location_updated', (data: any) => {
    const { ambulanceId, location } = data;
    useDispatchStore.setState((state) => {
      if (!state.selectedDispatch?.ambulance || state.selectedDispatch.ambulance.id !== ambulanceId) {
        return {};
      }

      return {
        selectedDispatch: {
          ...state.selectedDispatch,
          ambulance: {
            ...state.selectedDispatch.ambulance,
            currentLocation: location,
          },
        } as any,
      };
    });
  });

  console.log('WebSocket listeners initialized');
};
