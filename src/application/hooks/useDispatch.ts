/**
 * useDispatch Hook
 * Application Layer - Custom React Hook for dispatch operations
 */

import { useCallback, useState } from 'react';
import { useDispatchStore } from '@store/dispatch-store';
import { Dispatch } from '@repositories/dispatch-repository';

/**
 * Hook to manage dispatch operations
 */
export const useDispatch = () => {
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    dispatches,
    selectedDispatch,
    loading,
    error,
    loadDispatches,
    loadRecentDispatches,
    selectDispatch,
    createDispatch,
    updateStatus,
    completeDispatch,
    setFilters,
    clearError,
    reset,
  } = useDispatchStore();

  // Wrap store actions with error handling
  const safeLoadDispatches = useCallback(
    async (status?: string, limit?: number) => {
      try {
        setLocalError(null);
        await loadDispatches(status, limit);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dispatches';
        setLocalError(message);
      }
    },
    [loadDispatches]
  );

  const safeLoadRecentDispatches = useCallback(
    async (hours?: number) => {
      try {
        setLocalError(null);
        await loadRecentDispatches(hours);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load recent dispatches';
        setLocalError(message);
      }
    },
    [loadRecentDispatches]
  );

  const safeSelectDispatch = useCallback(
    async (dispatchId: string) => {
      try {
        setLocalError(null);
        await selectDispatch(dispatchId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dispatch details';
        setLocalError(message);
      }
    },
    [selectDispatch]
  );

  const safeCreateDispatch = useCallback(
    async (data: any) => {
      try {
        setLocalError(null);
        return await createDispatch(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create dispatch';
        setLocalError(message);
        throw err;
      }
    },
    [createDispatch]
  );

  const safeUpdateStatus = useCallback(
    async (dispatchId: string, status: string) => {
      try {
        setLocalError(null);
        await updateStatus(dispatchId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update dispatch status';
        setLocalError(message);
      }
    },
    [updateStatus]
  );

  const safeCompleteDispatch = useCallback(
    async (dispatchId: string, feedback: any) => {
      try {
        setLocalError(null);
        await completeDispatch(dispatchId, feedback);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete dispatch';
        setLocalError(message);
      }
    },
    [completeDispatch]
  );

  return {
    // State
    dispatches,
    selectedDispatch,
    loading,
    error: error || localError,

    // Actions
    loadDispatches: safeLoadDispatches,
    loadRecentDispatches: safeLoadRecentDispatches,
    selectDispatch: safeSelectDispatch,
    createDispatch: safeCreateDispatch,
    updateStatus: safeUpdateStatus,
    completeDispatch: safeCompleteDispatch,
    setFilters,

    // Utilities
    clearError,
    reset,
  };
};
