// @ts-nocheck
import { gql } from 'graphql-request';

/**
 * GraphQL Queries for MS Decision - Clinical Decision Support
 * These queries evaluate patient severity and recommend hospitals
 */

export const EVALUATE_PATIENT_QUERY = gql`
  query EvaluarPaciente($datosPaciente: DatosPacienteInput!) {
    evaluarPaciente(datosPaciente: $datosPaciente) {
      severidad
      confianza
      requiereTraslado
      probabilidades {
        critico
        alto
        medio
        bajo
      }
    }
  }
`;

export const RECOMMEND_HOSPITALS_QUERY = gql`
  query RecomendarHospitales(
    $datosPaciente: DatosPacienteInput!
    $ubicacionPaciente: UbicacionInput!
    $topN: Int
  ) {
    recomendarHospitales(
      datosPaciente: $datosPaciente
      ubicacionPaciente: $ubicacionPaciente
      topN: $topN
    ) {
      evaluacion {
        severidad
        confianza
        requiereTraslado
        probabilidades {
          critico
          alto
          medio
          bajo
        }
      }
      clusterUtilizado
      especialidadesCluster
      hospitalesRecomendados {
        hospitalId
        nombre
        ubicacion {
          latitud
          longitud
          direccion
          ciudad
        }
        capacidad
        nivel
        distanciaKm
        disponibilidadPorcentaje
      }
      totalDisponibles
      mensaje
    }
  }
`;

export const GET_CLUSTERS_QUERY = gql`
  query ObtenerClusters {
    obtenerClusters {
      clusterId
      especialidades
      cantidad
      hospitales {
        id
        nombre
        nivel
        ubicacion {
          latitud
          longitud
        }
      }
    }
  }
`;

export const GET_SYSTEM_STATISTICS_QUERY = gql`
  query EstadisticasSistema {
    estadisticasSistema {
      totalHospitales
      totalClusters
      evaluacionesRealizadas
      tasaExito
      tiempoPromedioEvaluacion
      modeloVersion
      ultimaActualizacion
    }
  }
`;

/**
 * Type definitions for decision queries
 */

export interface DatosPaciente {
  edad: number;
  sexo: 'M' | 'F';
  presionSistolica: number;
  presionDiastolica: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  temperatura: number;
  saturacionOxigeno: number;
  nivelDolor: number;
  tipoIncidente: string;
  tiempoDesdeIncidente: number;
}

export interface Ubicacion {
  latitud: number;
  longitud: number;
}

export interface Probabilidades {
  critico: number;
  alto: number;
  medio: number;
  bajo: number;
}

export interface Evaluacion {
  severidad: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  confianza: number;
  requiereTraslado: boolean;
  probabilidades: Probabilidades;
}

export interface HospitalRecomendado {
  hospitalId: string;
  nombre: string;
  ubicacion: {
    latitud: number;
    longitud: number;
    direccion: string;
    ciudad: string;
  };
  capacidad: number;
  nivel: 'I' | 'II' | 'III' | 'IV';
  distanciaKm: number;
  disponibilidadPorcentaje: number;
}

export interface RecomendacionHospitales {
  evaluacion: Evaluacion;
  clusterUtilizado: string;
  especialidadesCluster: string[];
  hospitalesRecomendados: HospitalRecomendado[];
  totalDisponibles: number;
  mensaje: string;
}

export interface ClusterInfo {
  clusterId: string;
  especialidades: string[];
  cantidad: number;
  hospitales: Array<{
    id: string;
    nombre: string;
    nivel: string;
    ubicacion: {
      latitud: number;
      longitud: number;
    };
  }>;
}

export interface EstadisticasSistema {
  totalHospitales: number;
  totalClusters: number;
  evaluacionesRealizadas: number;
  tasaExito: number;
  tiempoPromedioEvaluacion: number;
  modeloVersion: string;
  ultimaActualizacion: string;
}
