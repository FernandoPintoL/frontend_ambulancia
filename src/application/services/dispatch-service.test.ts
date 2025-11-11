// @ts-nocheck
/**
 * Tests for Dispatch Service
 * Unit tests for business logic layer
 */

import { dispatchService } from './dispatch-service';
import * as dispatchRepo from '../../data/repositories/dispatch-repository';

// Mock dispatch repository
jest.mock('../../data/repositories/dispatch-repository');
jest.mock('../../data/repositories/ambulance-repository');

describe('DispatchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Tests para getDispatchOverview
  // ============================================================================
  describe('getDispatchOverview', () => {
    it('debe obtener resumen de despachos con estadísticas', async () => {
      const mockDispatches = [
        {
          id: 1,
          estado: 'en_camino',
          prioridad: 'alta',
        } as any,
        {
          id: 2,
          estado: 'en_sitio',
          prioridad: 'media',
        } as any,
      ];

      const mockStats = {
        total: 2,
        completados: 0,
        pendientes: 0,
        enCamino: 1,
        enSitio: 1,
        cancelados: 0,
        critica: 0,
        alta: 1,
        media: 1,
        baja: 0,
        tasaCompletcion: 0,
      };

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getRecentDispatches')
        .mockResolvedValueOnce(mockDispatches);

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getDispatchStatistics')
        .mockResolvedValueOnce(mockStats);

      const result = await dispatchService.getDispatchOverview(24);

      expect(result.dispatches).toHaveLength(2);
      expect(result.statistics.total).toBe(2);
      expect(result.statistics.enCamino).toBe(1);
      expect(result.statistics.enSitio).toBe(1);
    });

    it('debe permitir filtrar por horas', async () => {
      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getRecentDispatches')
        .mockResolvedValueOnce([]);

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getDispatchStatistics')
        .mockResolvedValueOnce({
          total: 0,
          completados: 0,
          pendientes: 0,
          enCamino: 0,
          enSitio: 0,
          cancelados: 0,
          critica: 0,
          alta: 0,
          media: 0,
          baja: 0,
          tasaCompletcion: 0,
        });

      await dispatchService.getDispatchOverview(12);

      expect(dispatchRepo.dispatchRepository.getRecentDispatches).toHaveBeenCalledWith(
        12,
        100
      );
      expect(dispatchRepo.dispatchRepository.getDispatchStatistics).toHaveBeenCalledWith(12);
    });
  });

  // ============================================================================
  // Tests para getDispatchWithDetails
  // ============================================================================
  describe('getDispatchWithDetails', () => {
    it('debe obtener despacho con detalles completos', async () => {
      const mockDispatch = {
        id: 1,
        ambulanciaId: 1,
        estado: 'en_camino',
        ambulancia: {
          id: 1,
          codigo: 'AMB-001',
          estado: 'en_servicio',
        },
      } as any;

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getDispatch')
        .mockResolvedValueOnce(mockDispatch);

      const result = await dispatchService.getDispatchWithDetails(1);

      expect(result.id).toBe(1);
      expect(result.ambulancia).toBeDefined();
      expect(dispatchRepo.dispatchRepository.getDispatch).toHaveBeenCalledWith(1);
    });

    it('debe manejar despacho sin ambulancia asignada', async () => {
      const mockDispatch = {
        id: 1,
        ambulanciaId: null,
        estado: 'pendiente',
      } as any;

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getDispatch')
        .mockResolvedValueOnce(mockDispatch);

      const result = await dispatchService.getDispatchWithDetails(1);

      expect(result.ambulanciaId).toBeNull();
      expect(dispatchRepo.dispatchRepository.getDispatch).toHaveBeenCalledWith(1);
    });
  });

  // ============================================================================
  // Tests para createDispatchWithPrediction
  // ============================================================================
  describe('createDispatchWithPrediction', () => {
    it('debe crear despacho con mapeo correcto de datos', async () => {
      const mockDispatch = {
        id: 1,
        estado: 'asignado',
        prioridad: 'media',
      } as any;

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce(mockDispatch);

      const createData = {
        patientLat: 4.7110,
        patientLon: -74.0721,
        address: 'Calle 50',
        prioridad: 'media',
      };

      const result = await dispatchService.createDispatchWithPrediction(createData);

      expect(result.dispatch).toEqual(mockDispatch);
      expect(dispatchRepo.dispatchRepository.createDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          ubicacion_origen_lat: 4.7110,
          ubicacion_origen_lng: -74.0721,
          direccion_origen: 'Calle 50',
          prioridad: 'media',
        })
      );
    });

    it('debe usar valores por defecto si no están especificados', async () => {
      jest
        .spyOn(dispatchRepo.dispatchRepository, 'createDispatch')
        .mockResolvedValueOnce({} as any);

      const createData = {
        ubicacion_origen_lat: 4.7110,
        ubicacion_origen_lng: -74.0721,
      };

      await dispatchService.createDispatchWithPrediction(createData);

      expect(dispatchRepo.dispatchRepository.createDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          incidente: 'emergencia_medica',
          prioridad: 'media',
        })
      );
    });
  });

  // ============================================================================
  // Tests para updateDispatchStatus
  // ============================================================================
  describe('updateDispatchStatus', () => {
    it('debe actualizar estado válido', async () => {
      const mockDispatch = {
        id: 1,
        estado: 'en_sitio',
      } as any;

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce(mockDispatch);

      const result = await dispatchService.updateDispatchStatus(1, 'en_sitio');

      expect(result.estado).toBe('en_sitio');
      expect(dispatchRepo.dispatchRepository.updateDispatchStatus).toHaveBeenCalledWith(
        1,
        'en_sitio'
      );
    });

    it('debe rechazar estado inválido', async () => {
      const invalidState = 'estado_invalido';

      await expect(
        dispatchService.updateDispatchStatus(1, invalidState)
      ).rejects.toThrow('Estado inválido');
    });

    it('debe aceptar todos los estados válidos', async () => {
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
        .spyOn(dispatchRepo.dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValue({} as any);

      for (const state of validStates) {
        await expect(
          dispatchService.updateDispatchStatus(1, state)
        ).resolves.toBeDefined();
      }
    });
  });

  // ============================================================================
  // Tests para completeDispatch
  // ============================================================================
  describe('completeDispatch', () => {
    it('debe completar despacho y agregar feedback', async () => {
      jest
        .spyOn(dispatchRepo.dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce({} as any);

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'addDispatchFeedback')
        .mockResolvedValueOnce({} as any);

      const feedback = {
        calificacion: 5,
        comentario: 'Excelente servicio',
        resultado_paciente: 'estable',
      };

      await dispatchService.completeDispatch(1, feedback);

      expect(
        dispatchRepo.dispatchRepository.updateDispatchStatus
      ).toHaveBeenCalledWith(1, 'completado');
      expect(
        dispatchRepo.dispatchRepository.addDispatchFeedback
      ).toHaveBeenCalledWith(1, 5, 'Excelente servicio', 'estable');
    });

    it('debe completar despacho sin feedback si no se proporciona', async () => {
      jest
        .spyOn(dispatchRepo.dispatchRepository, 'updateDispatchStatus')
        .mockResolvedValueOnce({} as any);

      await dispatchService.completeDispatch(1, null);

      expect(
        dispatchRepo.dispatchRepository.updateDispatchStatus
      ).toHaveBeenCalledWith(1, 'completado');
      expect(
        dispatchRepo.dispatchRepository.addDispatchFeedback
      ).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests para recordGpsLocation
  // ============================================================================
  describe('recordGpsLocation', () => {
    it('debe registrar ubicación GPS correctamente', async () => {
      const mockResult = {
        id: 1,
        estado: 'en_camino',
      } as any;

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'recordGpsLocation')
        .mockResolvedValueOnce(mockResult);

      const result = await dispatchService.recordGpsLocation(
        1,
        4.7115,
        -74.0730,
        60,
        500,
        5
      );

      expect(result).toEqual(mockResult);
      expect(
        dispatchRepo.dispatchRepository.recordGpsLocation
      ).toHaveBeenCalledWith(1, 4.7115, -74.0730, 60, 500, 5);
    });

    it('debe permitir valores opcionales', async () => {
      jest
        .spyOn(dispatchRepo.dispatchRepository, 'recordGpsLocation')
        .mockResolvedValueOnce({} as any);

      await dispatchService.recordGpsLocation(1, 4.7115, -74.0730);

      expect(
        dispatchRepo.dispatchRepository.recordGpsLocation
      ).toHaveBeenCalledWith(1, 4.7115, -74.0730, undefined, undefined, undefined);
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
      };

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'optimizeDispatch')
        .mockResolvedValueOnce(mockResult);

      const result = await dispatchService.optimizeDispatch(1);

      expect(result.confianza).toBe(0.95);
      expect(dispatchRepo.dispatchRepository.optimizeDispatch).toHaveBeenCalledWith(1);
    });
  });

  // ============================================================================
  // Tests para getDispatchStatistics
  // ============================================================================
  describe('getDispatchStatistics', () => {
    it('debe obtener estadísticas de despachos', async () => {
      const mockStats = {
        total: 50,
        completados: 40,
        pendientes: 5,
        en_camino: 3,
        tasa_completcion: 80,
      };

      jest
        .spyOn(dispatchRepo.dispatchRepository, 'getDispatchStatistics')
        .mockResolvedValueOnce(mockStats as any);

      const result = await dispatchService.getDispatchStatistics(24);

      expect(result.total).toBe(50);
      expect(result.tasa_completcion).toBe(80);
      expect(dispatchRepo.dispatchRepository.getDispatchStatistics).toHaveBeenCalledWith(
        24
      );
    });
  });
});
