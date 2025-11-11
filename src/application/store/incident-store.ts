// @ts-nocheck
import { create } from 'zustand';
import { IncidentRepository, IncidentFilter, PaginationInput, CreateIncidentInput } from '../../data/repositories/incident-repository';

/**
 * Incident State & Store
 * Manages all incident-related state using Zustand
 */

interface AnalisisML {
  id: string;
  textoAnalizado?: string;
  prioridadCalculada?: number;
  nivelGravedad?: number;
  tipoIncidentePredicho?: string;
  categoriasDetectadas?: Record<string, any>;
  scoreConfianza?: number;
  estadoAnalisis?: string;
}

interface Multimedia {
  id: string;
  urlArchivo: string;
  nombreArchivo?: string;
  tipoArchivo: string;
  esPrincipal: boolean;
}

interface Solicitante {
  id: string;
  nombreCompleto: string;
  telefono: string;
  email?: string;
  canalOrigen: string;
}

interface Ubicacion {
  id: string;
  descripcionTextual: string;
  latitud?: number;
  longitud?: number;
  ciudad?: string;
  distrito?: string;
  zona?: string;
  direccion?: string;
}

export interface Incidente {
  id: string;
  codigo: string;
  descripcionOriginal: string;
  tipoIncidenteReportado?: string;
  tipoIncidenteClasificado?: string;
  prioridadFinal?: number;
  estadoIncidente: string;
  scoreVeracidad?: number;
  esVerosimil?: boolean;
  motivoRechazo?: string;
  fechaReporte: string;
  fechaAnalisisCompletado?: string;
  fechaUltimaActualizacion: string;
  observaciones?: string;
  solicitante: Solicitante;
  ubicacion: Ubicacion;
  analisisTexto?: AnalisisML;
  multimedia?: Multimedia[];
}

interface IncidentPage {
  content: Incidente[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface IncidentStatistics {
  totalIncidentes: number;
  porEstado: Array<{ estado: string; cantidad: number; porcentaje: number }>;
  porPrioridad: Array<{ prioridad: number; cantidad: number; porcentaje: number }>;
  porDistrito: Array<{ distrito: string; cantidad: number; porcentaje: number }>;
  porCanalOrigen: Array<{ canal: string; cantidad: number; porcentaje: number }>;
}

interface IncidentStore {
  // State
  incidents: Incidente[];
  selectedIncident: Incidente | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  statistics: IncidentStatistics | null;
  filters: IncidentFilter;
  highPriorityCount: number;
  pendingAnalysisCount: number;

  // Actions
  loadIncidents: (filters?: IncidentFilter, pagination?: PaginationInput) => Promise<void>;
  loadHighPriorityIncidents: () => Promise<void>;
  loadPendingAnalysisIncidents: () => Promise<void>;
  loadIncidentsForDispatch: () => Promise<void>;
  getIncidentDetail: (id: string) => Promise<void>;
  createIncident: (input: CreateIncidentInput) => Promise<Incidente>;
  updateIncident: (id: string, data: Partial<Incidente>) => Promise<void>;
  changeIncidentState: (id: string, nuevoEstado: string, motivo?: string) => Promise<void>;
  approveIncident: (id: string) => Promise<void>;
  rejectIncident: (id: string, motivo: string) => Promise<void>;
  cancelIncident: (id: string, motivo: string) => Promise<void>;
  sendToTextAnalysis: (incidenteId: string) => Promise<void>;
  sendToImageAnalysis: (incidenteId: string) => Promise<void>;
  calculateFinalPriority: (incidenteId: string) => Promise<void>;
  loadStatistics: (filters?: IncidentFilter) => Promise<void>;
  setFilters: (filters: IncidentFilter) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  clearError: () => void;
  selectIncident: (incident: Incidente | null) => void;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  // Initial state
  incidents: [],
  selectedIncident: null,
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 20,
  totalElements: 0,
  statistics: null,
  filters: {},
  highPriorityCount: 0,
  pendingAnalysisCount: 0,

  // Actions
  loadIncidents: async (filters?: IncidentFilter, pagination?: PaginationInput) => {
    set({ loading: true, error: null });
    try {
      const result = await IncidentRepository.listIncidents(filters, {
        page: pagination?.page ?? get().currentPage,
        size: pagination?.size ?? get().pageSize,
        orderBy: pagination?.orderBy ?? 'fechaReporte',
        direction: pagination?.direction ?? 'DESC',
      });
      set({
        incidents: result.content || [],
        totalElements: result.totalElements || 0,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading incidents',
        loading: false,
      });
    }
  },

  loadHighPriorityIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const result = await IncidentRepository.getHighPriorityIncidents({
        page: 0,
        size: 100,
      });
      set({
        highPriorityCount: result.totalElements || 0,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading high priority incidents',
        loading: false,
      });
    }
  },

  loadPendingAnalysisIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const result = await IncidentRepository.getPendingAnalysisIncidents({
        page: 0,
        size: 100,
      });
      set({
        pendingAnalysisCount: result.totalElements || 0,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading pending analysis incidents',
        loading: false,
      });
    }
  },

  loadIncidentsForDispatch: async () => {
    set({ loading: true, error: null });
    try {
      const result = await IncidentRepository.getIncidentsForDispatch({
        page: 0,
        size: 50,
      });
      set({
        incidents: result.content || [],
        totalElements: result.totalElements || 0,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading incidents for dispatch',
        loading: false,
      });
    }
  },

  getIncidentDetail: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const incident = await IncidentRepository.getIncident(id);
      set({
        selectedIncident: incident,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading incident detail',
        loading: false,
      });
    }
  },

  createIncident: async (input: CreateIncidentInput) => {
    set({ loading: true, error: null });
    try {
      const newIncident = await IncidentRepository.createIncident(input);
      set((state) => ({
        incidents: [newIncident, ...state.incidents],
        totalElements: state.totalElements + 1,
        loading: false,
      }));
      return newIncident;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error creating incident',
        loading: false,
      });
      throw err;
    }
  },

  updateIncident: async (id: string, data: Partial<Incidente>) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.updateIncident({
        id,
        descripcionOriginal: data.descripcionOriginal,
        tipoIncidenteReportado: data.tipoIncidenteReportado,
        observaciones: data.observaciones,
      });
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updatedIncident : inc
        ),
        selectedIncident: state.selectedIncident?.id === id ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error updating incident',
        loading: false,
      });
      throw err;
    }
  },

  changeIncidentState: async (id: string, nuevoEstado: string, motivo?: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.changeIncidentState(
        id,
        nuevoEstado,
        motivo
      );
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updatedIncident : inc
        ),
        selectedIncident: state.selectedIncident?.id === id ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error changing incident state',
        loading: false,
      });
      throw err;
    }
  },

  approveIncident: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.approveIncident(id);
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updatedIncident : inc
        ),
        selectedIncident: state.selectedIncident?.id === id ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error approving incident',
        loading: false,
      });
      throw err;
    }
  },

  rejectIncident: async (id: string, motivo: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.rejectIncident(id, motivo);
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updatedIncident : inc
        ),
        selectedIncident: state.selectedIncident?.id === id ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error rejecting incident',
        loading: false,
      });
      throw err;
    }
  },

  cancelIncident: async (id: string, motivo: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.cancelIncident(id, motivo);
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updatedIncident : inc
        ),
        selectedIncident: state.selectedIncident?.id === id ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error canceling incident',
        loading: false,
      });
      throw err;
    }
  },

  sendToTextAnalysis: async (incidenteId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.sendToTextAnalysis(incidenteId);
      set((state) => ({
        selectedIncident: state.selectedIncident?.id === incidenteId ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error sending to text analysis',
        loading: false,
      });
      throw err;
    }
  },

  sendToImageAnalysis: async (incidenteId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.sendToImageAnalysis(incidenteId);
      set((state) => ({
        selectedIncident: state.selectedIncident?.id === incidenteId ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error sending to image analysis',
        loading: false,
      });
      throw err;
    }
  },

  calculateFinalPriority: async (incidenteId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedIncident = await IncidentRepository.calculateFinalPriority(incidenteId);
      set((state) => ({
        selectedIncident: state.selectedIncident?.id === incidenteId ? updatedIncident : state.selectedIncident,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error calculating final priority',
        loading: false,
      });
      throw err;
    }
  },

  loadStatistics: async (filters?: IncidentFilter) => {
    set({ loading: true, error: null });
    try {
      const stats = await IncidentRepository.getIncidentStatistics(filters);
      set({
        statistics: stats,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error loading statistics',
        loading: false,
      });
    }
  },

  setFilters: (filters: IncidentFilter) => {
    set({ filters, currentPage: 0 });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 0 });
  },

  clearError: () => {
    set({ error: null });
  },

  selectIncident: (incident: Incidente | null) => {
    set({ selectedIncident: incident });
  },
}));

export default useIncidentStore;
