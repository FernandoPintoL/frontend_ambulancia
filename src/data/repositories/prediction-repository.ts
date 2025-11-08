/**
 * Prediction Repository
 * Data Layer - ML prediction operations
 */

import graphqlClient from './graphql-client';
import {
  PREDICT_SEVERITY,
  PREDICT_ETA,
  PREDICT_DISPATCH,
  GET_ALL_MODELS_STATUS,
  GET_MODEL_PERFORMANCE,
} from './queries';

export interface SeverityPrediction {
  level: number;
  category: string;
  confidence: number;
  recommendation: string;
}

export interface ETAPrediction {
  estimatedMinutes: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

export interface DispatchPrediction {
  severity: SeverityPrediction;
  ambulanceSelection: {
    ambulanceId: string;
    confidence: number;
    distance: number;
  };
  route: {
    primaryRoute: {
      distanceKm: number;
      etaMinutes: number;
    };
  };
  eta: ETAPrediction;
  pipelineTimeMs: number;
}

export interface ModelStatus {
  isLoaded: boolean;
  version: string;
  predictionCount?: number;
}

export interface AllModelsStatus {
  eta: ModelStatus;
  severity: ModelStatus;
  ambulance: ModelStatus;
  route: ModelStatus;
}

export interface ModelPerformance {
  totalPredictions: number;
  avgPredictionTime: number;
  avgConfidence: number;
  accuracy: number;
  mae: number;
}

class PredictionRepository {
  /**
   * Predict severity level
   */
  async predictSeverity(description: string, age?: number): Promise<SeverityPrediction> {
    const { predictSeverity } = await graphqlClient.request<{
      predictSeverity: SeverityPrediction;
    }>(PREDICT_SEVERITY, { description, age });
    return predictSeverity;
  }

  /**
   * Predict ETA
   */
  async predictETA(
    originLat: number,
    originLon: number,
    destinationLat: number,
    destinationLon: number,
    trafficLevel?: number
  ): Promise<ETAPrediction> {
    const { predictEta } = await graphqlClient.request<{ predictEta: ETAPrediction }>(
      PREDICT_ETA,
      { originLat, originLon, destinationLat, destinationLon, trafficLevel }
    );
    return predictEta;
  }

  /**
   * Predict complete dispatch with all models
   */
  async predictDispatch(data: {
    patientLat: number;
    patientLon: number;
    description: string;
    severityLevel: number;
    destinationLat: number;
    destinationLon: number;
  }): Promise<DispatchPrediction> {
    const { predictDispatch } = await graphqlClient.request<{ predictDispatch: DispatchPrediction }>(
      PREDICT_DISPATCH,
      data
    );
    return predictDispatch;
  }

  /**
   * Get all models status
   */
  async getAllModelsStatus(): Promise<AllModelsStatus> {
    const { allModelsStatus } = await graphqlClient.request<{ allModelsStatus: AllModelsStatus }>(
      GET_ALL_MODELS_STATUS
    );
    return allModelsStatus;
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(modelName: string, hours: number = 24): Promise<ModelPerformance> {
    const { modelPerformance } = await graphqlClient.request<{
      modelPerformance: ModelPerformance;
    }>(GET_MODEL_PERFORMANCE, { modelName, hours });
    return modelPerformance;
  }
}

export const predictionRepository = new PredictionRepository();
