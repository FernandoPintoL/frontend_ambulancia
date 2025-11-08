/**
 * Dispatch Service
 * Application Layer - Business logic for dispatch operations
 */

import {
  dispatchRepository,
  Dispatch,
} from '../../data/repositories/dispatch-repository';
import {
  ambulanceRepository,
  Ambulance,
} from '../../data/repositories/ambulance-repository';
import { predictionRepository } from '../../data/repositories/prediction-repository';

/**
 * Dispatch Service - handles all dispatch-related business logic
 */
export class DispatchService {
  /**
   * Get dispatch with related data
   */
  async getDispatchWithDetails(dispatchId: string) {
    const dispatch = await dispatchRepository.getDispatch(dispatchId);

    let ambulance: Ambulance | null = null;
    if (dispatch.assignedAmbulanceId) {
      ambulance = await ambulanceRepository.getAmbulance(dispatch.assignedAmbulanceId);
    }

    return {
      ...dispatch,
      ambulance,
    };
  }

  /**
   * Create dispatch and get prediction
   */
  async createDispatchWithPrediction(data: {
    patientName: string;
    patientAge: number;
    patientLat: number;
    patientLon: number;
    description: string;
    severityLevel: number;
  }) {
    // Create dispatch
    const dispatch = await dispatchRepository.createDispatch(data);

    // Get prediction for dispatch
    const prediction = await predictionRepository.predictDispatch({
      patientLat: data.patientLat,
      patientLon: data.patientLon,
      description: data.description,
      severityLevel: data.severityLevel,
      destinationLat: data.patientLat,
      destinationLon: data.patientLon,
    });

    // If ambulance was suggested, assign it
    if (prediction.ambulanceSelection.ambulanceId) {
      try {
        await dispatchRepository.assignAmbulance(
          dispatch.id,
          prediction.ambulanceSelection.ambulanceId
        );
      } catch (error) {
        console.error('Error assigning ambulance:', error);
      }
    }

    return {
      dispatch,
      prediction,
    };
  }

  /**
   * Get recent dispatches grouped by status
   */
  async getRecentDispatchesByStatus(hours: number = 24) {
    const dispatches = await dispatchRepository.getRecentDispatches(hours);

    const groupedByStatus = dispatches.reduce(
      (acc, dispatch) => {
        if (!acc[dispatch.status]) {
          acc[dispatch.status] = [];
        }
        acc[dispatch.status].push(dispatch);
        return acc;
      },
      {} as Record<string, Dispatch[]>
    );

    return groupedByStatus;
  }

  /**
   * Get dispatch with statistics
   */
  async getDispatchOverview(hours: number = 24) {
    const [recentDispatches, statistics] = await Promise.all([
      dispatchRepository.getRecentDispatches(hours, 100),
      dispatchRepository.getDispatchStatistics(hours),
    ]);

    return {
      statistics,
      dispatches: recentDispatches,
    };
  }

  /**
   * Complete dispatch with feedback
   */
  async completeDispatch(
    dispatchId: string,
    feedback: {
      rating: number;
      comment?: string;
      responseTimeMinutes?: number;
      patientOutcome?: string;
    }
  ) {
    await dispatchRepository.updateDispatchStatus(dispatchId, 'completed');
    const feedbackResult = await dispatchRepository.addDispatchFeedback(
      dispatchId,
      feedback
    );
    return feedbackResult;
  }

  /**
   * Update dispatch status with validation
   */
  async updateDispatchStatus(dispatchId: string, newStatus: string) {
    const validStatuses = [
      'pending',
      'in_transit',
      'at_patient',
      'returning',
      'completed',
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    return dispatchRepository.updateDispatchStatus(dispatchId, newStatus);
  }

  /**
   * Suggest optimal ambulance for dispatch
   */
  async suggestAmbulance(
    _dispatchId: string,
    patientLat: number,
    patientLon: number
  ) {
    // Get nearby ambulances
    const nearby = await ambulanceRepository.getAvailableAmbulancesNear(
      patientLat,
      patientLon,
      5
    );

    // Sort by distance
    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    // Return closest ambulance
    if (nearby.length > 0) {
      return nearby[0];
    }

    return null;
  }
}

export const dispatchService = new DispatchService();
