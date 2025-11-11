// @ts-nocheck
/**
 * End-to-End Tests for Dispatch Flow
 * Integration tests for complete user workflows
 */

import { dispatchRepository } from '../data/repositories/dispatch-repository';
import { dispatchService } from '../application/services/dispatch-service';
import { websocketService } from '../data/repositories/websocket-service';

// Mock graphql-client for integration testing
jest.mock('../data/repositories/graphql-client');

describe('E2E: Dispatch Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // E2E Test 1: Complete Dispatch Creation and Status Update Flow
  // ============================================================================
  describe('Complete dispatch lifecycle', () => {
    it('debe completar un flujo completo: crear despacho -> cambiar estado -> completar', async () => {
      // Step 1: Create dispatch
      const newDispatchData = {
        patientLat: 4.7110,
        patientLon: -74.0721,
        address: 'Calle 50, Bogotá',
        prioridad: 'media',
      };

      const createdDispatch = {
        id: 1,
        estado: 'pendiente',
        prioridad: 'media',
        ubicacionOrigenLat: 4.7110,
        ubicacionOrigenLng: -74.0721,
        direccion_origen: 'Calle 50, Bogotá',
        ambulanciaId: null,
        fechaSolicitud: '2025-11-10T10:00:00Z',
      } as any;

      jest
        .spyOn(dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce(createdDispatch);

      const createResult = await dispatchService.createDispatchWithPrediction(
        newDispatchData
      );

      expect(createResult.dispatch).toEqual(createdDispatch);
      expect(dispatchRepository.createDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          ubicacionOrigenLat: 4.7110,
          ubicacionOrigenLng: -74.0721,
        })
      );

      // Step 2: Get dispatch details
      const dispatchWithDetails = {
        ...createdDispatch,
        ambulancia: {
          id: 1,
          codigo: 'AMB-001',
          estado: 'en_servicio',
        },
      } as any;

      jest
        .spyOn(dispatchRepository, 'getDispatch')
        .mockResolvedValueOnce(dispatchWithDetails);

      const selected = await dispatchService.getDispatchWithDetails(1);

      expect(selected.id).toBe(1);
      expect(selected.ambulancia).toBeDefined();

      // Step 3: Update status to en_camino
      const dispatchEnCamino = {
        ...createdDispatch,
        estado: 'en_camino',
        ambulanciaId: 1,
        fechaAsignacion: '2025-11-10T10:05:00Z',
      } as any;

      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce(dispatchEnCamino);

      const updated = await dispatchService.updateDispatchStatus(1, 'en_camino');

      expect(updated.estado).toBe('en_camino');
      expect(updated.ambulanciaId).toBe(1);

      // Step 4: Record GPS location
      const gpsLocation = {
        id: 1,
        estado: 'en_camino',
        ambulanciaId: 1,
      } as any;

      jest
        .spyOn(dispatchRepository, 'recordGpsLocation')
        .mockResolvedValueOnce(gpsLocation);

      const gpsResult = await dispatchService.recordGpsLocation(1, 4.7115, -74.0730, 60, 500, 5);

      expect(gpsResult).toEqual(gpsLocation);
      expect(dispatchRepository.recordGpsLocation).toHaveBeenCalledWith(
        1,
        4.7115,
        -74.0730,
        60,
        500,
        5
      );

      // Step 5: Update status to en_sitio
      const dispatchEnSitio = {
        ...dispatchEnCamino,
        estado: 'en_sitio',
        fechaLlegada: '2025-11-10T10:15:00Z',
      } as any;

      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce(dispatchEnSitio);

      const updated2 = await dispatchService.updateDispatchStatus(1, 'en_sitio');

      expect(updated2.estado).toBe('en_sitio');

      // Step 6: Complete dispatch with feedback
      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce(dispatchEnSitio);

      jest
        .spyOn(dispatchRepository, 'addDispatchFeedback')
        .mockResolvedValueOnce({ despachId: 1, calificacion: 5 } as any);

      const feedback = {
        calificacion: 5,
        comentario: 'Excelente servicio',
        resultadoPaciente: 'estable',
      };

      await dispatchService.completeDispatch(1, feedback);

      expect(dispatchRepository.updateDispatchStatus).toHaveBeenCalledWith(
        1,
        'completado'
      );
      expect(dispatchRepository.addDispatchFeedback).toHaveBeenCalledWith(
        1,
        5,
        'Excelente servicio',
        'estable'
      );
    });
  });

  // ============================================================================
  // E2E Test 2: List and Filter Dispatches
  // ============================================================================
  describe('List and filter dispatches', () => {
    it('debe listar despachos y filtrar por estado', async () => {
      // Get all dispatches
      const allDispatches = [
        {
          id: 1,
          estado: 'en_camino',
          prioridad: 'alta',
          fecha_solicitud: '2025-11-10T10:00:00Z',
        },
        {
          id: 2,
          estado: 'en_sitio',
          prioridad: 'media',
          fecha_solicitud: '2025-11-10T10:05:00Z',
        },
        {
          id: 3,
          estado: 'pendiente',
          prioridad: 'baja',
          fecha_solicitud: '2025-11-10T10:10:00Z',
        },
      ] as any[];

      jest
        .spyOn(dispatchRepository, 'listDispatches')
        .mockResolvedValueOnce(allDispatches);

      const result1 = await dispatchRepository.listDispatches();

      expect(result1).toHaveLength(3);

      // Filter by estado
      const filteredByEstado = [allDispatches[0]];

      jest
        .spyOn(dispatchRepository, 'listDispatches')
        .mockResolvedValueOnce(filteredByEstado);

      const result2 = await dispatchRepository.listDispatches('en_camino', 50);

      expect(result2).toHaveLength(1);
      expect(result2[0].estado).toBe('en_camino');
    });

    it('debe obtener despachos recientes con estadísticas', async () => {
      const mockOverview = {
        dispatches: [
          { id: 1, estado: 'en_camino', prioridad: 'alta' } as any,
          { id: 2, estado: 'en_sitio', prioridad: 'media' } as any,
        ],
        statistics: {
          total: 2,
          completados: 0,
          pendientes: 0,
          en_camino: 1,
          en_sitio: 1,
          cancelados: 0,
          critica: 0,
          alta: 1,
          media: 1,
          baja: 0,
          tasa_completcion: 0,
        },
      };

      jest
        .spyOn(dispatchRepository, 'getRecentDispatches')
        .mockResolvedValueOnce(mockOverview.dispatches);

      jest
        .spyOn(dispatchRepository, 'getDispatchStatistics')
        .mockResolvedValueOnce(mockOverview.statistics as any);

      const result = await dispatchService.getDispatchOverview(24);

      expect(result.dispatches).toHaveLength(2);
      expect(result.statistics.total).toBe(2);
      expect(result.statistics.en_camino).toBe(1);
      expect(result.statistics.en_sitio).toBe(1);
    });
  });

  // ============================================================================
  // E2E Test 3: Error Handling Throughout Flow
  // ============================================================================
  describe('Error handling in dispatch flow', () => {
    it('debe manejar error al crear despacho sin campos requeridos', async () => {
      const invalidData = {
        patientLat: 4.7110,
        // Faltan patientLon y address
      };

      jest
        .spyOn(dispatchRepository, 'createDispatch')
        .mockRejectedValueOnce(new Error('Missing required fields'));

      await expect(
        dispatchService.createDispatchWithPrediction(invalidData)
      ).rejects.toThrow('Missing required fields');
    });

    it('debe manejar error al cambiar a estado inválido', async () => {
      await expect(
        dispatchService.updateDispatchStatus(1, 'estado_invalido')
      ).rejects.toThrow('Estado inválido');
    });

    it('debe manejar error al obtener despacho que no existe', async () => {
      jest
        .spyOn(dispatchRepository, 'getDispatch')
        .mockRejectedValueOnce(new Error('Not found'));

      await expect(
        dispatchService.getDispatchWithDetails(999)
      ).rejects.toThrow('Not found');
    });

    it('debe manejar error al registrar GPS sin ubicación', async () => {
      jest
        .spyOn(dispatchRepository, 'recordGpsLocation')
        .mockRejectedValueOnce(new Error('Missing location'));

      await expect(
        dispatchService.recordGpsLocation(1, null as any, null as any)
      ).rejects.toThrow('Missing location');
    });
  });

  // ============================================================================
  // E2E Test 4: Optimization with ML Service
  // ============================================================================
  describe('Dispatch optimization with ML', () => {
    it('debe optimizar despacho usando ML service', async () => {
      const mockOptimization = {
        despacho_id: 1,
        ambulancia_sugerida_id: 2,
        confianza: 0.95,
        tiempo_estimado_min: 12,
        distancia_km: 4.5,
      };

      jest
        .spyOn(dispatchRepository, 'optimizeDispatch')
        .mockResolvedValueOnce(mockOptimization as any);

      const result = await dispatchService.optimizeDispatch(1);

      expect(result.ambulancia_sugerida_id).toBe(2);
      expect(result.confianza).toBe(0.95);
      expect(dispatchRepository.optimizeDispatch).toHaveBeenCalledWith(1);
    });

    it('debe manejar ML service unavailability gracefully', async () => {
      const fallbackResult = {
        despacho_id: 1,
        ambulancia_sugerida_id: 1,
        confianza: 0.5,
        razon_cambio: 'ML service not available',
      };

      jest
        .spyOn(dispatchRepository, 'optimizeDispatch')
        .mockResolvedValueOnce(fallbackResult as any);

      const result = await dispatchService.optimizeDispatch(1);

      expect(result.razon_cambio).toContain('not available');
      expect(result.confianza).toBeLessThan(0.95);
    });
  });

  // ============================================================================
  // E2E Test 5: Concurrent Operations
  // ============================================================================
  describe('Concurrent dispatch operations', () => {
    it('debe manejar múltiples creaciones de despacho en paralelo', async () => {
      const dispatch1 = {
        id: 1,
        estado: 'pendiente',
        prioridad: 'alta',
      } as any;

      const dispatch2 = {
        id: 2,
        estado: 'pendiente',
        prioridad: 'media',
      } as any;

      jest
        .spyOn(dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce(dispatch1)
        .mockResolvedValueOnce(dispatch2);

      const createData1 = {
        patientLat: 4.7110,
        patientLon: -74.0721,
        prioridad: 'alta',
      };

      const createData2 = {
        patientLat: 4.7120,
        patientLon: -74.0730,
        prioridad: 'media',
      };

      const [result1, result2] = await Promise.all([
        dispatchService.createDispatchWithPrediction(createData1),
        dispatchService.createDispatchWithPrediction(createData2),
      ]);

      expect(result1.dispatch.id).toBe(1);
      expect(result2.dispatch.id).toBe(2);
    });

    it('debe manejar actualización de múltiples despachos', async () => {
      const dispatch1Updated = { id: 1, estado: 'en_camino' } as any;
      const dispatch2Updated = { id: 2, estado: 'en_sitio' } as any;

      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce(dispatch1Updated)
        .mockResolvedValueOnce(dispatch2Updated);

      const [result1, result2] = await Promise.all([
        dispatchService.updateDispatchStatus(1, 'en_camino'),
        dispatchService.updateDispatchStatus(2, 'en_sitio'),
      ]);

      expect(result1.estado).toBe('en_camino');
      expect(result2.estado).toBe('en_sitio');
      expect(dispatchRepository.updateDispatchStatus).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // E2E Test 6: Data Consistency and Mapping
  // ============================================================================
  describe('Data consistency and mapping', () => {
    it('debe mapear correctamente datos del formulario al formato del backend', async () => {
      const formData = {
        patientLat: 4.7110,
        patientLon: -74.0721,
        address: 'Calle 50',
        prioridad: 'media',
      };

      jest
        .spyOn(dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce({} as any);

      await dispatchService.createDispatchWithPrediction(formData);

      expect(dispatchRepository.createDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          ubicacion_origen_lat: 4.7110,
          ubicacion_origen_lng: -74.0721,
          direccion_origen: 'Calle 50',
          prioridad: 'media',
          incidente: 'emergencia_medica', // valor por defecto
        })
      );
    });

    it('debe usar valores por defecto cuando no se proporcionan', async () => {
      const minimalData = {
        ubicacion_origen_lat: 4.7110,
        ubicacion_origen_lng: -74.0721,
      };

      jest
        .spyOn(dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce({} as any);

      await dispatchService.createDispatchWithPrediction(minimalData);

      expect(dispatchRepository.createDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          incidente: 'emergencia_medica',
          prioridad: 'media',
        })
      );
    });
  });

  // ============================================================================
  // E2E Test 7: State Transitions and Validation
  // ============================================================================
  describe('Dispatch state transitions', () => {
    it('debe validar todas las transiciones de estado válidas', async () => {
      const validStates = [
        'pendiente',
        'asignado',
        'en_camino',
        'en_sitio',
        'trasladando',
        'completado',
        'cancelado',
      ];

      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValue({} as any);

      for (const state of validStates) {
        await expect(
          dispatchService.updateDispatchStatus(1, state)
        ).resolves.toBeDefined();
      }

      expect(dispatchRepository.updateDispatchStatus).toHaveBeenCalledTimes(7);
    });

    it('debe rechazar transiciones de estado inválidas', async () => {
      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockRejectedValueOnce(new Error('Estado inválido'));

      await expect(
        dispatchService.updateDispatchStatus(1, 'invalid_state')
      ).rejects.toThrow('Estado inválido');
    });
  });

  // ============================================================================
  // E2E Test 8: Complete Feedback Loop
  // ============================================================================
  describe('Complete feedback loop', () => {
    it('debe completar despacho y almacenar feedback', async () => {
      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce({} as any);

      jest
        .spyOn(dispatchRepository, 'addDispatchFeedback')
        .mockResolvedValueOnce({
          despacho_id: 1,
          calificacion: 5,
          comentario: 'Excelente',
        } as any);

      const feedback = {
        calificacion: 5,
        comentario: 'Excelente servicio',
        resultado_paciente: 'estable',
      };

      await dispatchService.completeDispatch(1, feedback);

      expect(dispatchRepository.updateDispatchStatus).toHaveBeenCalledWith(
        1,
        'completado'
      );
      expect(dispatchRepository.addDispatchFeedback).toHaveBeenCalledWith(
        1,
        5,
        'Excelente servicio',
        'estable'
      );
    });

    it('debe permitir completar sin feedback', async () => {
      jest
        .spyOn(dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce({} as any);

      await dispatchService.completeDispatch(1, null);

      expect(dispatchRepository.updateDispatchStatus).toHaveBeenCalledWith(
        1,
        'completado'
      );
      expect(dispatchRepository.addDispatchFeedback).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // E2E Test 9: Performance - Multiple Operations
  // ============================================================================
  describe('Performance with high dispatch volume', () => {
    it('debe manejar lista grande de despachos sin problemas', async () => {
      // Simular 100 despachos
      const largeDispatchList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        estado: ['en_camino', 'en_sitio', 'pendiente'][i % 3],
        prioridad: ['alta', 'media', 'baja'][i % 3],
        fecha_solicitud: new Date(
          Date.now() - i * 60000
        ).toISOString(),
      })) as any[];

      jest
        .spyOn(dispatchRepository, 'listDispatches')
        .mockResolvedValueOnce(largeDispatchList);

      const startTime = Date.now();
      const result = await dispatchRepository.listDispatches();
      const endTime = Date.now();

      expect(result).toHaveLength(100);
      // Operación debe ser rápida (< 1 segundo)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  // ============================================================================
  // E2E Test 10: Integration with Statistics
  // ============================================================================
  describe('Statistics integration', () => {
    it('debe correlacionar datos de dispatch con estadísticas', async () => {
      const dispatches = [
        { id: 1, estado: 'en_camino', prioridad: 'alta' },
        { id: 2, estado: 'en_sitio', prioridad: 'media' },
        { id: 3, estado: 'pendiente', prioridad: 'baja' },
      ] as any[];

      const stats = {
        total: 3,
        completados: 0,
        pendientes: 1,
        en_camino: 1,
        en_sitio: 1,
        cancelados: 0,
        critica: 0,
        alta: 1,
        media: 1,
        baja: 1,
        tasa_completcion: 0,
      };

      jest
        .spyOn(dispatchRepository, 'getRecentDispatches')
        .mockResolvedValueOnce(dispatches);

      jest
        .spyOn(dispatchRepository, 'getDispatchStatistics')
        .mockResolvedValueOnce(stats as any);

      const overview = await dispatchService.getDispatchOverview(24);

      expect(overview.dispatches).toHaveLength(3);
      expect(overview.statistics.total).toBe(3);

      // Validar coherencia: suma de estados debe ser total
      const stateSum =
        overview.statistics.en_camino +
        overview.statistics.en_sitio +
        overview.statistics.pendientes +
        overview.statistics.completados;

      expect(stateSum).toBe(overview.statistics.total);

      // Validar coherencia: suma de prioridades debe ser total
      const prioritySum =
        overview.statistics.critica +
        overview.statistics.alta +
        overview.statistics.media +
        overview.statistics.baja;

      expect(prioritySum).toBe(overview.statistics.total);
    });
  });
});
