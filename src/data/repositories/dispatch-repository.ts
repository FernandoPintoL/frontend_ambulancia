// @ts-nocheck
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
  async getDispatch(id: number): Promise<Dispatch> {
    const { despacho } = await graphqlClient.request<{ despacho: Dispatch }>(
      GET_DISPATCH,
      { id }
    );
    return despacho;
  }

  /**
   * List dispatches with optional filtering
   */
  async listDispatches(
    estado?: string,
    limit: number = 50,
    prioridad?: string,
    activos?: boolean
  ): Promise<Dispatch[]> {
    const { despachos } = await graphqlClient.request<{ despachos: Dispatch[] }>(
      LIST_DISPATCHES,
      { estado, limit, prioridad, activos }
    );
    return despachos;
  }

  /**
   * Create new dispatch
   */
  async createDispatch(data: any): Promise<Dispatch> {
    const { crearDespacho } = await graphqlClient.request<{ crearDespacho: Dispatch }>(
      CREATE_DISPATCH,
      {
        solicitud_id: data.solicitud_id,
        ubicacionOrigenLat: data.ubicacionOrigenLat || data.ubicacion_origen_lat,
        ubicacionOrigenLng: data.ubicacionOrigenLng || data.ubicacion_origen_lng,
        direccion_origen: data.direccion_origen,
        ubicacionDestinoLat: data.ubicacionDestinoLat || data.ubicacion_destino_lat,
        ubicacionDestinoLng: data.ubicacionDestinoLng || data.ubicacion_destino_lng,
        direccion_destino: data.direccion_destino,
        incidente: data.incidente || 'emergencia_medica',
        prioridad: data.prioridad || 'media',
        tipoAmbulancia: data.tipoAmbulancia || data.tipo_ambulancia,
        observaciones: data.observaciones,
      }
    );
    return crearDespacho;
  }

  /**
   * Update dispatch status
   */
  async updateDispatchStatus(id: number, estado: string): Promise<Dispatch> {
    const { actualizarEstadoDespacho } = await graphqlClient.request<{
      actualizarEstadoDespacho: Dispatch;
    }>(UPDATE_DISPATCH_STATUS, { id, estado });
    return actualizarEstadoDespacho;
  }

  /**
   * Get recent dispatches from last N hours
   */
  async getRecentDispatches(horas: number = 24, limit: number = 50): Promise<Dispatch[]> {
    const { despachosRecientes } = await graphqlClient.request<{ despachosRecientes: Dispatch[] }>(
      GET_RECENT_DISPATCHES,
      { horas, limit }
    );
    return despachosRecientes;
  }

  /**
   * Get dispatch statistics
   */
  async getDispatchStatistics(horas: number = 24): Promise<DispatchStatistics> {
    const { estadisticasDespachos } = await graphqlClient.request<{
      estadisticasDespachos: DispatchStatistics;
    }>(GET_DISPATCH_STATISTICS, { horas });
    return estadisticasDespachos;
  }

  /**
   * Record GPS location for dispatch
   */
  async recordGpsLocation(
    despacho_id: number,
    ubicacionLat: number,
    ubicacionLng: number,
    velocidad?: number,
    altitud?: number,
    precision?: number
  ): Promise<any> {
    const { registrarUbicacionGPS } = await graphqlClient.request<{ registrarUbicacionGPS: any }>(
      RECORD_GPS_LOCATION,
      { despacho_id, ubicacionLat, ubicacionLng, velocidad, altitud, precision }
    );
    return registrarUbicacionGPS;
  }

  /**
   * Add feedback to dispatch
   */
  async addDispatchFeedback(
    despacho_id: number,
    calificacion: number,
    comentario?: string,
    resultadoPaciente?: string
  ): Promise<any> {
    const { agregarFeedbackDespacho } = await graphqlClient.request<{
      agregarFeedbackDespacho: any;
    }>(ADD_DISPATCH_FEEDBACK, { despacho_id, calificacion, comentario, resultadoPaciente });
    return agregarFeedbackDespacho;
  }

  /**
   * Optimize dispatch using ML
   */
  async optimizeDispatch(despacho_id: number): Promise<any> {
    const { optimizarDespacho } = await graphqlClient.request<{ optimizarDespacho: any }>(
      OPTIMIZE_DISPATCH,
      { despacho_id }
    );
    return optimizarDespacho;
  }
}

export const dispatchRepository = new DispatchRepository();
