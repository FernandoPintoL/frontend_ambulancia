// @ts-nocheck
import { useCallback, useState } from 'react';
import { request } from 'graphql-request';
import {
  EVALUATE_PATIENT_QUERY,
  RECOMMEND_HOSPITALS_QUERY,
  GET_CLUSTERS_QUERY,
  GET_SYSTEM_STATISTICS_QUERY,
  DatosPaciente,
  Ubicacion,
  Evaluacion,
  RecomendacionHospitales,
  ClusterInfo,
  EstadisticasSistema,
} from '../../data/repositories/decision-queries';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

/**
 * Custom Hook for Clinical Decision Support
 * Provides methods for evaluating patient severity and recommending hospitals
 */
export function useDecisionRecommendation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionHospitales | null>(null);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasSistema | null>(null);

  /**
   * Evaluate patient severity based on vital signs
   */
  const evaluarPaciente = useCallback(async (datosPaciente: DatosPaciente): Promise<Evaluacion | null> => {
    setLoading(true);
    setError(null);

    try {
      const data: { evaluarPaciente: Evaluacion } = await request(GRAPHQL_ENDPOINT, EVALUATE_PATIENT_QUERY, {
        datosPaciente,
      });

      setEvaluacion(data.evaluarPaciente);
      return data.evaluarPaciente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error evaluating patient';
      setError(errorMessage);
      console.error('Error evaluating patient:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get hospital recommendations based on patient data and location
   */
  const recomendarHospitales = useCallback(
    async (
      datosPaciente: DatosPaciente,
      ubicacionPaciente: Ubicacion,
      topN: number = 5
    ): Promise<RecomendacionHospitales | null> => {
      setLoading(true);
      setError(null);

      try {
        const data: { recomendarHospitales: RecomendacionHospitales } = await request(
          GRAPHQL_ENDPOINT,
          RECOMMEND_HOSPITALS_QUERY,
          {
            datosPaciente,
            ubicacionPaciente,
            topN,
          }
        );

        setRecomendaciones(data.recomendarHospitales);
        return data.recomendarHospitales;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error recommending hospitals';
        setError(errorMessage);
        console.error('Error recommending hospitals:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get all hospital clusters and their specialties
   */
  const obtenerClusters = useCallback(async (): Promise<ClusterInfo[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data: { obtenerClusters: ClusterInfo[] } = await request(GRAPHQL_ENDPOINT, GET_CLUSTERS_QUERY);

      setClusters(data.obtenerClusters);
      return data.obtenerClusters;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching clusters';
      setError(errorMessage);
      console.error('Error fetching clusters:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get system statistics and performance metrics
   */
  const obtenerEstadisticas = useCallback(async (): Promise<EstadisticasSistema | null> => {
    setLoading(true);
    setError(null);

    try {
      const data: { estadisticasSistema: EstadisticasSistema } = await request(
        GRAPHQL_ENDPOINT,
        GET_SYSTEM_STATISTICS_QUERY
      );

      setEstadisticas(data.estadisticasSistema);
      return data.estadisticasSistema;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setEvaluacion(null);
    setRecomendaciones(null);
    setClusters([]);
    setEstadisticas(null);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    evaluacion,
    recomendaciones,
    clusters,
    estadisticas,

    // Methods
    evaluarPaciente,
    recomendarHospitales,
    obtenerClusters,
    obtenerEstadisticas,
    clearError,
    reset,
  };
}

export default useDecisionRecommendation;
