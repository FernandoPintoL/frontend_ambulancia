// @ts-nocheck
import { useEffect, useCallback } from 'react';
import { websocketService } from '../../data/repositories/websocket-service';
import { Incidente } from '../store/incident-store';

/**
 * Custom Hook for Incident WebSocket Events
 * Allows components to subscribe to real-time incident updates
 */
export function useIncidentWebSocket() {
  /**
   * Subscribe to incident created events
   */
  const onIncidentCreated = useCallback(
    (callback: (incident: Incidente) => void) => {
      return websocketService.subscribe('incident_created', callback);
    },
    []
  );

  /**
   * Subscribe to incident updated events
   */
  const onIncidentUpdated = useCallback(
    (callback: (incident: Incidente) => void) => {
      return websocketService.subscribe('incident_updated', callback);
    },
    []
  );

  /**
   * Subscribe to incident status changed events
   */
  const onIncidentStatusChanged = useCallback(
    (callback: (data: { id: string; estadoIncidente: string }) => void) => {
      return websocketService.subscribe('incident_status_changed', callback);
    },
    []
  );

  /**
   * Subscribe to incident analysis completed events
   */
  const onIncidentAnalysisCompleted = useCallback(
    (callback: (incident: Incidente) => void) => {
      return websocketService.subscribe('incident_analysis_completed', callback);
    },
    []
  );

  /**
   * Subscribe to incident priority changed events
   */
  const onIncidentPriorityChanged = useCallback(
    (callback: (data: { id: string; prioridadFinal: number }) => void) => {
      return websocketService.subscribe('incident_priority_changed', callback);
    },
    []
  );

  /**
   * Subscribe to multiple incident events at once
   */
  const subscribeToAll = useCallback(() => {
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      websocketService.subscribe('incident_created', (data) => {
        console.log('[WebSocket] Incident created:', data);
      })
    );

    unsubscribers.push(
      websocketService.subscribe('incident_updated', (data) => {
        console.log('[WebSocket] Incident updated:', data);
      })
    );

    unsubscribers.push(
      websocketService.subscribe('incident_status_changed', (data) => {
        console.log('[WebSocket] Incident status changed:', data);
      })
    );

    unsubscribers.push(
      websocketService.subscribe('incident_analysis_completed', (data) => {
        console.log('[WebSocket] Incident analysis completed:', data);
      })
    );

    unsubscribers.push(
      websocketService.subscribe('incident_priority_changed', (data) => {
        console.log('[WebSocket] Incident priority changed:', data);
      })
    );

    // Return function to unsubscribe from all events
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  return {
    onIncidentCreated,
    onIncidentUpdated,
    onIncidentStatusChanged,
    onIncidentAnalysisCompleted,
    onIncidentPriorityChanged,
    subscribeToAll,
  };
}

export default useIncidentWebSocket;
