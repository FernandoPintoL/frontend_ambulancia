// @ts-nocheck
/**
 * GraphQL Queries
 * Data Layer - Query Definitions
 * NOTE: Using backend naming conventions (Spanish/camelCase)
 */

import { gql } from 'graphql-request';

/**
 * Get dispatch by ID
 */
export const GET_DISPATCH = gql`
  query GetDispatch($id: Int!) {
    despacho(id: $id) {
      id
      solicitud_id
      ambulancia_id
      fecha_solicitud
      fecha_asignacion
      fecha_llegada
      fecha_finalizacion
      ubicacion_origen_lat
      ubicacion_origen_lng
      direccion_origen
      ubicacion_destino_lat
      ubicacion_destino_lng
      direccion_destino
      distancia_km
      tiempo_estimado_min
      tiempo_real_min
      estado
      incidente
      decision
      prioridad
      observaciones
      datos_adicionales
    }
  }
`;

/**
 * List all dispatches with optional filtering
 */
export const LIST_DISPATCHES = gql`
  query ListDispatches($estado: String, $prioridad: String, $activos: Boolean, $limit: Int) {
    despachos(estado: $estado, prioridad: $prioridad, activos: $activos, limit: $limit) {
      id
      solicitud_id
      ambulancia_id
      fecha_solicitud
      fecha_asignacion
      fecha_llegada
      estado
      incidente
      prioridad
      direccion_origen
      direccion_destino
    }
  }
`;

/**
 * Get ambulance by ID
 */
export const GET_AMBULANCE = gql`
  query GetAmbulance($id: Int!) {
    ambulancia(id: $id) {
      id
      placa
      modelo
      tipoAmbulancia
      estado
      caracteristicas
      ubicacionActualLat
      ubicacionActualLng
      ultimaActualizacion
    }
  }
`;

/**
 * List ambulances with optional filtering
 */
export const LIST_AMBULANCES = gql`
  query ListAmbulances($tipoAmbulancia: String, $estado: String, $disponibles: Boolean) {
    ambulancias(tipoAmbulancia: $tipoAmbulancia, estado: $estado, disponibles: $disponibles) {
      id
      placa
      modelo
      tipoAmbulancia
      estado
      caracteristicas
      ubicacionActualLat
      ubicacionActualLng
      ultimaActualizacion
    }
  }
`;

/**
 * Get personal by ID
 */
export const GET_PERSONAL = gql`
  query Personal($id: Int!) {
    personal(id: $id) {
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
      updated_at
    }
  }
`;

/**
 * Get recent dispatches from last N hours
 */
export const GET_RECENT_DISPATCHES = gql`
  query DespachosRecientes($horas: Int, $limit: Int) {
    despachosRecientes(horas: $horas, limit: $limit) {
      id
      solicitud_id
      ambulancia_id
      fecha_solicitud
      fecha_asignacion
      fecha_llegada
      estado
      incidente
      prioridad
      direccion_origen
      direccion_destino
    }
  }
`;

/**
 * Get dispatch statistics
 */
export const GET_DISPATCH_STATISTICS = gql`
  query EstadisticasDespachos($horas: Int) {
    estadisticasDespachos(horas: $horas) {
      total
      completados
      pendientes
      en_camino
      en_sitio
      cancelados
      critica
      alta
      media
      baja
      tasa_completcion
    }
  }
`;

/**
 * List all personal with optional filters
 */
export const LIST_PERSONALES = gql`
  query Personales(
    $rol: String
    $estado: String
    $disponibles: Boolean
    $limit: Int
    $offset: Int
  ) {
    personales(
      rol: $rol
      estado: $estado
      disponibles: $disponibles
      limit: $limit
      offset: $offset
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
