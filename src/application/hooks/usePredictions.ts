// @ts-nocheck
/**
 * usePredictions Hook
 * Application Layer - Custom React Hook for ML predictions
 */

import { useCallback, useState } from 'react';
import { predictionService } from '../services/prediction-service';

/**
 * Hook to manage ML prediction operations
 * NOTE: Currently disabled as the backend ML service is not yet deployed
 */
export const usePredictions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const predictSeverity = useCallback(
  //   async (description: string, age?: number) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const prediction = await predictionService.predictSeverity(description, age);
  //       return prediction;
  //     } catch (err) {
  //       const message = err instanceof Error ? err.message : 'Failed to predict severity';
  //       setError(message);
  //       throw err;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   []
  // );

  // const predictETA = useCallback(
  //   async (
  //     originLat: number,
  //     originLon: number,
  //     destinationLat: number,
  //     destinationLon: number,
  //     trafficLevel?: number
  //   ) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const prediction = await predictionService.predictETA(
  //         originLat,
  //         originLon,
  //         destinationLat,
  //         destinationLon,
  //         trafficLevel
  //       );
  //       return prediction;
  //     } catch (err) {
  //       const message = err instanceof Error ? err.message : 'Failed to predict ETA';
  //       setError(message);
  //       throw err;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   []
  // );

  // const getDispatchPrediction = useCallback(
  //   async (data: {
  //     patientLat: number;
  //     patientLon: number;
  //     description: string;
  //     severityLevel: number;
  //     destinationLat: number;
  //     destinationLon: number;
  //   }) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const prediction = await predictionService.getDispatchPrediction(data);
  //       return prediction;
  //     } catch (err) {
  //       const message = err instanceof Error ? err.message : 'Failed to get dispatch prediction';
  //       setError(message);
  //       throw err;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   []
  // );

  // const getModelsHealth = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const health = await predictionService.getModelsHealth();
  //     return health;
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : 'Failed to get models health';
  //     setError(message);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // const getModelPerformance = useCallback(
  //   async (modelName: string, hours: number = 24) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const performance = await predictionService.getModelPerformance(modelName, hours);
  //       return performance;
  //     } catch (err) {
  //       const message = err instanceof Error ? err.message : 'Failed to get model performance';
  //       setError(message);
  //       throw err;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   []
  // );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
  };
};
