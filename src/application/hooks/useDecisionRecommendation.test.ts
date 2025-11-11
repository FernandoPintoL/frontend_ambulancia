// @ts-nocheck
import { renderHook, act, waitFor } from '@testing-library/react';
import useDecisionRecommendation from './useDecisionRecommendation';
import { DatosPaciente, Ubicacion } from '../../data/repositories/decision-queries';

// Mock the graphql-request module
jest.mock('graphql-request', () => ({
  request: jest.fn(),
}));

import { request } from 'graphql-request';

describe('useDecisionRecommendation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDecisionRecommendation());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.evaluacion).toBeNull();
    expect(result.current.recomendaciones).toBeNull();
    expect(result.current.clusters).toEqual([]);
    expect(result.current.estadisticas).toBeNull();
  });

  it('should evaluate patient severity successfully', async () => {
    const mockEvaluacion = {
      severidad: 'ALTO',
      confianza: 0.89,
      requiereTraslado: true,
      probabilidades: {
        critico: 0.15,
        alto: 0.68,
        medio: 0.15,
        bajo: 0.02,
      },
    };

    (request as jest.Mock).mockResolvedValue({
      evaluarPaciente: mockEvaluacion,
    });

    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals: DatosPaciente = {
      edad: 45,
      sexo: 'M',
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    await act(async () => {
      await result.current.evaluarPaciente(vitals);
    });

    await waitFor(() => {
      expect(result.current.evaluacion).toEqual(mockEvaluacion);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle evaluation error', async () => {
    const errorMessage = 'Failed to evaluate patient';
    (request as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals: DatosPaciente = {
      edad: 45,
      sexo: 'M',
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    await act(async () => {
      await result.current.evaluarPaciente(vitals);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.evaluacion).toBeNull();
  });

  it('should recommend hospitals successfully', async () => {
    const mockRecommendations = {
      evaluacion: {
        severidad: 'ALTO',
        confianza: 0.89,
        requiereTraslado: true,
        probabilidades: {
          critico: 0.15,
          alto: 0.68,
          medio: 0.15,
          bajo: 0.02,
        },
      },
      clusterUtilizado: 'Urgencias_Especializadas',
      especialidadesCluster: ['Cirugía General', 'Traumatología', 'Emergencias'],
      hospitalesRecomendados: [
        {
          hospitalId: 'hosp_001',
          nombre: 'Hospital San José',
          ubicacion: {
            latitud: 4.7169,
            longitud: -74.0049,
            direccion: 'Cra 10 #123',
            ciudad: 'Bogotá',
          },
          capacidad: 500,
          nivel: 'III',
          distanciaKm: 2.3,
          disponibilidadPorcentaje: 85,
        },
      ],
      totalDisponibles: 1,
      mensaje: '1 hospital disponible en el área',
    };

    (request as jest.Mock).mockResolvedValue({
      recomendarHospitales: mockRecommendations,
    });

    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals: DatosPaciente = {
      edad: 45,
      sexo: 'M',
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    const ubicacion: Ubicacion = {
      latitud: 4.6097,
      longitud: -74.0817,
    };

    await act(async () => {
      await result.current.recomendarHospitales(vitals, ubicacion);
    });

    await waitFor(() => {
      expect(result.current.recomendaciones).toEqual(mockRecommendations);
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear error state', async () => {
    (request as jest.Mock).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals: DatosPaciente = {
      edad: 45,
      sexo: 'M',
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    await act(async () => {
      await result.current.evaluarPaciente(vitals);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset all state', async () => {
    const mockEvaluacion = {
      severidad: 'ALTO',
      confianza: 0.89,
      requiereTraslado: true,
      probabilidades: {
        critico: 0.15,
        alto: 0.68,
        medio: 0.15,
        bajo: 0.02,
      },
    };

    (request as jest.Mock).mockResolvedValue({
      evaluarPaciente: mockEvaluacion,
    });

    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals: DatosPaciente = {
      edad: 45,
      sexo: 'M',
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    await act(async () => {
      await result.current.evaluarPaciente(vitals);
    });

    await waitFor(() => {
      expect(result.current.evaluacion).not.toBeNull();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.evaluacion).toBeNull();
    expect(result.current.recomendaciones).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
