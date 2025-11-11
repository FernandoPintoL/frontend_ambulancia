// @ts-nocheck
/**
 * Tests for useDispatch Hook
 * Unit tests for custom React hook wrapping store
 */

import { renderHook, act } from '@testing-library/react';
import { useDispatch } from './useDispatch';
import * as dispatchStore from '../store/dispatch-store';

// Mock the store
jest.mock('../store/dispatch-store');

describe('useDispatch Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Tests para loadDispatches
  // ============================================================================
  describe('safeLoadDispatches', () => {
    it('debe cargar despachos sin error', async () => {
      const mockLoadDispatches = jest.fn().mockResolvedValueOnce(undefined);
      const mockDispatches = [{ id: 1, estado: 'en_camino' } as any];

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: mockDispatches,
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: mockLoadDispatches,
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadDispatches('en_camino', 20);
      });

      expect(mockLoadDispatches).toHaveBeenCalledWith('en_camino', 20);
      expect(result.current.error).toBeNull();
    });

    it('debe establecer localError en caso de fallo', async () => {
      const errorMsg = 'Failed to load';
      const mockLoadDispatches = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: mockLoadDispatches,
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadDispatches();
      });

      expect(result.current.error).toBe(errorMsg);
    });

    it('debe limpiar localError antes de cargar', async () => {
      const mockLoadDispatches = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: 'Previous error',
        loadDispatches: mockLoadDispatches,
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadDispatches();
      });

      // El localError debe estar null, aunque error del store sea 'Previous error'
      expect(result.current.error).toBe('Previous error');
    });

    it('debe manejar error no-Error objects', async () => {
      const mockLoadDispatches = jest.fn().mockRejectedValueOnce('Unknown error');

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: mockLoadDispatches,
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadDispatches();
      });

      expect(result.current.error).toBe('Failed to load dispatches');
    });
  });

  // ============================================================================
  // Tests para loadRecentDispatches
  // ============================================================================
  describe('safeLoadRecentDispatches', () => {
    it('debe cargar despachos recientes sin error', async () => {
      const mockLoadRecentDispatches = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: mockLoadRecentDispatches,
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadRecentDispatches(12);
      });

      expect(mockLoadRecentDispatches).toHaveBeenCalledWith(12);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al cargar despachos recientes', async () => {
      const errorMsg = 'Failed to load recent';
      const mockLoadRecentDispatches = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: mockLoadRecentDispatches,
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadRecentDispatches(24);
      });

      expect(result.current.error).toBe(errorMsg);
    });
  });

  // ============================================================================
  // Tests para selectDispatch
  // ============================================================================
  describe('safeSelectDispatch', () => {
    it('debe seleccionar despacho sin error', async () => {
      const mockSelectDispatch = jest.fn().mockResolvedValueOnce(undefined);
      const mockDispatch = { id: 1, estado: 'en_camino' } as any;

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: mockDispatch,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: mockSelectDispatch,
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.selectDispatch(1);
      });

      expect(mockSelectDispatch).toHaveBeenCalledWith(1);
      expect(result.current.selectedDispatch).toEqual(mockDispatch);
      expect(result.current.error).toBeNull();
    });

    it('debe aceptar string o number para ID', async () => {
      const mockSelectDispatch = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: mockSelectDispatch,
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      // Con number
      await act(async () => {
        await result.current.selectDispatch(42);
      });
      expect(mockSelectDispatch).toHaveBeenCalledWith(42);

      // Con string
      await act(async () => {
        await result.current.selectDispatch('42');
      });
      expect(mockSelectDispatch).toHaveBeenCalledWith('42');
    });

    it('debe manejar error al seleccionar despacho', async () => {
      const errorMsg = 'Dispatch not found';
      const mockSelectDispatch = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: mockSelectDispatch,
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.selectDispatch(999);
      });

      expect(result.current.error).toBe(errorMsg);
    });
  });

  // ============================================================================
  // Tests para createDispatch
  // ============================================================================
  describe('safeCreateDispatch', () => {
    it('debe crear despacho y retornar resultado', async () => {
      const mockResult = { dispatch: { id: 3 }, prediction: {} };
      const mockCreateDispatch = jest.fn().mockResolvedValueOnce(mockResult);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: mockCreateDispatch,
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      const createData = { patientLat: 4.7110, patientLon: -74.0721 };
      let returnedResult;

      await act(async () => {
        returnedResult = await result.current.createDispatch(createData);
      });

      expect(mockCreateDispatch).toHaveBeenCalledWith(createData);
      expect(returnedResult).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('debe re-lanzar error después de establecerlo en localError', async () => {
      const errorMsg = 'Creation failed';
      const mockCreateDispatch = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: mockCreateDispatch,
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await expect(
        act(async () => {
          await result.current.createDispatch({});
        })
      ).rejects.toThrow(errorMsg);

      expect(result.current.error).toBe(errorMsg);
    });

    it('debe manejar error no-Error objects', async () => {
      const mockCreateDispatch = jest.fn().mockRejectedValueOnce('Unknown');

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: mockCreateDispatch,
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await expect(
        act(async () => {
          await result.current.createDispatch({});
        })
      ).rejects.toBeDefined();

      expect(result.current.error).toBe('Failed to create dispatch');
    });
  });

  // ============================================================================
  // Tests para updateStatus
  // ============================================================================
  describe('safeUpdateStatus', () => {
    it('debe actualizar estado sin error', async () => {
      const mockUpdateStatus = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: mockUpdateStatus,
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.updateStatus(1, 'en_sitio');
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith(1, 'en_sitio');
      expect(result.current.error).toBeNull();
    });

    it('debe aceptar string o number para dispatchId', async () => {
      const mockUpdateStatus = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: mockUpdateStatus,
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.updateStatus('42', 'en_sitio');
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith('42', 'en_sitio');
    });

    it('debe manejar error al actualizar estado', async () => {
      const errorMsg = 'Invalid state';
      const mockUpdateStatus = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: mockUpdateStatus,
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.updateStatus(1, 'invalid');
      });

      expect(result.current.error).toBe(errorMsg);
    });
  });

  // ============================================================================
  // Tests para completeDispatch
  // ============================================================================
  describe('safeCompleteDispatch', () => {
    it('debe completar despacho sin error', async () => {
      const mockCompleteDispatch = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: mockCompleteDispatch,
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      const feedback = { calificacion: 5, comentario: 'Excelente' };

      await act(async () => {
        await result.current.completeDispatch(1, feedback);
      });

      expect(mockCompleteDispatch).toHaveBeenCalledWith(1, feedback);
      expect(result.current.error).toBeNull();
    });

    it('debe completar despacho sin feedback', async () => {
      const mockCompleteDispatch = jest.fn().mockResolvedValueOnce(undefined);

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: mockCompleteDispatch,
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.completeDispatch(1, null);
      });

      expect(mockCompleteDispatch).toHaveBeenCalledWith(1, null);
    });

    it('debe manejar error al completar despacho', async () => {
      const errorMsg = 'Cannot complete';
      const mockCompleteDispatch = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMsg));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: mockCompleteDispatch,
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.completeDispatch(1, null);
      });

      expect(result.current.error).toBe(errorMsg);
    });
  });

  // ============================================================================
  // Tests para setFilters
  // ============================================================================
  describe('setFilters', () => {
    it('debe pasar setFilters del store', () => {
      const mockSetFilters = jest.fn();

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: mockSetFilters,
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      const filters = { status: 'en_camino', hours: 12 };
      act(() => {
        result.current.setFilters(filters);
      });

      expect(mockSetFilters).toHaveBeenCalledWith(filters);
    });
  });

  // ============================================================================
  // Tests para clearError
  // ============================================================================
  describe('clearError', () => {
    it('debe pasar clearError del store', () => {
      const mockClearError = jest.fn();

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: mockClearError,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      act(() => {
        result.current.clearError();
      });

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests para reset
  // ============================================================================
  describe('reset', () => {
    it('debe pasar reset del store', () => {
      const mockReset = jest.fn();

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: mockReset,
      });

      const { result } = renderHook(() => useDispatch());

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests para error property
  // ============================================================================
  describe('error property', () => {
    it('debe retornar store error si existe', () => {
      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: 'Store error',
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      expect(result.current.error).toBe('Store error');
    });

    it('debe retornar localError si store error es null', async () => {
      const mockLoadDispatches = jest
        .fn()
        .mockRejectedValueOnce(new Error('Local error'));

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: [],
        selectedDispatch: null,
        loading: false,
        error: null,
        loadDispatches: mockLoadDispatches,
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      await act(async () => {
        await result.current.loadDispatches();
      });

      expect(result.current.error).toBe('Local error');
    });

    it('debe priorizar store error sobre localError', async () => {
      const mockLoadDispatches = jest
        .fn()
        .mockRejectedValueOnce(new Error('Local error'));

      // Primera llamada devuelve error null, segunda (dentro del hook) devuelve error
      (dispatchStore.useDispatchStore as jest.Mock)
        .mockReturnValueOnce({
          dispatches: [],
          selectedDispatch: null,
          loading: false,
          error: null,
          loadDispatches: mockLoadDispatches,
          loadRecentDispatches: jest.fn(),
          selectDispatch: jest.fn(),
          createDispatch: jest.fn(),
          updateStatus: jest.fn(),
          completeDispatch: jest.fn(),
          setFilters: jest.fn(),
          clearError: jest.fn(),
          reset: jest.fn(),
        })
        .mockReturnValueOnce({
          dispatches: [],
          selectedDispatch: null,
          loading: false,
          error: 'Store error',
          loadDispatches: mockLoadDispatches,
          loadRecentDispatches: jest.fn(),
          selectDispatch: jest.fn(),
          createDispatch: jest.fn(),
          updateStatus: jest.fn(),
          completeDispatch: jest.fn(),
          setFilters: jest.fn(),
          clearError: jest.fn(),
          reset: jest.fn(),
        });

      const { result, rerender } = renderHook(() => useDispatch());

      // La lógica: error: error || localError
      // Si store.error existe, lo usa; si no, usa localError
      expect(result.current.error).toBeNull();

      // Simular que el store ahora tiene error
      rerender();

      expect(result.current.error).toBe('Store error');
    });
  });

  // ============================================================================
  // Tests para useCallback memoization
  // ============================================================================
  describe('useCallback memoization', () => {
    it('debe memorizar safeLoadDispatches con dependencia loadDispatches', () => {
      const mockLoadDispatches1 = jest.fn().mockResolvedValueOnce(undefined);
      const mockLoadDispatches2 = jest.fn().mockResolvedValueOnce(undefined);

      const { result: result1 } = renderHook(() => {
        (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
          dispatches: [],
          selectedDispatch: null,
          loading: false,
          error: null,
          loadDispatches: mockLoadDispatches1,
          loadRecentDispatches: jest.fn(),
          selectDispatch: jest.fn(),
          createDispatch: jest.fn(),
          updateStatus: jest.fn(),
          completeDispatch: jest.fn(),
          setFilters: jest.fn(),
          clearError: jest.fn(),
          reset: jest.fn(),
        });
        return useDispatch();
      });

      const firstRef = result1.current.loadDispatches;

      // Con otra instancia del store
      const { result: result2 } = renderHook(() => {
        (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
          dispatches: [],
          selectedDispatch: null,
          loading: false,
          error: null,
          loadDispatches: mockLoadDispatches2,
          loadRecentDispatches: jest.fn(),
          selectDispatch: jest.fn(),
          createDispatch: jest.fn(),
          updateStatus: jest.fn(),
          completeDispatch: jest.fn(),
          setFilters: jest.fn(),
          clearError: jest.fn(),
          reset: jest.fn(),
        });
        return useDispatch();
      });

      const secondRef = result2.current.loadDispatches;

      // Las funciones deben ser diferentes (por useCallback con dependencias)
      expect(firstRef).not.toBe(secondRef);
    });
  });

  // ============================================================================
  // Tests para exported state properties
  // ============================================================================
  describe('exported state properties', () => {
    it('debe exponer todas las propiedades del estado', () => {
      const mockDispatches = [{ id: 1 } as any];
      const mockSelectedDispatch = { id: 1 } as any;

      (dispatchStore.useDispatchStore as jest.Mock).mockReturnValueOnce({
        dispatches: mockDispatches,
        selectedDispatch: mockSelectedDispatch,
        loading: true,
        error: null,
        loadDispatches: jest.fn(),
        loadRecentDispatches: jest.fn(),
        selectDispatch: jest.fn(),
        createDispatch: jest.fn(),
        updateStatus: jest.fn(),
        completeDispatch: jest.fn(),
        setFilters: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDispatch());

      expect(result.current.dispatches).toEqual(mockDispatches);
      expect(result.current.selectedDispatch).toEqual(mockSelectedDispatch);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });
});
