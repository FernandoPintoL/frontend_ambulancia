/**
 * Ambulance Repository
 * Data Layer - Ambulance data operations
 */

import graphqlClient from './graphql-client';
import {
  GET_AMBULANCE,
  LIST_AMBULANCES,
  GET_AVAILABLE_AMBULANCES,
  GET_FLEET_STATUS,
  GET_AMBULANCE_STATS,
} from './queries';
import {
  UPDATE_AMBULANCE_LOCATION,
  SET_AMBULANCE_STATUS,
} from './mutations';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Ambulance {
  id: string;
  code: string;
  type: string;
  status: string;
  driverName: string;
  equipmentLevel: number;
  currentLocation: Location;
  lastLocationUpdate: string;
}

export interface AmbulanceStats {
  totalDispatches: number;
  completedDispatches: number;
  avgRating: number;
  avgResponseTime: number;
  highRatings: number;
  lowRatings: number;
}

export interface FleetStatus {
  totalAmbulances: number;
  available: number;
  inTransit: number;
  atHospital: number;
  maintenance: number;
  availabilityPercent: number;
}

class AmbulanceRepository {
  /**
   * Get ambulance by ID
   */
  async getAmbulance(ambulanceId: string): Promise<Ambulance> {
    const { getAmbulance } = await graphqlClient.request<{ getAmbulance: Ambulance }>(
      GET_AMBULANCE,
      { ambulanceId }
    );
    return getAmbulance;
  }

  /**
   * List ambulances with optional filtering
   */
  async listAmbulances(type?: string, status?: string): Promise<Ambulance[]> {
    const { listAmbulances } = await graphqlClient.request<{ listAmbulances: Ambulance[] }>(
      LIST_AMBULANCES,
      { type, status }
    );
    return listAmbulances;
  }

  /**
   * Get available ambulances near location
   */
  async getAvailableAmbulancesNear(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Array<Ambulance & { distanceKm: number }>> {
    const { getAvailableAmbulances } = await graphqlClient.request<{
      getAvailableAmbulances: Array<Ambulance & { distanceKm: number }>;
    }>(GET_AVAILABLE_AMBULANCES, { latitude, longitude, radiusKm });
    return getAvailableAmbulances;
  }

  /**
   * Get fleet status
   */
  async getFleetStatus(): Promise<FleetStatus> {
    const { fleetStatus } = await graphqlClient.request<{ fleetStatus: FleetStatus }>(
      GET_FLEET_STATUS
    );
    return fleetStatus;
  }

  /**
   * Get ambulance statistics
   */
  async getAmbulanceStats(ambulanceId: string, days: number = 30): Promise<AmbulanceStats> {
    const { ambulanceStats } = await graphqlClient.request<{ ambulanceStats: AmbulanceStats }>(
      GET_AMBULANCE_STATS,
      { ambulanceId, days }
    );
    return ambulanceStats;
  }

  /**
   * Update ambulance location
   */
  async updateLocation(
    ambulanceId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<Ambulance> {
    const { updateAmbulanceLocation } = await graphqlClient.request<{
      updateAmbulanceLocation: Ambulance;
    }>(UPDATE_AMBULANCE_LOCATION, { ambulanceId, latitude, longitude, accuracy });
    return updateAmbulanceLocation;
  }

  /**
   * Set ambulance status
   */
  async setStatus(ambulanceId: string, status: string): Promise<Ambulance> {
    const { setAmbulanceStatus } = await graphqlClient.request<{
      setAmbulanceStatus: Ambulance;
    }>(SET_AMBULANCE_STATUS, { ambulanceId, status });
    return setAmbulanceStatus;
  }
}

export const ambulanceRepository = new AmbulanceRepository();
