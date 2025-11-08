/**
 * GraphQL Queries
 * Data Layer - Query Definitions
 */

import { gql } from 'graphql-request';

/**
 * Get dispatch by ID
 */
export const GET_DISPATCH = gql`
  query GetDispatch($dispatchId: ID!) {
    getDispatch(dispatchId: $dispatchId) {
      id
      patientName
      patientAge
      patientLocation {
        latitude
        longitude
      }
      description
      severityLevel
      status
      assignedAmbulanceId
      createdAt
      updatedAt
    }
  }
`;

/**
 * List all dispatches with optional filtering
 */
export const LIST_DISPATCHES = gql`
  query ListDispatches($status: String, $limit: Int, $offset: Int) {
    listDispatches(status: $status, limit: $limit, offset: $offset) {
      id
      patientName
      patientAge
      description
      severityLevel
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get recent dispatches from last N hours
 */
export const GET_RECENT_DISPATCHES = gql`
  query GetRecentDispatches($hours: Int!, $limit: Int) {
    getRecentDispatches(hours: $hours, limit: $limit) {
      id
      patientName
      patientAge
      description
      severityLevel
      status
      createdAt
    }
  }
`;

/**
 * Get dispatch statistics
 */
export const GET_DISPATCH_STATISTICS = gql`
  query DispatchStatistics($hours: Int!) {
    dispatchStatistics(hours: $hours) {
      total
      completionRate
      criticalCount
      highCount
      mediumCount
      pendingCount
      inTransitCount
    }
  }
`;

/**
 * Get ambulance by ID
 */
export const GET_AMBULANCE = gql`
  query GetAmbulance($ambulanceId: ID!) {
    getAmbulance(ambulanceId: $ambulanceId) {
      id
      code
      type
      status
      driverName
      equipmentLevel
      currentLocation {
        latitude
        longitude
      }
      lastLocationUpdate
    }
  }
`;

/**
 * List ambulances with optional filtering
 */
export const LIST_AMBULANCES = gql`
  query ListAmbulances($type: String, $status: String) {
    listAmbulances(type: $type, status: $status) {
      id
      code
      type
      status
      driverName
      equipmentLevel
      currentLocation {
        latitude
        longitude
      }
    }
  }
`;

/**
 * Get available ambulances near location
 */
export const GET_AVAILABLE_AMBULANCES = gql`
  query GetAvailableAmbulances(
    $latitude: Float!
    $longitude: Float!
    $radiusKm: Float
  ) {
    getAvailableAmbulances(
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
    ) {
      id
      code
      type
      currentLocation {
        latitude
        longitude
      }
      distanceKm
    }
  }
`;

/**
 * Get fleet status
 */
export const GET_FLEET_STATUS = gql`
  query FleetStatus {
    fleetStatus {
      totalAmbulances
      available
      inTransit
      atHospital
      maintenance
      availabilityPercent
    }
  }
`;

/**
 * Get ambulance statistics
 */
export const GET_AMBULANCE_STATS = gql`
  query AmbulanceStats($ambulanceId: ID!, $days: Int!) {
    ambulanceStats(ambulanceId: $ambulanceId, days: $days) {
      totalDispatches
      completedDispatches
      avgRating
      avgResponseTime
      highRatings
      lowRatings
    }
  }
`;

/**
 * Get all models status
 */
export const GET_ALL_MODELS_STATUS = gql`
  query AllModelsStatus {
    allModelsStatus {
      eta {
        isLoaded
        version
        predictionCount
      }
      severity {
        isLoaded
        version
      }
      ambulance {
        isLoaded
        version
      }
      route {
        isLoaded
        version
      }
    }
  }
`;

/**
 * Get model performance
 */
export const GET_MODEL_PERFORMANCE = gql`
  query ModelPerformance($modelName: String!, $hours: Int!) {
    modelPerformance(modelName: $modelName, hours: $hours) {
      totalPredictions
      avgPredictionTime
      avgConfidence
      accuracy
      mae
    }
  }
`;

/**
 * Predict severity
 */
export const PREDICT_SEVERITY = gql`
  query PredictSeverity($description: String!, $age: Int) {
    predictSeverity(description: $description, age: $age) {
      level
      category
      confidence
      recommendation
    }
  }
`;

/**
 * Predict ETA
 */
export const PREDICT_ETA = gql`
  query PredictEta(
    $originLat: Float!
    $originLon: Float!
    $destinationLat: Float!
    $destinationLon: Float!
    $trafficLevel: Int
  ) {
    predictEta(
      originLat: $originLat
      originLon: $originLon
      destinationLat: $destinationLat
      destinationLon: $destinationLon
      trafficLevel: $trafficLevel
    ) {
      estimatedMinutes
      confidence
      lowerBound
      upperBound
    }
  }
`;

/**
 * Predict complete dispatch
 */
export const PREDICT_DISPATCH = gql`
  query PredictDispatch(
    $patientLat: Float!
    $patientLon: Float!
    $description: String!
    $severityLevel: Int!
    $destinationLat: Float!
    $destinationLon: Float!
  ) {
    predictDispatch(
      patientLat: $patientLat
      patientLon: $patientLon
      description: $description
      severityLevel: $severityLevel
      destinationLat: $destinationLat
      destinationLon: $destinationLon
    ) {
      severity {
        level
        confidence
        category
      }
      ambulanceSelection {
        ambulanceId
        confidence
        distance
      }
      route {
        primaryRoute {
          distanceKm
          etaMinutes
        }
      }
      eta {
        estimatedMinutes
        confidence
      }
      pipelineTimeMs
    }
  }
`;

/**
 * Get system health
 */
export const GET_SYSTEM_HEALTH = gql`
  query SystemHealth {
    systemHealth {
      status
      timestamp
      models {
        component
        healthy
      }
      cache {
        component
        healthy
      }
      database {
        component
        healthy
      }
    }
  }
`;

/**
 * Get diagnostic report
 */
export const GET_DIAGNOSTIC_REPORT = gql`
  query DiagnosticReport {
    diagnosticReport {
      generatedAt
      systemHealth {
        status
      }
      modelStatuses {
        eta {
          isLoaded
        }
        severity {
          isLoaded
        }
      }
      alerts {
        severity
        type
        message
      }
    }
  }
`;
