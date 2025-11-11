// @ts-nocheck
/**
 * Tests for Dispatch Repository
 * Unit tests for data layer - dispatch operations
 */

import { dispatchRepository, Dispatch } from './dispatch-repository';
import graphqlClient from './graphql-client';

// Mock graphqlClient
jest.mock('./graphql-client');

describe('DispatchRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Tests para getDispatch
  // ============================================================================
  describe('getDispatch', () => {
    it('debe obtener un despacho por ID', async () => {
      const mockDispatch: Dispatch = {
        id: 1,
        solicitud_id: 1,
        ambulanciaId: 1,
        fechaSolicitud: '2025-11-10T10:00:00Z',
        fechaAsignacion: '2025-11-10T10:05:00Z',
        fechaLlegada: '2025-11-10T10:15:00Z',
        fechaFinalizacion: null,
        ubicacionOrigenLat: 4.7110,
        ubicacionOrigenLng: -74.0721,
        direccion_origen: 'Calle 50, Bogotá',
        ubicacionDestinoLat: 4.7150,
        ubicacionDestinoLng: -74.0750,
        direccion_destino: 'Hospital Central',
        distanciaKm: 5.2,
        tiempoEstimadoMin: 15,
        tiempoRealMin: null,
        estado: 'en_camino',
        incidente: 'emergencia_medica',
        decision: null,
        prioridad: 'alta',
        observaciones: 'Paciente estable',
        datosAdicionales: {},
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despacho: mockDispatch,
      });

      const result = await dispatchRepository.getDispatch(1);

      expect(result).toEqual(mockDispatch);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual({ id: 1 });
    });

    it('debe lanzar error si despacho no existe', async () => {
      (graphqlClient.request as jest.Mock).mockRejectedValueOnce(
        new Error('Not found')
      );

      await expect(dispatchRepository.getDispatch(999)).rejects.toThrow(
        'Not found'
      );
    });
  });

  // ============================================================================
  // Tests para listDispatches
  // ============================================================================
  describe('listDispatches', () => {
    it('debe listar despachos sin filtros', async () => {
      const mockDispatches: Dispatch[] = [
        {
          id: 1,
          solicitud_id: 1,
          ambulanciaId: 1,
          estado: 'en_camino',
          prioridad: 'alta',
          fechaSolicitud: '2025-11-10T10:00:00Z',
          fechaAsignacion: '2025-11-10T10:05:00Z',
          fechaLlegada: null,
          fechaFinalizacion: null,
          ubicacionOrigenLat: 4.7110,
          ubicacionOrigenLng: -74.0721,
          direccion_origen: 'Calle 50',
          ubicacionDestinoLat: 4.7150,
          ubicacionDestinoLng: -74.0750,
          direccion_destino: 'Hospital',
          distanciaKm: 5.2,
          tiempoEstimadoMin: 15,
          tiempoRealMin: null,
          incidente: 'emergencia',
          decision: null,
          observaciones: null,
          datosAdicionales: {},
        },
      ];

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despachos: mockDispatches,
      });

      const result = await dispatchRepository.listDispatches();

      expect(result).toEqual(mockDispatches);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].limit).toBe(50);
    });

    it('debe listar despachos filtrados por estado', async () => {
      const mockDispatches: Dispatch[] = [];

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despachos: mockDispatches,
      });

      await dispatchRepository.listDispatches('en_camino', 20);

      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].estado).toBe('en_camino');
      expect(callArgs[1].limit).toBe(20);
    });

    it('debe listar despachos con límite personalizado', async () => {
      const mockDispatches: Dispatch[] = [];

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despachos: mockDispatches,
      });

      await dispatchRepository.listDispatches(undefined, 100);

      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].limit).toBe(100);
    });
  });

  // ============================================================================
  // Tests para createDispatch
  // ============================================================================
  describe('createDispatch', () => {
    it('debe crear un nuevo despacho', async () => {
      const mockDispatch: Dispatch = {
        id: 2,
        solicitud_id: 1,
        ambulancia_id: 2,
        estado: 'asignado',
        prioridad: 'media',
        fecha_solicitud: '2025-11-10T11:00:00Z',
        fecha_asignacion: '2025-11-10T11:05:00Z',
        fecha_llegada: null,
        fecha_finalizacion: null,
        ubicacion_origen_lat: 4.7110,
        ubicacion_origen_lng: -74.0721,
        direccion_origen: 'Calle 60',
        ubicacion_destino_lat: 4.7150,
        ubicacion_destino_lng: -74.0750,
        direccion_destino: 'Clínica',
        distancia_km: 4.5,
        tiempo_estimado_min: 12,
        tiempo_real_min: null,
        incidente: 'emergencia_medica',
        decision: null,
        observaciones: null,
        datos_adicionales: {},
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        crearDespacho: mockDispatch,
      });

      const createData = {
        ubicacion_origen_lat: 4.7110,
        ubicacion_origen_lng: -74.0721,
        direccion_origen: 'Calle 60',
        ubicacion_destino_lat: 4.7150,
        ubicacion_destino_lng: -74.0750,
        direccion_destino: 'Clínica',
        prioridad: 'media',
        incidente: 'emergencia_medica',
      };

      const result = await dispatchRepository.createDispatch(createData);

      expect(result).toEqual(mockDispatch);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].ubicacion_origen_lat).toBe(4.7110);
      expect(callArgs[1].ubicacion_origen_lng).toBe(-74.0721);
      expect(callArgs[1].prioridad).toBe('media');
    });

    it('debe fallar si faltan campos requeridos', async () => {
      (graphqlClient.request as jest.Mock).mockRejectedValueOnce(
        new Error('Missing required fields')
      );

      const invalidData = {
        ubicacion_origen_lat: 4.7110,
        // Falta ubicacion_origen_lng
      };

      await expect(
        dispatchRepository.createDispatch(invalidData)
      ).rejects.toThrow('Missing required fields');
    });
  });

  // ============================================================================
  // Tests para updateDispatchStatus
  // ============================================================================
  describe('updateDispatchStatus', () => {
    it('debe actualizar el estado de un despacho', async () => {
      const mockDispatch: Dispatch = {
        id: 1,
        solicitud_id: 1,
        ambulancia_id: 1,
        estado: 'en_sitio',
        prioridad: 'alta',
        fecha_solicitud: '2025-11-10T10:00:00Z',
        fecha_asignacion: '2025-11-10T10:05:00Z',
        fecha_llegada: '2025-11-10T10:20:00Z',
        fecha_finalizacion: null,
        ubicacion_origen_lat: 4.7110,
        ubicacion_origen_lng: -74.0721,
        direccion_origen: 'Calle 50',
        ubicacion_destino_lat: 4.7150,
        ubicacion_destino_lng: -74.0750,
        direccion_destino: 'Hospital',
        distancia_km: 5.2,
        tiempo_estimado_min: 15,
        tiempo_real_min: 20,
        incidente: 'emergencia',
        decision: null,
        observaciones: null,
        datos_adicionales: {},
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        actualizarEstadoDespacho: mockDispatch,
      });

      const result = await dispatchRepository.updateDispatchStatus(1, 'en_sitio');

      expect(result.estado).toBe('en_sitio');
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].id).toBe(1);
      expect(callArgs[1].estado).toBe('en_sitio');
    });

    it('debe lanzar error para estado inválido', async () => {
      (graphqlClient.request as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid status')
      );

      await expect(
        dispatchRepository.updateDispatchStatus(1, 'estado_invalido')
      ).rejects.toThrow('Invalid status');
    });
  });

  // ============================================================================
  // Tests para getRecentDispatches
  // ============================================================================
  describe('getRecentDispatches', () => {
    it('debe obtener despachos recientes de últimas 24 horas', async () => {
      const mockDispatches: Dispatch[] = [];

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despachosRecientes: mockDispatches,
      });

      await dispatchRepository.getRecentDispatches(24, 50);

      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].horas).toBe(24);
      expect(callArgs[1].limit).toBe(50);
    });

    it('debe permitir personalizar horas', async () => {
      const mockDispatches: Dispatch[] = [];

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        despachosRecientes: mockDispatches,
      });

      await dispatchRepository.getRecentDispatches(12, 30);

      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].horas).toBe(12);
      expect(callArgs[1].limit).toBe(30);
    });
  });

  // ============================================================================
  // Tests para recordGpsLocation
  // ============================================================================
  describe('recordGpsLocation', () => {
    it('debe registrar ubicación GPS', async () => {
      const mockResult = {
        id: 1,
        ambulancia_id: 1,
        estado: 'en_camino',
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        registrarUbicacionGPS: mockResult,
      });

      const result = await dispatchRepository.recordGpsLocation(
        1,
        4.7115,
        -74.0730,
        60,
        500,
        5
      );

      expect(result).toEqual(mockResult);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].despacho_id).toBe(1);
    });

    it('debe permitir velocidad, altitud y precision opcionales', async () => {
      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        registrarUbicacionGPS: {},
      });

      await dispatchRepository.recordGpsLocation(1, 4.7115, -74.0730);

      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].despacho_id).toBe(1);
    });
  });

  // ============================================================================
  // Tests para addDispatchFeedback
  // ============================================================================
  describe('addDispatchFeedback', () => {
    it('debe agregar feedback a un despacho', async () => {
      const mockResult = {
        despacho_id: 1,
        calificacion: 5,
        comentario: 'Excelente servicio',
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        agregarFeedbackDespacho: mockResult,
      });

      const result = await dispatchRepository.addDispatchFeedback(
        1,
        5,
        'Excelente servicio',
        'estable'
      );

      expect(result).toEqual(mockResult);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].despacho_id).toBe(1);
      expect(callArgs[1].calificacion).toBe(5);
    });

    it('debe validar rango de calificación 1-5', async () => {
      (graphqlClient.request as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid rating')
      );

      await expect(
        dispatchRepository.addDispatchFeedback(1, 6, 'Comentario')
      ).rejects.toThrow('Invalid rating');
    });
  });

  // ============================================================================
  // Tests para optimizeDispatch
  // ============================================================================
  describe('optimizeDispatch', () => {
    it('debe optimizar despacho usando ML', async () => {
      const mockResult = {
        despacho_id: 1,
        ambulancia_sugerida_id: 2,
        confianza: 0.95,
        tiempo_estimado_min: 12,
        distancia_km: 4.5,
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        optimizarDespacho: mockResult,
      });

      const result = await dispatchRepository.optimizeDispatch(1);

      expect(result).toEqual(mockResult);
      expect(graphqlClient.request).toHaveBeenCalled();
      const callArgs = (graphqlClient.request as jest.Mock).mock.calls[0];
      expect(callArgs[1].despacho_id).toBe(1);
    });

    it('debe retornar asignación actual si ML falla', async () => {
      const mockResult = {
        despacho_id: 1,
        ambulancia_sugerida_id: 1,
        confianza: 0.5,
        razon_cambio: 'Servicio ML no disponible',
      };

      (graphqlClient.request as jest.Mock).mockResolvedValueOnce({
        optimizarDespacho: mockResult,
      });

      const result = await dispatchRepository.optimizeDispatch(1);

      expect(result.razon_cambio).toContain('no disponible');
    });
  });
});
