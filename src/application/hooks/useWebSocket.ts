// @ts-nocheck
/**
 * useWebSocket Hook
 * Application Layer - Custom React Hook for WebSocket operations
 */

import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../../data/repositories/websocket-service';

type WebSocketEventType =
  | 'dispatch_created'
  | 'dispatch_status_changed'
  | 'ambulance_location_updated'
  | 'dispatch_completed'
  | 'personal_created'
  | 'personal_updated'
  | 'personal_status_changed'
  | 'error'
  | 'connected'
  | 'disconnected';

/**
 * Hook to manage WebSocket connections and events
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Socket.IO';
        console.error('Socket.IO connection error:', errorMessage);
        setConnectionError(errorMessage);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Setup listener for disconnections
    const unsubDisconnect = websocketService.subscribe('disconnected', () => {
      setIsConnected(false);
    });

    const unsubConnect = websocketService.subscribe('connected', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    const unsubError = websocketService.subscribe('error', (error) => {
      setConnectionError(error?.message || 'WebSocket error occurred');
    });

    // Cleanup on unmount
    return () => {
      unsubDisconnect();
      unsubConnect();
      unsubError();
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  // Subscribe to events
  const subscribe = useCallback(
    (event: WebSocketEventType, handler: (data: any) => void) => {
      return websocketService.subscribe(event, handler);
    },
    []
  );

  // Send message
  const send = useCallback((type: string, payload: any) => {
    websocketService.send(type, payload);
  }, []);

  return {
    isConnected,
    connectionError,
    subscribe,
    send,
  };
};
