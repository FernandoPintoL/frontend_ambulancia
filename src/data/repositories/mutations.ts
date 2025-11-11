// @ts-nocheck
/**
 * GraphQL Mutations
 * Data Layer - Mutation Definitions
 * NOTE: Using backend naming conventions (Spanish/camelCase)
 */

import { gql } from 'graphql-request';

/**
 * Create new dispatch with automatic assignment
 */
export const CREATE_DISPATCH = gql`
  mutation CrearDespacho(
    $solicitud_id: Int
    $ubicacionOrigenLat: Float!
    $ubicacionOrigenLng: Float!
    $direccion_origen: String
    $ubicacionDestinoLat: Float
    $ubicacionDestinoLng: Float
    $direccion_destino: String
    $incidente: String
    $prioridad: String
    $tipoAmbulancia: String
    $observaciones: String
  ) {
    crearDespacho(
      solicitud_id: $solicitud_id
      ubicacionOrigenLat: $ubicacionOrigenLat
      ubicacionOrigenLng: $ubicacionOrigenLng
      direccion_origen: $direccion_origen
      ubicacionDestinoLat: $ubicacionDestinoLat
      ubicacionDestinoLng: $ubicacionDestinoLng
      direccion_destino: $direccion_destino
      incidente: $incidente
      prioridad: $prioridad
      tipoAmbulancia: $tipoAmbulancia
      observaciones: $observaciones
    ) {
      id
      solicitud_id
      ambulancia_id
      fecha_solicitud
      estado
      prioridad
      direccion_origen
      direccion_destino
    }
  }
`;

/**
 * Update dispatch status
 */
export const UPDATE_DISPATCH_STATUS = gql`
  mutation ActualizarEstadoDespacho($id: Int!, $estado: String!) {
    actualizarEstadoDespacho(id: $id, estado: $estado) {
      id
      estado
      fechaAsignacion
      fechaLlegada
      fechaFinalizacion
      updatedAt
    }
  }
`;

/**
 * Update ambulance location
 */
export const UPDATE_AMBULANCE_LOCATION = gql`
  mutation ActualizarUbicacionAmbulancia(
    $id: Int!
    $ubicacionActualLat: Float!
    $ubicacionActualLng: Float!
    $preciscion: Float
  ) {
    actualizarUbicacionAmbulancia(
      id: $id
      ubicacionActualLat: $ubicacionActualLat
      ubicacionActualLng: $ubicacionActualLng
      preciscion: $preciscion
    ) {
      id
      ubicacionActualLat
      ubicacionActualLng
      ultimaActualizacion
    }
  }
`;

/**
 * Create personal
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
      nombreCompleto
      ci
      rol
      especialidad
      estado
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
      nombreCompleto
      especialidad
      experiencia
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
      estado
      updatedAt
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
      despacho_id
      personal_id
      rol_asignado
      es_responsable
      fechaAsignacion
    }
  }
`;

/**
 * Unassign personal from dispatch
 */
export const UNASSIGN_PERSONAL = gql`
  mutation DesasignarPersonal($id: Int!) {
    desasignarPersonal(id: $id) {
      id
      despacho_id
      personal_id
      fechaDesasignacion
    }
  }
`;

/**
 * Record GPS location for dispatch
 */
export const RECORD_GPS_LOCATION = gql`
  mutation RegistrarUbicacionGPS(
    $despacho_id: Int!
    $ubicacionLat: Float!
    $ubicacionLng: Float!
    $velocidad: Float
    $altitud: Float
    $precision: Float
  ) {
    registrarUbicacionGPS(
      despacho_id: $despacho_id
      ubicacionLat: $ubicacionLat
      ubicacionLng: $ubicacionLng
      velocidad: $velocidad
      altitud: $altitud
      precision: $precision
    ) {
      id
      ambulancia_id
      estado
      ubicacionOrigenLat
      ubicacionOrigenLng
    }
  }
`;

/**
 * Add dispatch feedback
 */
export const ADD_DISPATCH_FEEDBACK = gql`
  mutation AgregarFeedbackDespacho(
    $despacho_id: Int!
    $calificacion: Int!
    $comentario: String
    $resultadoPaciente: String
  ) {
    agregarFeedbackDespacho(
      despacho_id: $despacho_id
      calificacion: $calificacion
      comentario: $comentario
      resultadoPaciente: $resultadoPaciente
    ) {
      despacho_id
      calificacion
      comentario
      resultadoPaciente
      registradoAt
    }
  }
`;

/**
 * Optimize dispatch
 */
export const OPTIMIZE_DISPATCH = gql`
  mutation OptimizarDespacho($despacho_id: Int!) {
    optimizarDespacho(despacho_id: $despacho_id) {
      despacho_id
      ambulanciaSugeridaId
      confianza
      tiempoEstimadoMin
      distanciaKm
      razonCambio
    }
  }
`;

/**
 * Create user for personal access
 * This mutation is sent to the auth microservice
 */
export const CREATE_USER_FOR_PERSONAL = gql`
  mutation CreateUser(
    $name: String!
    $email: String!
    $phone: String
    $password: String!
    $roleId: ID!
  ) {
    createUser(
      name: $name
      email: $email
      phone: $phone
      password: $password
      roleId: $roleId
    ) {
      success
      message
      user {
        id
        name
        email
        phone
        status
        roles {
          id
          name
        }
      }
    }
  }
`;
