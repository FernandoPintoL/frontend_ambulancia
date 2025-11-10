/**
 * Dispatch Repository
 * Data Layer - Dispatch data operations
 */

import graphqlClient from './graphql-client';
import {
  GET_DISPATCH,
  LIST_DISPATCHES,
  GET_RECENT_DISPATCHES,
  GET_DISPATCH_STATISTICS,
} from './queries';
import {
  CREATE_DISPATCH,
  UPDATE_DISPATCH_STATUS,
  ASSIGN_AMBULANCE,
  ADD_DISPATCH_FEEDBACK,
  OPTIMIZE_DISPATCH,
  RECORD_GPS_LOCATION,
} from './mutations';

export interface Dispatch {
  id: string;
  patientName: string;
  patientAge: number;
  patientLocation: {
    latitude: number;
    longitude: number;
  };
  description: string;
  severityLevel: number;
  status: string;
  assignedAmbulanceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchStatistics {
  total: number;
  completionRate: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  pendingCount: number;
  inTransitCount: number;
}

class DispatchRepository {
  /**
   * Get dispatch by ID
   */
  async getDispatch(dispatchId: string): Promise<Dispatch> {
    const { getDispatch } = await graphqlClient.request<{ getDispatch: Dispatch }>(
      GET_DISPATCH,
      { dispatchId }
    );
    return getDispatch;
  }

  /**
   * List dispatches with optional filtering
   */
  async listDispatches(
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Dispatch[]> {
    const { listDispatches } = await graphqlClient.request<{ listDispatches: Dispatch[] }>(
      LIST_DISPATCHES,
      { status, limit, offset }
    );
    return listDispatches;
  }

  /**
   * Get recent dispatches
   */
  async getRecentDispatches(hours: number = 24, limit: number = 10): Promise<Dispatch[]> {
    const { getRecentDispatches } = await graphqlClient.request<{ getRecentDispatches: Dispatch[] }>(
      GET_RECENT_DISPATCHES,
      { hours, limit }
    );
    return getRecentDispatches;
  }

  /**
   * Get dispatch statistics
   */
  async getDispatchStatistics(hours: number = 24): Promise<DispatchStatistics> {
    const { dispatchStatistics } = await graphqlClient.request<{
      dispatchStatistics: DispatchStatistics;
    }>(GET_DISPATCH_STATISTICS, { hours });
    return dispatchStatistics;
  }

  /**
   * Create dispatch
   */
  async createDispatch(data: {
    patientName: string;
    patientAge: number;
    patientLat: number;
    patientLon: number;
    description: string;
    severityLevel: number;
  }): Promise<Dispatch> {
    const { createDispatch } = await graphqlClient.request<{ createDispatch: Dispatch }>(
      CREATE_DISPATCH,
      data
    );
    return createDispatch;
  }

  /**
   * Update dispatch status
   */
  async updateDispatchStatus(dispatchId: string, status: string): Promise<Dispatch> {
    const { updateDispatchStatus } = await graphqlClient.request<{
      updateDispatchStatus: Dispatch;
    }>(UPDATE_DISPATCH_STATUS, { dispatchId, status });
    return updateDispatchStatus;
  }

  /**
   * Assign ambulance to dispatch
   */
  async assignAmbulance(dispatchId: string, ambulanceId: string): Promise<Dispatch> {
    const { assignAmbulance } = await graphqlClient.request<{ assignAmbulance: Dispatch }>(
      ASSIGN_AMBULANCE,
      { dispatchId, ambulanceId }
    );
    return assignAmbulance;
  }

  /**
   * Add dispatch feedback
   */
  async addDispatchFeedback(
    dispatchId: string,
    feedback: {
      rating: number;
      comment?: string;
      responseTimeMinutes?: number;
      patientOutcome?: string;
    }
  ): Promise<{ dispatchId: string; rating: number; comment: string }> {
    const { addDispatchFeedback } = await graphqlClient.request<{
      addDispatchFeedback: { dispatchId: string; rating: number; comment: string };
    }>(ADD_DISPATCH_FEEDBACK, { dispatchId, ...feedback });
    return addDispatchFeedback;
  }

  /**
   * Optimize dispatch
   */
  async optimizeDispatch(dispatchId: string): Promise<any> {
    const { optimizeDispatch } = await graphqlClient.request<{ optimizeDispatch: any }>(
      OPTIMIZE_DISPATCH,
      { dispatchId }
    );
    return optimizeDispatch;
  }

  /**
   * Record GPS location for dispatch
   */
  async recordGpsLocation(
    dispatchId: string,
    latitude: number,
    longitude: number,
    velocidad?: number,
    altitud?: number,
    precision?: number
  ): Promise<any> {
    const { recordGpsLocation } = await graphqlClient.request<{ recordGpsLocation: any }>(
      RECORD_GPS_LOCATION,
      {
        dispatchId,
        latitude,
        longitude,
        velocidad,
        altitud,
        precision,
      }
    );
    return recordGpsLocation;
  }
}

export const dispatchRepository = new DispatchRepository();
