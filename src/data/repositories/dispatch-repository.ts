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

export interface Ambulance {
  id: string;
  code?: string;
  status: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Dispatch {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone?: string;
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
  // Additional fields from backend
  direccion_origen?: string;
  ubicacion_origen_lat?: number;
  ubicacion_origen_lng?: number;
  ubicacion_destino_lat?: number;
  ubicacion_destino_lng?: number;
  ambulance?: Ambulance;
  fecha_asignacion?: string;
  fecha_llegada?: string;
  tiempo_real_min?: number;
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
  async getDispatchStatistics(): Promise<DispatchStatistics> {
    const { getDispatchStatistics } = await graphqlClient.request<{
      getDispatchStatistics: DispatchStatistics;
    }>(GET_DISPATCH_STATISTICS);
    return getDispatchStatistics;
  }

  /**
   * Create new dispatch
   */
  async createDispatch(data: any): Promise<Dispatch> {
    const { createDispatch } = await graphqlClient.request<{ createDispatch: Dispatch }>(
      CREATE_DISPATCH,
      { input: data }
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
   * Add feedback to dispatch
   */
  async addDispatchFeedback(dispatchId: string, feedback: any): Promise<Dispatch> {
    const { addDispatchFeedback } = await graphqlClient.request<{
      addDispatchFeedback: Dispatch;
    }>(ADD_DISPATCH_FEEDBACK, { dispatchId, feedback });
    return addDispatchFeedback;
  }

  /**
   * Optimize dispatch route
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
  async recordGpsLocation(dispatchId: string, latitude: number, longitude: number, speed?: number): Promise<any> {
    const { recordGpsLocation } = await graphqlClient.request<{ recordGpsLocation: any }>(
      RECORD_GPS_LOCATION,
      { dispatchId, latitude, longitude, speed }
    );
    return recordGpsLocation;
  }
}

export const dispatchRepository = new DispatchRepository();
