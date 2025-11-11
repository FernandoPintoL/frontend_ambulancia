// @ts-nocheck
/**
 * Tests for Dispatch Store
 * Unit tests for Zustand state management
 */

import { renderHook, act } from '@testing-library/react';
import { useDispatchStore, initializeWebSocketListeners } from './dispatch-store';
import * as dispatchService from '../services/dispatch-service';
import * as dispatchRepository from '../../data/repositories/dispatch-repository';
import { websocketService } from '../../data/repositories/websocket-service';

// Mock dependencies
jest.mock('../services/dispatch-service');
jest.mock('../../data/repositories/dispatch-repository');
jest.mock('../../data/repositories/websocket-service');

describe('DispatchStore (Zustand)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    const { result } = renderHook(() => useDispatchStore());
    act(() => {
      result.current.reset();
    });
  });

  // ============================================================================
  // Tests para loadDispatches
  // ============================================================================
  describe('loadDispatches', () => {
    it('debe cargar despachos sin filtros', async () => {
      const mockDispatches = [
        { id: 1, estado: 'en_camino', prioridad: 'alta' } as any,
        { id: 2, estado: 'en_sitio', prioridad: 'media' } as any,
      ];

      (dispatchRepository.dispatchRepository.listDispatches as jest.Mock).mockResolvedValueOnce(
        mockDispatches
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadDispatches();
      });

      expect(result.current.dispatches).toEqual(mockDispatches);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(dispatchRepository.dispatchRepository.listDispatches).toHaveBeenCalledWith(
        undefined,
        50
      );
    });

    it('debe cargar despachos con filtro de estado', async () => {
      const mockDispatches = [{ id: 1, estado: 'en_camino' } as any];

      (dispatchRepository.dispatchRepository.listDispatches as jest.Mock).mockResolvedValueOnce(
        mockDispatches
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadDispatches('en_camino', 20);
      });

      expect(result.current.dispatches).toEqual(mockDispatches);
      expect(dispatchRepository.dispatchRepository.listDispatches).toHaveBeenCalledWith(
        'en_camino',
        20
      );
    });

    it('debe manejar errores al cargar despachos', async () => {
      const errorMsg = 'Error fetching dispatches';
      (dispatchRepository.dispatchRepository.listDispatches as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadDispatches();
      });

      expect(result.current.dispatches).toEqual([]);
      expect(result.current.error).toBe(errorMsg);
      expect(result.current.loading).toBe(false);
    });

    it('debe establecer loading durante la operación', async () => {
      const mockDispatches = [{ id: 1 } as any];

      (dispatchRepository.dispatchRepository.listDispatches as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockDispatches), 100))
      );

      const { result } = renderHook(() => useDispatchStore());

      const promise = act(async () => {
        await result.current.loadDispatches();
      });

      // Loading comienza inmediatamente
      expect(result.current.loading).toBe(true);

      await promise;

      // Loading termina después
      expect(result.current.loading).toBe(false);
    });
  });

  // ============================================================================
  // Tests para loadRecentDispatches
  // ============================================================================
  describe('loadRecentDispatches', () => {
    it('debe cargar despachos recientes con horas por defecto', async () => {
      const mockOverview = {
        dispatches: [{ id: 1, estado: 'en_camino' } as any],
        statistics: { total: 1, completados: 0 },
      };

      (dispatchService.dispatchService.getDispatchOverview as jest.Mock).mockResolvedValueOnce(
        mockOverview
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadRecentDispatches();
      });

      expect(result.current.dispatches).toEqual(mockOverview.dispatches);
      expect(dispatchService.dispatchService.getDispatchOverview).toHaveBeenCalledWith(24);
    });

    it('debe cargar despachos recientes con horas personalizadas', async () => {
      const mockOverview = {
        dispatches: [{ id: 1 } as any],
        statistics: {},
      };

      (dispatchService.dispatchService.getDispatchOverview as jest.Mock).mockResolvedValueOnce(
        mockOverview
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadRecentDispatches(12);
      });

      expect(dispatchService.dispatchService.getDispatchOverview).toHaveBeenCalledWith(12);
    });

    it('debe manejar errores al cargar despachos recientes', async () => {
      const errorMsg = 'Error getting overview';
      (dispatchService.dispatchService.getDispatchOverview as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.loadRecentDispatches(24);
      });

      expect(result.current.error).toBe(errorMsg);
      expect(result.current.loading).toBe(false);
    });
  });

  // ============================================================================
  // Tests para selectDispatch
  // ============================================================================
  describe('selectDispatch', () => {
    it('debe seleccionar despacho por ID numérico', async () => {
      const mockDispatch = {
        id: 1,
        estado: 'en_camino',
        ambulancia: { id: 1, codigo: 'AMB-001' },
      } as any;

      (dispatchService.dispatchService.getDispatchWithDetails as jest.Mock).mockResolvedValueOnce(
        mockDispatch
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.selectDispatch(1);
      });

      expect(result.current.selectedDispatch).toEqual(mockDispatch);
      expect(dispatchService.dispatchService.getDispatchWithDetails).toHaveBeenCalledWith(1);
    });

    it('debe seleccionar despacho por ID string', async () => {
      const mockDispatch = { id: 1, estado: 'en_camino' } as any;

      (dispatchService.dispatchService.getDispatchWithDetails as jest.Mock).mockResolvedValueOnce(
        mockDispatch
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.selectDispatch('42');
      });

      expect(dispatchService.dispatchService.getDispatchWithDetails).toHaveBeenCalledWith(42);
    });

    it('debe manejar errores al seleccionar despacho', async () => {
      const errorMsg = 'Dispatch not found';
      (dispatchService.dispatchService.getDispatchWithDetails as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      const { result } = renderHook(() => useDispatchStore());

      await act(async () => {
        await result.current.selectDispatch(999);
      });

      expect(result.current.selectedDispatch).toBeNull();
      expect(result.current.error).toBe(errorMsg);
    });

    it('debe limpiar error previo al seleccionar', async () => {
      const mockDispatch = { id: 1 } as any;

      // Primero establecer un error
      const { result } = renderHook(() => useDispatchStore());
      act(() => {
        result.current.setFilters({ status: 'error' });
      });

      // Luego seleccionar un despacho exitosamente
      (dispatchService.dispatchService.getDispatchWithDetails as jest.Mock).mockResolvedValueOnce(
        mockDispatch
      );

      await act(async () => {
        await result.current.selectDispatch(1);
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // Tests para createDispatch
  // ============================================================================
  describe('createDispatch', () => {
    it('debe crear nuevo despacho', async () => {
      const newDispatch = { id: 3, estado: 'pendiente' } as any;
      const mockResult = { dispatch: newDispatch, prediction: {} };

      (
        dispatchService.dispatchService.createDispatchWithPrediction as jest.Mock
      ).mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useDispatchStore());

      // Primero cargar despachos
      const existingDispatches = [
        { id: 1, estado: 'en_camino' } as any,
        { id: 2, estado: 'en_sitio' } as any,
      ];
      act(() => {
        useDispatchStore.setState({ dispatches: existingDispatches });
      });

      const createData = {
        patientLat: 4.7110,
        patientLon: -74.0721,
        address: 'Calle 50',
      };

      let returnedResult;
      await act(async () => {
        returnedResult = await result.current.createDispatch(createData);
      });

      // El nuevo despacho debe estar al inicio del array
      expect(result.current.dispatches[0]).toEqual(newDispatch);
      expect(result.current.dispatches).toHaveLength(3);
      expect(returnedResult).toEqual(mockResult);
    });

    it('debe manejar errores en creación de despacho', async () => {
      const errorMsg = 'Failed to create dispatch';
      (
        dispatchService.dispatchService.createDispatchWithPrediction as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMsg));

      const { result } = renderHook(() => useDispatchStore());

      const createData = { patientLat: 4.7110, patientLon: -74.0721 };

      await expect(
        act(async () => {
          await result.current.createDispatch(createData);
        })
      ).rejects.toThrow(errorMsg);

      expect(result.current.error).toBe(errorMsg);
      expect(result.current.loading).toBe(false);
    });

    it('debe mantener orden correcto al agregar despacho', async () => {
      const newDispatch = { id: 99, estado: 'pendiente' } as any;
      (
        dispatchService.dispatchService.createDispatchWithPrediction as jest.Mock
      ).mockResolvedValueOnce({ dispatch: newDispatch });

      const { result } = renderHook(() => useDispatchStore());

      const existing = [
        { id: 1, estado: 'en_camino' } as any,
        { id: 2, estado: 'en_sitio' } as any,
      ];
      act(() => {
        useDispatchStore.setState({ dispatches: existing });
      });

      await act(async () => {
        await result.current.createDispatch({});
      });

      // El nuevo debe ser el primero
      expect(result.current.dispatches[0].id).toBe(99);
      expect(result.current.dispatches[1].id).toBe(1);
      expect(result.current.dispatches[2].id).toBe(2);
    });
  });

  // ============================================================================
  // Tests para updateStatus
  // ============================================================================
  describe('updateStatus', () => {
    it('debe actualizar estado de despacho en lista', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [
        { id: 1, estado: 'en_camino', prioridad: 'alta' } as any,
        { id: 2, estado: 'en_sitio', prioridad: 'media' } as any,
      ];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      const updatedDispatch = { id: 1, estado: 'en_sitio', prioridad: 'alta' } as any;
      (dispatchService.dispatchService.updateDispatchStatus as jest.Mock).mockResolvedValueOnce(
        updatedDispatch
      );

      await act(async () => {
        await result.current.updateStatus(1, 'en_sitio');
      });

      expect(result.current.dispatches[0]).toEqual(updatedDispatch);
      expect(result.current.dispatches[1]).toEqual(initialDispatches[1]);
    });

    it('debe actualizar estado de despacho seleccionado', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const selectedDispatch = { id: 1, estado: 'en_camino' } as any;
      act(() => {
        useDispatchStore.setState({ selectedDispatch });
      });

      const updatedDispatch = { id: 1, estado: 'en_sitio' } as any;
      (dispatchService.dispatchService.updateDispatchStatus as jest.Mock).mockResolvedValueOnce(
        updatedDispatch
      );

      await act(async () => {
        await result.current.updateStatus(1, 'en_sitio');
      });

      expect(result.current.selectedDispatch).toEqual(updatedDispatch);
    });

    it('debe aceptar ID como string', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const updatedDispatch = { id: 42, estado: 'completado' } as any;
      (dispatchService.dispatchService.updateDispatchStatus as jest.Mock).mockResolvedValueOnce(
        updatedDispatch
      );

      await act(async () => {
        await result.current.updateStatus('42', 'completado');
      });

      expect(dispatchService.dispatchService.updateDispatchStatus).toHaveBeenCalledWith(
        42,
        'completado'
      );
    });

    it('debe manejar errores al actualizar estado', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [{ id: 1, estado: 'en_camino' } as any];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      const errorMsg = 'Invalid state';
      (dispatchService.dispatchService.updateDispatchStatus as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      await act(async () => {
        await result.current.updateStatus(1, 'estado_invalido');
      });

      expect(result.current.error).toBe(errorMsg);
      // Debe mantener el estado anterior
      expect(result.current.dispatches).toEqual(initialDispatches);
    });
  });

  // ============================================================================
  // Tests para completeDispatch
  // ============================================================================
  describe('completeDispatch', () => {
    it('debe completar despacho con feedback', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [{ id: 1, estado: 'en_sitio' } as any];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      (dispatchService.dispatchService.completeDispatch as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const feedback = { calificacion: 5, comentario: 'Excelente' };

      await act(async () => {
        await result.current.completeDispatch(1, feedback);
      });

      expect(result.current.dispatches[0].estado).toBe('completado');
      expect(dispatchService.dispatchService.completeDispatch).toHaveBeenCalledWith(1, feedback);
    });

    it('debe completar despacho sin feedback', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [{ id: 1, estado: 'en_sitio' } as any];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      (dispatchService.dispatchService.completeDispatch as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await result.current.completeDispatch(1, null);
      });

      expect(result.current.dispatches[0].estado).toBe('completado');
      expect(dispatchService.dispatchService.completeDispatch).toHaveBeenCalledWith(1, null);
    });

    it('debe actualizar despacho seleccionado al completarlo', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const selectedDispatch = { id: 1, estado: 'en_sitio' } as any;
      act(() => {
        useDispatchStore.setState({ selectedDispatch });
      });

      (dispatchService.dispatchService.completeDispatch as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await result.current.completeDispatch(1, null);
      });

      expect(result.current.selectedDispatch?.estado).toBe('completado');
    });

    it('debe manejar errores al completar despacho', async () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [{ id: 1, estado: 'en_sitio' } as any];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      const errorMsg = 'Cannot complete dispatch';
      (dispatchService.dispatchService.completeDispatch as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      await act(async () => {
        await result.current.completeDispatch(1, null);
      });

      expect(result.current.error).toBe(errorMsg);
      // No debe cambiar el estado
      expect(result.current.dispatches[0].estado).toBe('en_sitio');
    });
  });

  // ============================================================================
  // Tests para setFilters
  // ============================================================================
  describe('setFilters', () => {
    it('debe establecer nuevos filtros', () => {
      const { result } = renderHook(() => useDispatchStore());

      act(() => {
        result.current.setFilters({ status: 'en_camino', hours: 12 });
      });

      expect(result.current.filters.status).toBe('en_camino');
      expect(result.current.filters.hours).toBe(12);
    });

    it('debe fusionar filtros manteniendo los existentes', () => {
      const { result } = renderHook(() => useDispatchStore());

      act(() => {
        result.current.setFilters({ status: 'en_camino' });
      });

      expect(result.current.filters.status).toBe('en_camino');
      expect(result.current.filters.hours).toBe(24); // Por defecto

      act(() => {
        result.current.setFilters({ hours: 12 });
      });

      expect(result.current.filters.status).toBe('en_camino');
      expect(result.current.filters.hours).toBe(12);
    });
  });

  // ============================================================================
  // Tests para clearError
  // ============================================================================
  describe('clearError', () => {
    it('debe limpiar el error', () => {
      const { result } = renderHook(() => useDispatchStore());

      act(() => {
        useDispatchStore.setState({ error: 'Some error message' });
      });

      expect(result.current.error).toBe('Some error message');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // Tests para reset
  // ============================================================================
  describe('reset', () => {
    it('debe resetear el store a estado inicial', () => {
      const { result } = renderHook(() => useDispatchStore());

      // Establecer datos
      act(() => {
        useDispatchStore.setState({
          dispatches: [{ id: 1 } as any],
          selectedDispatch: { id: 1 } as any,
          loading: true,
          error: 'Some error',
          filters: { status: 'en_camino', hours: 12 },
        });
      });

      // Verificar que está establecido
      expect(result.current.dispatches).toHaveLength(1);
      expect(result.current.selectedDispatch).not.toBeNull();
      expect(result.current.error).not.toBeNull();

      // Resetear
      act(() => {
        result.current.reset();
      });

      // Verificar que está limpio
      expect(result.current.dispatches).toEqual([]);
      expect(result.current.selectedDispatch).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({ hours: 24 });
    });
  });

  // ============================================================================
  // Tests para initializeWebSocketListeners
  // ============================================================================
  describe('initializeWebSocketListeners', () => {
    it('debe suscribirse a dispatch_status_changed', () => {
      const { result } = renderHook(() => useDispatchStore());

      const initialDispatches = [{ id: 1, estado: 'en_camino' } as any];
      act(() => {
        useDispatchStore.setState({ dispatches: initialDispatches });
      });

      initializeWebSocketListeners();

      expect(websocketService.subscribe).toHaveBeenCalledWith(
        'dispatch_status_changed',
        expect.any(Function)
      );
    });

    it('debe suscribirse a dispatch_completed', () => {
      initializeWebSocketListeners();

      expect(websocketService.subscribe).toHaveBeenCalledWith(
        'dispatch_completed',
        expect.any(Function)
      );
    });

    it('debe suscribirse a dispatch_created', () => {
      initializeWebSocketListeners();

      expect(websocketService.subscribe).toHaveBeenCalledWith(
        'dispatch_created',
        expect.any(Function)
      );
    });

    it('debe suscribirse a ambulance_location_updated', () => {
      initializeWebSocketListeners();

      expect(websocketService.subscribe).toHaveBeenCalledWith(
        'ambulance_location_updated',
        expect.any(Function)
      );
    });

    it('debe registrar 4 suscripciones de WebSocket', () => {
      initializeWebSocketListeners();

      expect(websocketService.subscribe).toHaveBeenCalledTimes(4);
    });
  });

  // ============================================================================
  // Tests para subscribeWithSelector
  // ============================================================================
  describe('subscribeWithSelector middleware', () => {
    it('debe permitir seleccionar estado específico', () => {
      const mockDispatches = [{ id: 1 } as any];

      const { result } = renderHook(() =>
        useDispatchStore((state) => state.dispatches)
      );

      act(() => {
        useDispatchStore.setState({ dispatches: mockDispatches });
      });

      expect(result.current).toEqual(mockDispatches);
    });

    it('debe notificar solo cuando el selector cambia', () => {
      const subscriber = jest.fn();

      const unsubscribe = useDispatchStore.subscribe(
        (state) => state.loading,
        subscriber
      );

      // Cambiar loading
      act(() => {
        useDispatchStore.setState({ loading: true });
      });

      expect(subscriber).toHaveBeenCalledWith(true, false);

      // Cambiar otra cosa (no debe notificar)
      act(() => {
        useDispatchStore.setState({ error: 'test' });
      });

      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});
