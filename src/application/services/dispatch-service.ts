// @ts-nocheck
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

/**
 * Dispatch Service - handles all dispatch-related business logic
 */
export class DispatchService {
  /**
   * Get dispatch with related data
   */
  async getDispatchWithDetails(dispatchId: number) {
    const dispatch = await dispatchRepository.getDispatch(dispatchId);

    let ambulance: Ambulance | null = null;
    if (dispatch.assignedAmbulanceId) {
      const ambulanceId = typeof dispatch.assignedAmbulanceId === 'string'
        ? parseInt(dispatch.assignedAmbulanceId, 10)
        : dispatch.assignedAmbulanceId;
      ambulance = await ambulanceRepository.getAmbulance(ambulanceId);
    }

    return {
      ...dispatch,
      ambulance,
    };
  }

  /**
   * Create dispatch with automatic assignment
   */
  async createDispatchWithPrediction(data: any) {
    // Create dispatch through repository
    const dispatch = await dispatchRepository.createDispatch({
      solicitud_id: data.solicitud_id,
      ubicacionOrigenLat: data.patientLat || data.ubicacionOrigenLat || data.ubicacion_origen_lat,
      ubicacionOrigenLng: data.patientLon || data.ubicacionOrigenLng || data.ubicacion_origen_lng,
      direccion_origen: data.address || data.direccionOrigen || data.direccion_origen,
      ubicacionDestinoLat: data.destinationLat || data.ubicacionDestinoLat || data.ubicacion_destino_lat,
      ubicacionDestinoLng: data.destinationLon || data.ubicacionDestinoLng || data.ubicacion_destino_lng,
      direccion_destino: data.direccionDestino || data.direccion_destino,
      incidente: data.incidente || 'emergencia_medica',
      prioridad: data.prioridad || 'media',
      tipoAmbulancia: data.tipoAmbulancia || data.tipo_ambulancia,
      observaciones: data.observaciones,
    });

    return {
      dispatch,
    };
  }

  /**
   * Get recent dispatches grouped by status
   */
  async getRecentDispatchesByStatus(horas: number = 24) {
    const dispatches = await dispatchRepository.getRecentDispatches(horas);

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
  async getDispatchOverview(horas: number = 24) {
    const [recentDispatches, statistics] = await Promise.all([
      dispatchRepository.getRecentDispatches(horas, 100),
      dispatchRepository.getDispatchStatistics(horas),
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
    dispatchId: number,
    feedback: any
  ) {
    await dispatchRepository.updateDispatchStatus(dispatchId, 'completado');

    if (feedback) {
      const feedbackResult = await dispatchRepository.addDispatchFeedback(
        dispatchId,
        feedback.calificacion || 5,
        feedback.comentario,
        feedback.resultado_paciente
      );
      return feedbackResult;
    }
  }

  /**
   * Update dispatch status with validation
   */
  async updateDispatchStatus(dispatchId: number, newStatus: string) {
    const validStatuses = [
      'pendiente',
      'asignado',
      'en_camino',
      'en_sitio',
      'trasladando',
      'completado',
      'cancelado',
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }

    return dispatchRepository.updateDispatchStatus(dispatchId, newStatus);
  }

  /**
   * Record GPS location for dispatch
   */
  async recordGpsLocation(
    dispatchId: number,
    latitude: number,
    longitude: number,
    speed?: number,
    altitude?: number,
    precision?: number
  ) {
    return dispatchRepository.recordGpsLocation(
      dispatchId,
      latitude,
      longitude,
      speed,
      altitude,
      precision
    );
  }

  /**
   * Optimize dispatch using ML
   */
  async optimizeDispatch(dispatchId: number) {
    return dispatchRepository.optimizeDispatch(dispatchId);
  }

  /**
   * Get dispatch statistics
   */
  async getDispatchStatistics(horas: number = 24) {
    return dispatchRepository.getDispatchStatistics(horas);
  }
}

export const dispatchService = new DispatchService();
