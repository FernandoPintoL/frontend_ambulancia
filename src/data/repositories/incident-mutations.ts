// @ts-nocheck
import { gql } from 'graphql-request';
import { INCIDENT_FRAGMENT } from './incident-queries';

/**
 * GraphQL Mutations for MS Recepción - Incident Management
 * These mutations modify incident data in the apollo-gateway
 */

export const CREATE_INCIDENT = gql`
  mutation CrearIncidente(
    $descripcionOriginal: String!
    $tipoIncidenteReportado: String
    $solicitanteInput: CrearSolicitanteInput!
    $ubicacionInput: CrearUbicacionInput!
    $mediaUrls: [String!]
  ) {
    crearIncidente(
      descripcionOriginal: $descripcionOriginal
      tipoIncidenteReportado: $tipoIncidenteReportado
      solicitanteInput: $solicitanteInput
      ubicacionInput: $ubicacionInput
      mediaUrls: $mediaUrls
    ) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const UPDATE_INCIDENT = gql`
  mutation ActualizarIncidente(
    $id: UUID!
    $descripcionOriginal: String
    $tipoIncidenteReportado: String
    $observaciones: String
  ) {
    actualizarIncidente(
      id: $id
      descripcionOriginal: $descripcionOriginal
      tipoIncidenteReportado: $tipoIncidenteReportado
      observaciones: $observaciones
    ) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const CHANGE_INCIDENT_STATE = gql`
  mutation CambiarEstadoIncidente(
    $id: UUID!
    $nuevoEstado: EstadoIncidente!
    $motivo: String
  ) {
    cambiarEstadoIncidente(
      id: $id
      nuevoEstado: $nuevoEstado
      motivo: $motivo
    ) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const APPROVE_INCIDENT = gql`
  mutation AprobarIncidente($id: UUID!) {
    aprobarIncidente(id: $id) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const REJECT_INCIDENT = gql`
  mutation RechazarIncidente($id: UUID!, $motivo: String!) {
    rechazarIncidente(id: $id, motivo: $motivo) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const CANCEL_INCIDENT = gql`
  mutation CancelarIncidente($id: UUID!, $motivo: String!) {
    cancelarIncidente(id: $id, motivo: $motivo) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const SEND_TO_TEXT_ANALYSIS = gql`
  mutation EnviarAAnalisisTexto($incidenteId: UUID!) {
    enviarAAnalisisTexto(incidenteId: $incidenteId) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const SEND_TO_IMAGE_ANALYSIS = gql`
  mutation EnviarAAnalisisImagen($incidenteId: UUID!) {
    enviarAAnalisisImagen(incidenteId: $incidenteId) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const CALCULATE_FINAL_PRIORITY = gql`
  mutation CalcularPrioridadFinal($incidenteId: UUID!) {
    calcularPrioridadFinal(incidenteId: $incidenteId) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;
