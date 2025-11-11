# WebSocket Configuration for Incident Management

## Overview

The frontend has been configured with WebSocket support for real-time incident updates from the MS Recepción microservice. This enables live notifications and automatic UI updates when incident status changes, analyses complete, or new incidents are created.

## Architecture

### WebSocket Service
**File**: `src/data/repositories/websocket-service.ts`

- **Framework**: Socket.IO
- **Default URL**: `http://localhost:4004` (can be overridden via `REACT_APP_WS_URL` env variable)
- **Reconnection**: Automatic with exponential backoff
- **Max Reconnection Attempts**: 5
- **Transports**: WebSocket + Polling fallback

### Event Types

The following incident-related WebSocket events are supported:

```typescript
// Event Types
- incident_created          // New incident created
- incident_updated          // Incident details updated
- incident_status_changed   // Incident status/state changed
- incident_analysis_completed // ML analysis finished
- incident_priority_changed // Priority recalculated
```

Additionally supported (for other modules):
- `dispatch_created`, `dispatch_status_changed`, `dispatch_completed`
- `ambulance_location_updated`
- `personal_created`, `personal_updated`, `personal_status_changed`
- `connected`, `disconnected`, `error`

## Integration Points

### 1. WebSocket Service Initialization
**File**: `src/presentation/App.tsx`

The WebSocket connection is established globally when the app loads:

```typescript
// Initialize WebSocket
websocketService.connect().catch((error) => {
  console.error('Failed to connect WebSocket:', error);
});

// Initialize listeners for real-time updates
initializeWebSocketListeners();           // Dispatch events
initializeWebSocketListenersPersonal();   // Personal events
initializeWebSocketListenersIncidents();  // Incident events
```

### 2. Incident WebSocket Listeners
**File**: `src/application/store/incident-websocket-listeners.ts`

This module initializes global listeners that automatically update the Zustand incident store when WebSocket events are received:

```typescript
// When a new incident is created, it's added to the store
websocketService.subscribe('incident_created', (data) => {
  // Incident is prepended to the list
  store.incidents.unshift(data);
  store.totalElements += 1;
});

// When an incident is updated
websocketService.subscribe('incident_updated', (data) => {
  // Updated incident replaces the old one
  const updatedIncidents = store.incidents.map((inc) =>
    inc.id === data.id ? data : inc
  );
});

// Similar handlers for status_changed, analysis_completed, priority_changed
```

### 3. Custom Hook: useIncidentWebSocket
**File**: `src/application/hooks/useIncidentWebSocket.ts`

Components can use this hook to subscribe to specific incident events:

```typescript
function MyComponent() {
  const { onIncidentCreated, onIncidentUpdated, onIncidentStatusChanged } = useIncidentWebSocket();

  useEffect(() => {
    // Subscribe to incidents created
    const unsub = onIncidentCreated((incident) => {
      console.log('New incident:', incident);
    });

    return () => unsub(); // Cleanup
  }, [onIncidentCreated]);

  return <div>Component</div>;
}
```

### 4. RecepcionPage Integration
**File**: `src/presentation/pages/RecepcionPage.tsx`

The reception dashboard subscribes to WebSocket events and displays toast notifications:

```typescript
const { onIncidentCreated, onIncidentUpdated, onIncidentStatusChanged } = useIncidentWebSocket();

useEffect(() => {
  const unsubCreateSubscribe = onIncidentCreated((incident) => {
    toast.success('Nuevo incidente recibido en tiempo real', { icon: '🆕' });
  });

  // ... more subscriptions

  return () => {
    unsubCreateSubscribe();
    // ... cleanup other subscriptions
  };
}, [onIncidentCreated, onIncidentUpdated, onIncidentStatusChanged]);
```

## Configuration

### Environment Variables

```bash
# WebSocket URL (defaults to http://localhost:4004)
REACT_APP_WS_URL=http://localhost:4004
```

### Socket.IO Options

Connection options configured in `websocket-service.ts`:

```typescript
{
  auth: { token: localStorage.getItem('token') },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
}
```

## Data Flow

### Example: Incident Status Changed Event

1. **Backend** (MS Recepción):
   ```
   Incident status changes → Emit "incident_status_changed" event via Socket.IO
   ```

2. **WebSocket Service**:
   ```
   Socket.IO receives event → calls emit() to dispatch to all listeners
   ```

3. **Incident Store Listeners**:
   ```
   Update incident in store with new status → triggers React re-render
   ```

4. **Component Updates**:
   ```
   RecepcionPage receives WebSocket event → shows toast notification
   UI automatically re-renders with new incident data
   ```

## Best Practices

### For Components Using WebSocket

1. **Always cleanup subscriptions**:
   ```typescript
   useEffect(() => {
     const unsub = onIncidentCreated((data) => {
       // Handle event
     });

     return () => unsub(); // Cleanup
   }, [onIncidentCreated]);
   ```

2. **Handle high-frequency events**:
   ```typescript
   // Use debouncing for high-frequency updates
   const debouncedUpdate = useCallback(
     debounce((incident) => {
       // Update UI
     }, 300),
     []
   );
   ```

3. **Check connection status** (if needed):
   ```typescript
   import { websocketService } from '../../data/repositories/websocket-service';

   if (websocketService.isConnected()) {
     // Safe to use WebSocket
   }
   ```

## Troubleshooting

### WebSocket Not Connecting

1. Check if the WebSocket server is running:
   ```bash
   curl -i http://localhost:4004
   ```

2. Check console for connection errors:
   ```javascript
   // Enable debug logging
   localStorage.debug = 'socket.io-client:*';
   ```

3. Verify REACT_APP_WS_URL is set correctly

### Events Not Received

1. Check if the server is emitting events:
   - Verify event names match exactly
   - Check server logs for emission errors

2. Check browser DevTools Network tab:
   - Look for Socket.IO messages
   - Verify WebSocket handshake was successful

3. Check console logs:
   - WebSocket service logs all received events
   - Custom handlers should log processed data

### High Memory Usage

1. Ensure subscriptions are cleaned up:
   - All `useEffect` hooks should return unsubscribe function
   - Check for missing cleanup functions

2. Monitor number of listeners:
   ```typescript
   // In browser console:
   websocketService.listeners['incident_created'].size
   ```

## Testing

### Manual Testing in Browser Console

```javascript
// Check connection status
websocketService.isConnected()

// View current listeners
websocketService.listeners

// Subscribe to event manually (for testing)
const unsub = websocketService.subscribe('incident_created', (data) => {
  console.log('Incident created:', data);
});

// Unsubscribe
unsub();
```

## Performance Considerations

- **Event Batching**: For high-frequency updates, consider batching updates
- **Subscription Cleanup**: Ensure all subscriptions are properly cleaned up
- **Event Filtering**: Filter events on the client to reduce re-renders
- **Store Updates**: Zustand automatically optimizes re-renders for changed state

## Future Enhancements

- [ ] Implement message queue for offline scenarios
- [ ] Add exponential backoff with jitter
- [ ] Implement event deduplication
- [ ] Add metrics/monitoring for WebSocket health
- [ ] Support for binary message compression
- [ ] Implement heartbeat/ping-pong mechanism
