// @ts-nocheck
import { useCallback, useEffect } from 'react';
import { useIncidentStore, Incidente } from '../store/incident-store';
import { CreateIncidentInput, IncidentFilter, PaginationInput } from '../../data/repositories/incident-repository';

/**
 * Custom hook for managing incident operations
 * Provides a clean interface to incident store operations
 */

export function useIncidentes() {
  const {
    incidents,
    selectedIncident,
    loading,
    error,
    currentPage,
    pageSize,
    totalElements,
    statistics,
    filters,
    highPriorityCount,
    pendingAnalysisCount,
    loadIncidents,
    loadHighPriorityIncidents,
    loadPendingAnalysisIncidents,
    loadIncidentsForDispatch,
    getIncidentDetail,
    createIncident,
    updateIncident,
    changeIncidentState,
    approveIncident,
    rejectIncident,
    cancelIncident,
    sendToTextAnalysis,
    sendToImageAnalysis,
    calculateFinalPriority,
    loadStatistics,
    setFilters,
    setCurrentPage,
    setPageSize,
    clearError,
    selectIncident,
  } = useIncidentStore();

  /**
   * Load incidents on component mount or when filters change
   */
  useEffect(() => {
    const pagination: PaginationInput = {
      page: currentPage,
      size: pageSize,
      orderBy: 'fechaReporte',
      direction: 'DESC',
    };
    loadIncidents(filters, pagination);
  }, [currentPage, pageSize, filters, loadIncidents]);

  /**
   * Load dashboard metrics on mount
   */
  useEffect(() => {
    loadHighPriorityIncidents();
    loadPendingAnalysisIncidents();
    loadStatistics();
  }, [loadHighPriorityIncidents, loadPendingAnalysisIncidents, loadStatistics]);

  /**
   * Fetch incident detail by ID
   */
  const fetchIncidentDetail = useCallback(
    async (id: string) => {
      await getIncidentDetail(id);
    },
    [getIncidentDetail]
  );

  /**
   * Create new incident
   */
  const handleCreateIncident = useCallback(
    async (input: CreateIncidentInput): Promise<Incidente | null> => {
      try {
        const newIncident = await createIncident(input);
        return newIncident;
      } catch (err) {
        console.error('Error creating incident:', err);
        return null;
      }
    },
    [createIncident]
  );

  /**
   * Update incident details
   */
  const handleUpdateIncident = useCallback(
    async (id: string, data: Partial<Incidente>) => {
      try {
        await updateIncident(id, data);
      } catch (err) {
        console.error('Error updating incident:', err);
      }
    },
    [updateIncident]
  );

  /**
   * Change incident state
   */
  const handleChangeState = useCallback(
    async (id: string, nuevoEstado: string, motivo?: string) => {
      try {
        await changeIncidentState(id, nuevoEstado, motivo);
      } catch (err) {
        console.error('Error changing incident state:', err);
      }
    },
    [changeIncidentState]
  );

  /**
   * Approve incident
   */
  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await approveIncident(id);
      } catch (err) {
        console.error('Error approving incident:', err);
      }
    },
    [approveIncident]
  );

  /**
   * Reject incident
   */
  const handleReject = useCallback(
    async (id: string, motivo: string) => {
      try {
        await rejectIncident(id, motivo);
      } catch (err) {
        console.error('Error rejecting incident:', err);
      }
    },
    [rejectIncident]
  );

  /**
   * Cancel incident
   */
  const handleCancel = useCallback(
    async (id: string, motivo: string) => {
      try {
        await cancelIncident(id, motivo);
      } catch (err) {
        console.error('Error canceling incident:', err);
      }
    },
    [cancelIncident]
  );

  /**
   * Trigger text analysis
   */
  const handleSendToTextAnalysis = useCallback(
    async (incidenteId: string) => {
      try {
        await sendToTextAnalysis(incidenteId);
      } catch (err) {
        console.error('Error sending to text analysis:', err);
      }
    },
    [sendToTextAnalysis]
  );

  /**
   * Trigger image analysis
   */
  const handleSendToImageAnalysis = useCallback(
    async (incidenteId: string) => {
      try {
        await sendToImageAnalysis(incidenteId);
      } catch (err) {
        console.error('Error sending to image analysis:', err);
      }
    },
    [sendToImageAnalysis]
  );

  /**
   * Calculate final priority
   */
  const handleCalculateFinalPriority = useCallback(
    async (incidenteId: string) => {
      try {
        await calculateFinalPriority(incidenteId);
      } catch (err) {
        console.error('Error calculating final priority:', err);
      }
    },
    [calculateFinalPriority]
  );

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
    },
    [setPageSize]
  );

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback(
    (newFilters: IncidentFilter) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  /**
   * Select incident
   */
  const handleSelectIncident = useCallback(
    (incident: Incidente | null) => {
      selectIncident(incident);
    },
    [selectIncident]
  );

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      RECIBIDO: 'bg-blue-100 text-blue-800',
      EN_ANALISIS_TEXTO: 'bg-purple-100 text-purple-800',
      EN_ANALISIS_IMAGEN: 'bg-indigo-100 text-indigo-800',
      ANALISIS_COMPLETADO: 'bg-yellow-100 text-yellow-800',
      ANALIZADO: 'bg-cyan-100 text-cyan-800',
      APROBADO: 'bg-green-100 text-green-800',
      RECHAZADO: 'bg-red-100 text-red-800',
      CANCELADO: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority?: number): string => {
    if (!priority) return 'text-gray-500';
    if (priority >= 4) return 'text-red-600';
    if (priority >= 3) return 'text-orange-600';
    if (priority >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return {
    // State
    incidents,
    selectedIncident,
    loading,
    error,
    currentPage,
    pageSize,
    totalElements,
    statistics,
    filters,
    highPriorityCount,
    pendingAnalysisCount,

    // Actions
    fetchIncidentDetail,
    handleCreateIncident,
    handleUpdateIncident,
    handleChangeState,
    handleApprove,
    handleReject,
    handleCancel,
    handleSendToTextAnalysis,
    handleSendToImageAnalysis,
    handleCalculateFinalPriority,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleSelectIncident,
    clearError,
    loadIncidentsForDispatch,
    loadStatistics,

    // Utilities
    getStatusColor,
    getPriorityColor,
    formatDate,
  };
}

export default useIncidentes;
