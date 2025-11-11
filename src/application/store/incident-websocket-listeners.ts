// @ts-nocheck
/**
 * Incident WebSocket Listeners
 * Initializes WebSocket event listeners for real-time incident updates
 */

import { websocketService } from '../../data/repositories/websocket-service';
import { useIncidentStore } from './incident-store';

/**
 * Initialize WebSocket listeners for incident events
 * This function should be called once when the app starts
 */
export function initializeWebSocketListenersIncidents() {
  console.log('Initializing WebSocket listeners for incidents...');

  const store = useIncidentStore.getState();

  // When a new incident is created
  websocketService.subscribe('incident_created', (data) => {
    console.log('WebSocket: New incident created', data);
    // Add the new incident to the list at the beginning
    store.incidents.unshift(data);
    store.totalElements += 1;
    // Trigger UI update by calling a batch update
    useIncidentStore.setState({
      incidents: [...store.incidents],
      totalElements: store.totalElements,
    });
  });

  // When an incident is updated
  websocketService.subscribe('incident_updated', (data) => {
    console.log('WebSocket: Incident updated', data);
    // Update the incident in the list
    const updatedIncidents = store.incidents.map((inc) =>
      inc.id === data.id ? data : inc
    );
    useIncidentStore.setState({
      incidents: updatedIncidents,
      selectedIncident:
        store.selectedIncident?.id === data.id ? data : store.selectedIncident,
    });
  });

  // When an incident status changes
  websocketService.subscribe('incident_status_changed', (data) => {
    console.log('WebSocket: Incident status changed', data);
    const updatedIncidents = store.incidents.map((inc) =>
      inc.id === data.id ? { ...inc, estadoIncidente: data.estadoIncidente } : inc
    );
    useIncidentStore.setState({
      incidents: updatedIncidents,
      selectedIncident:
        store.selectedIncident?.id === data.id
          ? {
              ...store.selectedIncident,
              estadoIncidente: data.estadoIncidente,
            }
          : store.selectedIncident,
    });
  });

  // When incident analysis is completed
  websocketService.subscribe('incident_analysis_completed', (data) => {
    console.log('WebSocket: Incident analysis completed', data);
    const updatedIncidents = store.incidents.map((inc) =>
      inc.id === data.id
        ? {
            ...inc,
            estadoIncidente: data.estadoIncidente,
            analisisTexto: data.analisisTexto,
            fechaAnalisisCompletado: data.fechaAnalisisCompletado,
          }
        : inc
    );
    useIncidentStore.setState({
      incidents: updatedIncidents,
      selectedIncident:
        store.selectedIncident?.id === data.id
          ? {
              ...store.selectedIncident,
              estadoIncidente: data.estadoIncidente,
              analisisTexto: data.analisisTexto,
              fechaAnalisisCompletado: data.fechaAnalisisCompletado,
            }
          : store.selectedIncident,
    });
  });

  // When incident priority changes
  websocketService.subscribe('incident_priority_changed', (data) => {
    console.log('WebSocket: Incident priority changed', data);
    const updatedIncidents = store.incidents.map((inc) =>
      inc.id === data.id
        ? {
            ...inc,
            prioridadFinal: data.prioridadFinal,
          }
        : inc
    );
    useIncidentStore.setState({
      incidents: updatedIncidents,
      selectedIncident:
        store.selectedIncident?.id === data.id
          ? {
              ...store.selectedIncident,
              prioridadFinal: data.prioridadFinal,
            }
          : store.selectedIncident,
    });
  });

  console.log('WebSocket listeners for incidents initialized successfully');
}

export default initializeWebSocketListenersIncidents;
