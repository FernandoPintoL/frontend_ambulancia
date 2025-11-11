// @ts-nocheck
import { gql } from 'graphql-request';

/**
 * GraphQL Queries for MS Recepción - Incident Management
 * These queries fetch incident data from the apollo-gateway
 */

export const INCIDENT_FRAGMENT = gql`
  fragment IncidentData on Incidente {
    id
    codigo
    descripcionOriginal
    tipoIncidenteReportado
    tipoIncidenteClasificado
    prioridadInicial
    prioridadTexto
    prioridadImagen
    prioridadFinal
    scoreVeracidad
    esVerosimil
    estadoIncidente
    motivoRechazo
    fechaReporte
    fechaAnalisisCompletado
    fechaUltimaActualizacion
    observaciones
    solicitante {
      id
      nombreCompleto
      telefono
      email
      canalOrigen
    }
    ubicacion {
      id
      descripcionTextual
      referencia
      latitud
      longitud
      ciudad
      distrito
      zona
      direccion
    }
    analisisTexto {
      id
      textoAnalizado
      prioridadCalculada
      nivelGravedad
      tipoIncidentePredicho
      categoriasDetectadas
      palabrasClaveCriticas
      scoreConfianza
      modeloVersion
      tiempoProcesamientoMs
      fechaAnalisis
      estadoAnalisis
      mensajeError
    }
    multimedia {
      id
      urlArchivo
      nombreArchivo
      tipoArchivo
      tamanoBytes
      descripcion
      esPrincipal
      requiereAnalisisMl
      analisisCompletado
      fechaSubida
    }
  }
`;

export const GET_INCIDENT = gql`
  query GetIncidente($id: UUID!) {
    incidente(id: $id) {
      ...IncidentData
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const LIST_INCIDENTS = gql`
  query ListIncidentes(
    $estado: EstadoIncidente
    $prioridadMin: Int
    $prioridadMax: Int
    $fechaInicio: DateTime
    $fechaFin: DateTime
    $solicitanteId: UUID
    $distrito: String
    $esVerosimil: Boolean
    $canalOrigen: CanalOrigen
    $page: Int
    $size: Int
    $orderBy: String
    $direction: OrderDirection
  ) {
    incidentes(
      filtros: {
        estado: $estado
        prioridadMin: $prioridadMin
        prioridadMax: $prioridadMax
        fechaInicio: $fechaInicio
        fechaFin: $fechaFin
        solicitanteId: $solicitanteId
        distrito: $distrito
        esVerosimil: $esVerosimil
        canalOrigen: $canalOrigen
      }
      paginacion: { page: $page, size: $size, orderBy: $orderBy, direction: $direction }
    ) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
      size
      first
      last
      empty
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_HIGH_PRIORITY_INCIDENTS = gql`
  query GetIncidentsHighPriority($page: Int, $size: Int) {
    incidentesPrioridadAlta(paginacion: { page: $page, size: $size }) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_PENDING_ANALYSIS_INCIDENTS = gql`
  query GetIncidentsPendingAnalysis($page: Int, $size: Int) {
    incidentesPendientesAnalisis(paginacion: { page: $page, size: $size }) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_INCIDENTS_FOR_DISPATCH = gql`
  query GetIncidentsForDispatch($page: Int, $size: Int) {
    incidentesParaDespacho(paginacion: { page: $page, size: $size }) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_INCIDENTS_BY_STATE = gql`
  query GetIncidentsByState(
    $estado: EstadoIncidente!
    $page: Int
    $size: Int
  ) {
    incidentesPorEstado(
      estado: $estado
      paginacion: { page: $page, size: $size }
    ) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_INCIDENTS_BY_DATE_RANGE = gql`
  query GetIncidentsByDateRange(
    $fechaInicio: DateTime!
    $fechaFin: DateTime!
    $page: Int
    $size: Int
  ) {
    incidentesPorRangoFechas(
      fechaInicio: $fechaInicio
      fechaFin: $fechaFin
      paginacion: { page: $page, size: $size }
    ) {
      content {
        ...IncidentData
      }
      totalElements
      totalPages
      number
    }
  }
  ${INCIDENT_FRAGMENT}
`;

export const GET_INCIDENT_STATISTICS = gql`
  query GetIncidentStatistics($estado: EstadoIncidente) {
    estadisticasIncidentes(filtros: { estado: $estado }) {
      totalIncidentes
      porEstado {
        estado
        cantidad
        porcentaje
      }
      porPrioridad {
        prioridad
        cantidad
        porcentaje
      }
      porDistrito {
        distrito
        cantidad
        porcentaje
      }
      porCanalOrigen {
        canal
        cantidad
        porcentaje
      }
    }
  }
`;

export const GET_INCIDENT_HISTORY = gql`
  query GetIncidentHistory($incidenteId: UUID!) {
    historialIncidente(incidenteId: $incidenteId) {
      id
      estadoAnterior
      estadoNuevo
      usuarioCambio
      motivo
      metadata
      fechaCambio
    }
  }
`;
