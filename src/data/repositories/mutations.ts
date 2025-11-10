/**
 * GraphQL Mutations
 * Data Layer - Mutation Definitions
 */

import { gql } from 'graphql-request';

/**
 * Create new dispatch
 */
export const CREATE_DISPATCH = gql`
  mutation CreateDispatch(
    $patientName: String!
    $patientAge: Int!
    $patientLat: Float!
    $patientLon: Float!
    $description: String!
    $severityLevel: Int!
  ) {
    createDispatch(
      patientName: $patientName
      patientAge: $patientAge
      patientLat: $patientLat
      patientLon: $patientLon
      description: $description
      severityLevel: $severityLevel
    ) {
      id
      patientName
      status
      createdAt
    }
  }
`;

/**
 * Update dispatch status
 */
export const UPDATE_DISPATCH_STATUS = gql`
  mutation UpdateDispatchStatus($dispatchId: ID!, $status: String!) {
    updateDispatchStatus(dispatchId: $dispatchId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

/**
 * Assign ambulance to dispatch
 */
export const ASSIGN_AMBULANCE = gql`
  mutation AssignAmbulance($dispatchId: ID!, $ambulanceId: ID!) {
    assignAmbulance(dispatchId: $dispatchId, ambulanceId: $ambulanceId) {
      id
      assignedAmbulanceId
      status
    }
  }
`;

/**
 * Optimize dispatch
 */
export const OPTIMIZE_DISPATCH = gql`
  mutation OptimizeDispatch($dispatchId: ID!) {
    optimizeDispatch(dispatchId: $dispatchId) {
      severity {
        level
        confidence
      }
      ambulanceSelection {
        ambulanceId
        distance
      }
      eta {
        estimatedMinutes
      }
    }
  }
`;

/**
 * Add dispatch feedback
 */
export const ADD_DISPATCH_FEEDBACK = gql`
  mutation AddDispatchFeedback(
    $dispatchId: ID!
    $rating: Int!
    $comment: String
    $responseTimeMinutes: Int
    $patientOutcome: String
  ) {
    addDispatchFeedback(
      dispatchId: $dispatchId
      rating: $rating
      comment: $comment
      responseTimeMinutes: $responseTimeMinutes
      patientOutcome: $patientOutcome
    ) {
      dispatchId
      rating
      comment
    }
  }
`;

/**
 * Update ambulance location
 */
export const UPDATE_AMBULANCE_LOCATION = gql`
  mutation UpdateAmbulanceLocation(
    $ambulanceId: ID!
    $latitude: Float!
    $longitude: Float!
    $accuracy: Float
  ) {
    updateAmbulanceLocation(
      ambulanceId: $ambulanceId
      latitude: $latitude
      longitude: $longitude
      accuracy: $accuracy
    ) {
      id
      currentLocation {
        latitude
        longitude
      }
      lastLocationUpdate
    }
  }
`;

/**
 * Set ambulance status
 */
export const SET_AMBULANCE_STATUS = gql`
  mutation SetAmbulanceStatus($ambulanceId: ID!, $status: String!) {
    setAmbulanceStatus(ambulanceId: $ambulanceId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

/**
 * Retrain models
 */
export const RETRAIN_MODELS = gql`
  mutation RetrainModels($days: Int!, $autoActivate: Boolean!) {
    retrainModels(days: $days, autoActivate: $autoActivate)
  }
`;

/**
 * Activate model version
 */
export const ACTIVATE_MODEL_VERSION = gql`
  mutation ActivateModelVersion($modelName: String!, $version: String!) {
    activateModelVersion(modelName: $modelName, version: $version) {
      version
      modelType
      isActive
      activatedAt
    }
  }
`;

/**
 * Record GPS location for dispatch
 */
export const RECORD_GPS_LOCATION = gql`
  mutation RecordGpsLocation(
    $dispatchId: ID!
    $latitude: Float!
    $longitude: Float!
    $velocidad: Float
    $altitud: Float
    $precision: Float
  ) {
    recordGpsLocation(
      dispatchId: $dispatchId
      latitude: $latitude
      longitude: $longitude
      velocidad: $velocidad
      altitud: $altitud
      precision: $precision
    ) {
      id
      dispatchId
      latitud
      longitud
      velocidad
      altitud
      precision
      timestamp_gps
    }
  }
`;

/**
 * Create new personal
 */
export const CREATE_PERSONAL = gql`
  mutation CrearPersonal(
    $nombre: String!
    $apellido: String!
    $ci: String!
    $rol: String!
    $especialidad: String
    $experiencia: Int
    $telefono: String
    $email: String
  ) {
    crearPersonal(
      nombre: $nombre
      apellido: $apellido
      ci: $ci
      rol: $rol
      especialidad: $especialidad
      experiencia: $experiencia
      telefono: $telefono
      email: $email
    ) {
      id
      nombre
      apellido
      nombre_completo
      ci
      rol
      especialidad
      experiencia
      estado
      telefono
      email
      created_at
    }
  }
`;

/**
 * Update personal
 */
export const UPDATE_PERSONAL = gql`
  mutation ActualizarPersonal(
    $id: Int!
    $nombre: String
    $apellido: String
    $especialidad: String
    $experiencia: Int
    $telefono: String
    $email: String
  ) {
    actualizarPersonal(
      id: $id
      nombre: $nombre
      apellido: $apellido
      especialidad: $especialidad
      experiencia: $experiencia
      telefono: $telefono
      email: $email
    ) {
      id
      nombre
      apellido
      nombre_completo
      ci
      rol
      especialidad
      experiencia
      estado
      telefono
      email
      updated_at
    }
  }
`;

/**
 * Change personal status
 */
export const CHANGE_PERSONAL_STATUS = gql`
  mutation CambiarEstadoPersonal($id: Int!, $estado: String!) {
    cambiarEstadoPersonal(id: $id, estado: $estado) {
      id
      nombre
      apellido
      nombre_completo
      estado
      updated_at
    }
  }
`;

/**
 * Assign personal to dispatch
 */
export const ASSIGN_PERSONAL = gql`
  mutation AsignarPersonal(
    $despacho_id: Int!
    $personal_id: Int!
    $rol_asignado: String!
    $es_responsable: Boolean
  ) {
    asignarPersonal(
      despacho_id: $despacho_id
      personal_id: $personal_id
      rol_asignado: $rol_asignado
      es_responsable: $es_responsable
    ) {
      id
      personalAsignado {
        id
        nombre
        apellido
        nombre_completo
        rol
        estado
      }
    }
  }
`;

/**
 * Remove personal from dispatch
 */
export const UNASSIGN_PERSONAL = gql`
  mutation DesasignarPersonal($despacho_id: Int!, $personal_id: Int!) {
    desasignarPersonal(despacho_id: $despacho_id, personal_id: $personal_id) {
      id
      personalAsignado {
        id
        nombre
        apellido
        nombre_completo
        rol
      }
    }
  }
`;
