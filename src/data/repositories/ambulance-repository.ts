// @ts-nocheck
/**
 * Ambulance Repository
 * Data Layer - Ambulance data operations
 * NOTE: Using backend naming conventions (Spanish/camelCase)
 */

import graphqlClient from './graphql-client';
import {
  GET_AMBULANCE,
  LIST_AMBULANCES,
} from './queries';
import {
  UPDATE_AMBULANCE_LOCATION,
} from './mutations';

export interface Ambulance {
  id: number;
  placa: string;
  modelo: string;
  tipoAmbulancia: string;
  estado: string;
  caracteristicas?: any;
  ubicacionActualLat: number;
  ubicacionActualLng: number;
  ultimaActualizacion: string;
}

class AmbulanceRepository {
  /**
   * Get ambulance by ID
   */
  async getAmbulance(id: number): Promise<Ambulance> {
    const { ambulancia } = await graphqlClient.request<{ ambulancia: Ambulance }>(
      GET_AMBULANCE,
      { id }
    );
    return ambulancia;
  }

  /**
   * List ambulances with optional filtering
   */
  async listAmbulances(tipoAmbulancia?: string, estado?: string, disponibles?: boolean): Promise<Ambulance[]> {
    const { ambulancias } = await graphqlClient.request<{ ambulancias: Ambulance[] }>(
      LIST_AMBULANCES,
      { tipoAmbulancia, estado, disponibles }
    );
    return ambulancias;
  }

  /**
   * Update ambulance location
   */
  async updateLocation(
    id: number,
    ubicacionActualLat: number,
    ubicacionActualLng: number,
    preciscion?: number
  ): Promise<Ambulance> {
    const { actualizarUbicacionAmbulancia } = await graphqlClient.request<{
      actualizarUbicacionAmbulancia: Ambulance;
    }>(UPDATE_AMBULANCE_LOCATION, { id, ubicacionActualLat, ubicacionActualLng, preciscion });
    return actualizarUbicacionAmbulancia;
  }
}

export const ambulanceRepository = new AmbulanceRepository();
