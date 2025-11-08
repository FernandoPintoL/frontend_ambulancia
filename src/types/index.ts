/**
 * Tipos compartidos de la aplicación
 */

// ============================================================
// DESPACHOS
// ============================================================

export interface Dispatch {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone?: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  severityLevel: number; // 1-5
  patientLat: number;
  patientLon: number;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  assignedAmbulanceId?: string;
  assignedAmbulance?: Ambulance;
  estimatedArrival?: number; // in minutes
  feedback?: DispatchFeedback;
}

export interface DispatchStatistics {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  averageResponseTime: number;
  averageCompletionTime: number;
}

export interface DispatchFeedback {
  id: string;
  dispatchId: string;
  rating: number; // 1-5
  comments?: string;
  createdAt: string;
}

// ============================================================
// AMBULANCIAS
// ============================================================

export interface Ambulance {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'maintenance';
  location: {
    lat: number;
    lon: number;
  };
  crew?: string[];
  lastUpdate: string;
  responseTime?: number;
  totalDispatches?: number;
  averageResponseTime?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface FleetStatus {
  total: number;
  available: number;
  busy: number;
  maintenance: number;
  averageResponseTime: number;
  totalDispatches: number;
}

export interface AmbulanceStats {
  ambulanceId: string;
  totalDispatches: number;
  averageResponseTime: number;
  averageCompletionTime: number;
  availability: number; // percentage
  lastServiceDate: string;
}

// ============================================================
// PREDICCIONES Y ML
// ============================================================

export interface SeverityPrediction {
  dispatchId: string;
  predictedSeverity: number;
  confidence: number;
  reasoning: string;
}

export interface ETAPrediction {
  ambulanceId: string;
  dispatchId: string;
  estimatedTimeOfArrival: number; // in minutes
  confidence: number;
  distance: number; // in km
  factors: string[];
}

export interface AmbulanceSelectionResult {
  selectedAmbulanceId: string;
  confidence: number;
  alternativeAmbulances: {
    ambulanceId: string;
    score: number;
  }[];
  reasoning: string;
}

export interface RouteOptimizationResult {
  primaryRoute: {
    waypoints: Location[];
    estimatedTime: number; // in minutes
    distance: number; // in km
  };
  alternativeRoutes: {
    waypoints: Location[];
    estimatedTime: number;
    distance: number;
  }[];
  trafficConditions: string;
}

export interface DispatchPrediction {
  dispatchId: string;
  severity: SeverityPrediction;
  eta: ETAPrediction;
  ambulanceSelection: AmbulanceSelectionResult;
  routeOptimization: RouteOptimizationResult;
  overallConfidence: number;
}

export interface ModelHealth {
  modelId: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'degraded';
  accuracy: number;
  lastTrained: string;
  processingTime: number; // in ms
}

// ============================================================
// USUARIOS Y AUTENTICACIÓN
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'paramedic' | 'doctor' | 'hospital';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// ============================================================
// SALUD DEL SISTEMA
// ============================================================

export interface ServiceHealth {
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  message?: string;
  timestamp: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  graphql: ServiceHealth;
  database: ServiceHealth;
  cache: ServiceHealth;
  websocket: ServiceHealth;
  mlService: ServiceHealth;
  timestamp: string;
}

// ============================================================
// ESTADO Y STORE
// ============================================================

export interface DispatchStore {
  dispatches: Dispatch[];
  selectedDispatch: Dispatch | null;
  loading: boolean;
  error: string | null;
  loadDispatches: (status?: string, limit?: number) => Promise<void>;
  loadDispatch: (id: string) => Promise<void>;
  createDispatch: (dispatch: Omit<Dispatch, 'id' | 'createdAt'>) => Promise<void>;
  updateDispatch: (id: string, dispatch: Partial<Dispatch>) => Promise<void>;
  deleteDispatch: (id: string) => Promise<void>;
}

export interface AmbulanceStore {
  ambulances: Ambulance[];
  selectedAmbulance: Ambulance | null;
  loading: boolean;
  error: string | null;
  loadAmbulances: () => Promise<void>;
  loadAmbulance: (id: string) => Promise<void>;
}

// ============================================================
// ERRORES
// ============================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ============================================================
// FORMULARIOS
// ============================================================

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormState {
  data: Record<string, unknown>;
  errors: FormValidationError[];
  isSubmitting: boolean;
}
