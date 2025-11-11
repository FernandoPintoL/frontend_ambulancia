// @ts-nocheck
// @ts-nocheck
import { graphqlClient } from './graphql-client';
import * as queries from './incident-queries';
import * as mutations from './incident-mutations';

/**
 * Incident Repository
 * Handles all GraphQL operations for incident management from MS Recepción
 */

export interface CreateIncidentInput {
  descripcionOriginal: string;
  tipoIncidenteReportado?: string;
  solicitanteInput: {
    nombreCompleto: string;
    telefono: string;
    email?: string;
    canalOrigen: string;
    idExterno?: string;
  };
  ubicacionInput: {
    descripcionTextual: string;
    referencia?: string;
    latitud?: number;
    longitud?: number;
    ciudad?: string;
    distrito?: string;
    zona?: string;
    direccion?: string;
  };
  mediaUrls?: string[];
}

export interface UpdateIncidentInput {
  id: string;
  descripcionOriginal?: string;
  tipoIncidenteReportado?: string;
  observaciones?: string;
}

export interface IncidentFilter {
  estado?: string;
  prioridadMin?: number;
  prioridadMax?: number;
  fechaInicio?: string;
  fechaFin?: string;
  solicitanteId?: string;
  distrito?: string;
  esVerosimil?: boolean;
  canalOrigen?: string;
}

export interface PaginationInput {
  page?: number;
  size?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export class IncidentRepository {
  /**
   * Fetch a single incident by ID
   */
  static async getIncident(id: string) {
    // @ts-ignore
    const { incidente } = await graphqlClient.request(queries.GET_INCIDENT, {
      id,
    });
    return incidente;
  }

  /**
   * Fetch list of incidents with optional filters
   */
  static async listIncidents(
    filters?: IncidentFilter,
    pagination?: PaginationInput
  ) {
    const { incidentes } = await graphqlClient.request(queries.LIST_INCIDENTS, {
      estado: filters?.estado,
      prioridadMin: filters?.prioridadMin,
      prioridadMax: filters?.prioridadMax,
      fechaInicio: filters?.fechaInicio,
      fechaFin: filters?.fechaFin,
      solicitanteId: filters?.solicitanteId,
      distrito: filters?.distrito,
      esVerosimil: filters?.esVerosimil,
      canalOrigen: filters?.canalOrigen,
      page: pagination?.page ?? 0,
      size: pagination?.size ?? 20,
      orderBy: pagination?.orderBy ?? 'fechaReporte',
      direction: pagination?.direction ?? 'DESC',
    });
    return incidentes;
  }

  /**
   * Fetch high priority incidents
   */
  static async getHighPriorityIncidents(pagination?: PaginationInput) {
    const { incidentesPrioridadAlta } = await graphqlClient.request(
      queries.GET_HIGH_PRIORITY_INCIDENTS,
      {
        page: pagination?.page ?? 0,
        size: pagination?.size ?? 10,
      }
    );
    return incidentesPrioridadAlta;
  }

  /**
   * Fetch incidents pending ML analysis
   */
  static async getPendingAnalysisIncidents(pagination?: PaginationInput) {
    const { incidentesPendientesAnalisis } = await graphqlClient.request(
      queries.GET_PENDING_ANALYSIS_INCIDENTS,
      {
        page: pagination?.page ?? 0,
        size: pagination?.size ?? 10,
      }
    );
    return incidentesPendientesAnalisis;
  }

  /**
   * Fetch incidents ready for dispatch
   */
  static async getIncidentsForDispatch(pagination?: PaginationInput) {
    const { incidentesParaDespacho } = await graphqlClient.request(
      queries.GET_INCIDENTS_FOR_DISPATCH,
      {
        page: pagination?.page ?? 0,
        size: pagination?.size ?? 10,
      }
    );
    return incidentesParaDespacho;
  }

  /**
   * Fetch incidents by state
   */
  static async getIncidentsByState(
    estado: string,
    pagination?: PaginationInput
  ) {
    const { incidentesPorEstado } = await graphqlClient.request(
      queries.GET_INCIDENTS_BY_STATE,
      {
        estado,
        page: pagination?.page ?? 0,
        size: pagination?.size ?? 20,
      }
    );
    return incidentesPorEstado;
  }

  /**
   * Fetch incidents within a date range
   */
  static async getIncidentsByDateRange(
    fechaInicio: string,
    fechaFin: string,
    pagination?: PaginationInput
  ) {
    const { incidentesPorRangoFechas } = await graphqlClient.request(
      queries.GET_INCIDENTS_BY_DATE_RANGE,
      {
        fechaInicio,
        fechaFin,
        page: pagination?.page ?? 0,
        size: pagination?.size ?? 20,
      }
    );
    return incidentesPorRangoFechas;
  }

  /**
   * Fetch incident statistics
   */
  static async getIncidentStatistics(filters?: IncidentFilter) {
    const { estadisticasIncidentes } = await graphqlClient.request(
      queries.GET_INCIDENT_STATISTICS,
      {
        estado: filters?.estado,
      }
    );
    return estadisticasIncidentes;
  }

  /**
   * Fetch incident state change history
   */
  static async getIncidentHistory(incidenteId: string) {
    const { historialIncidente } = await graphqlClient.request(
      queries.GET_INCIDENT_HISTORY,
      {
        incidenteId,
      }
    );
    return historialIncidente;
  }

  /**
   * Create a new incident
   */
  static async createIncident(input: CreateIncidentInput) {
    const { crearIncidente } = await graphqlClient.request(
      mutations.CREATE_INCIDENT,
      {
        descripcionOriginal: input.descripcionOriginal,
        tipoIncidenteReportado: input.tipoIncidenteReportado,
        solicitanteInput: input.solicitanteInput,
        ubicacionInput: input.ubicacionInput,
        mediaUrls: input.mediaUrls,
      }
    );
    return crearIncidente;
  }

  /**
   * Update an existing incident
   */
  static async updateIncident(input: UpdateIncidentInput) {
    const { actualizarIncidente } = await graphqlClient.request(
      mutations.UPDATE_INCIDENT,
      {
        id: input.id,
        descripcionOriginal: input.descripcionOriginal,
        tipoIncidenteReportado: input.tipoIncidenteReportado,
        observaciones: input.observaciones,
      }
    );
    return actualizarIncidente;
  }

  /**
   * Change incident state
   */
  static async changeIncidentState(
    id: string,
    nuevoEstado: string,
    motivo?: string
  ) {
    const { cambiarEstadoIncidente } = await graphqlClient.request(
      mutations.CHANGE_INCIDENT_STATE,
      {
        id,
        nuevoEstado,
        motivo,
      }
    );
    return cambiarEstadoIncidente;
  }

  /**
   * Approve an incident
   */
  static async approveIncident(id: string) {
    const { aprobarIncidente } = await graphqlClient.request(
      mutations.APPROVE_INCIDENT,
      {
        id,
      }
    );
    return aprobarIncidente;
  }

  /**
   * Reject an incident
   */
  static async rejectIncident(id: string, motivo: string) {
    const { rechazarIncidente } = await graphqlClient.request(
      mutations.REJECT_INCIDENT,
      {
        id,
        motivo,
      }
    );
    return rechazarIncidente;
  }

  /**
   * Cancel an incident
   */
  static async cancelIncident(id: string, motivo: string) {
    const { cancelarIncidente } = await graphqlClient.request(
      mutations.CANCEL_INCIDENT,
      {
        id,
        motivo,
      }
    );
    return cancelarIncidente;
  }

  /**
   * Send incident to text analysis
   */
  static async sendToTextAnalysis(incidenteId: string) {
    const { enviarAAnalisisTexto } = await graphqlClient.request(
      mutations.SEND_TO_TEXT_ANALYSIS,
      {
        incidenteId,
      }
    );
    return enviarAAnalisisTexto;
  }

  /**
   * Send incident to image analysis
   */
  static async sendToImageAnalysis(incidenteId: string) {
    const { enviarAAnalisisImagen } = await graphqlClient.request(
      mutations.SEND_TO_IMAGE_ANALYSIS,
      {
        incidenteId,
      }
    );
    return enviarAAnalisisImagen;
  }

  /**
   * Calculate final priority
   */
  static async calculateFinalPriority(incidenteId: string) {
    const { calcularPrioridadFinal } = await graphqlClient.request(
      mutations.CALCULATE_FINAL_PRIORITY,
      {
        incidenteId,
      }
    );
    return calcularPrioridadFinal;
  }
}

export default IncidentRepository;
