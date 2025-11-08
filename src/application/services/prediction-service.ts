/**
 * Prediction Service
 * Application Layer - Business logic for ML predictions
 */

import {
  predictionRepository,
} from '../../data/repositories/prediction-repository';

/**
 * Severity level categorization
 */
const SEVERITY_LEVELS = {
  1: { label: 'Critical', color: '#dc2626', description: 'Life-threatening emergency' },
  2: { label: 'High', color: '#f97316', description: 'Urgent medical emergency' },
  3: { label: 'Medium', color: '#eab308', description: 'Serious medical condition' },
  4: { label: 'Low', color: '#22c55e', description: 'Non-emergency transport' },
  5: { label: 'Info', color: '#3b82f6', description: 'Administrative/routine' },
};

/**
 * Prediction Service - handles ML prediction operations
 */
export class PredictionService {
  /**
   * Predict severity with categorization
   */
  async predictSeverity(description: string, age?: number) {
    const prediction = await predictionRepository.predictSeverity(description, age);

    const severity = SEVERITY_LEVELS[prediction.level as keyof typeof SEVERITY_LEVELS];

    return {
      ...prediction,
      ...severity,
    };
  }

  /**
   * Calculate ETA with human-readable format
   */
  async predictETA(
    originLat: number,
    originLon: number,
    destinationLat: number,
    destinationLon: number,
    trafficLevel?: number
  ) {
    const prediction = await predictionRepository.predictETA(
      originLat,
      originLon,
      destinationLat,
      destinationLon,
      trafficLevel
    );

    // Format time range
    const timeRange = `${Math.round(prediction.lowerBound)} - ${Math.round(
      prediction.upperBound
    )} minutes`;

    return {
      ...prediction,
      timeRange,
      confidence: Math.round(prediction.confidence * 100), // Convert to percentage
    };
  }

  /**
   * Get complete dispatch prediction
   */
  async getDispatchPrediction(data: {
    patientLat: number;
    patientLon: number;
    description: string;
    severityLevel: number;
    destinationLat: number;
    destinationLon: number;
  }) {
    const prediction = await predictionRepository.predictDispatch(data);

    // Enhance severity
    const severity = {
      ...prediction.severity,
      ...SEVERITY_LEVELS[prediction.severity.level as keyof typeof SEVERITY_LEVELS],
    };

    // Enhance ETA
    const etaTimeRange = `${Math.round(prediction.eta.lowerBound)} - ${Math.round(
      prediction.eta.upperBound
    )} minutes`;

    return {
      ...prediction,
      severity,
      eta: {
        ...prediction.eta,
        timeRange: etaTimeRange,
        confidence: Math.round(prediction.eta.confidence * 100),
      },
      performanceMs: prediction.pipelineTimeMs,
    };
  }

  /**
   * Get all models status with health indicators
   */
  async getModelsHealth() {
    const status = await predictionRepository.getAllModelsStatus();

    const models = {
      eta: {
        name: 'ETA Model',
        ...status.eta,
        healthy: status.eta.isLoaded,
      },
      severity: {
        name: 'Severity Model',
        ...status.severity,
        healthy: status.severity.isLoaded,
      },
      ambulance: {
        name: 'Ambulance Selector',
        ...status.ambulance,
        healthy: status.ambulance.isLoaded,
      },
      route: {
        name: 'Route Optimizer',
        ...status.route,
        healthy: status.route.isLoaded,
      },
    };

    const allHealthy = Object.values(models).every((m) => m.healthy);

    return {
      models,
      allHealthy,
      status: allHealthy ? 'healthy' : 'degraded',
    };
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(modelName: string, hours: number = 24) {
    const performance = await predictionRepository.getModelPerformance(modelName, hours);

    return {
      model: modelName,
      ...performance,
      predictionTimeMs: Math.round(performance.avgPredictionTime * 1000),
      confidencePercent: Math.round(performance.avgConfidence * 100),
      accuracyPercent: Math.round(performance.accuracy * 100),
    };
  }

  /**
   * Determine ambulance type needed based on severity
   */
  getRequiredAmbulanceType(severityLevel: number): string {
    if (severityLevel <= 2) return 'advanced'; // Critical and High
    if (severityLevel <= 3) return 'standard'; // Medium
    return 'basic'; // Low and Info
  }

  /**
   * Get severity recommendations for responders
   */
  getSeverityRecommendation(level: number): string {
    const recommendations: Record<number, string> = {
      1: 'Activate advanced life support. Deploy best available ambulance immediately.',
      2: 'Activate emergency protocols. Dispatch nearest ambulance with advanced equipment.',
      3: 'Standard response. Dispatch available ambulance with medical equipment.',
      4: 'Non-emergency transport. Standard ambulance sufficient.',
      5: 'Administrative transport. Any available ambulance.',
    };
    return recommendations[level] || 'Unknown severity level';
  }
}

export const predictionService = new PredictionService();
