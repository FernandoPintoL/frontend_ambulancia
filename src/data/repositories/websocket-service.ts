// @ts-nocheck
/**
 * WebSocket Service
 * Real-time updates using Socket.IO for dispatch status, ambulance location, and personal updates
 *
 * IMPORTANTE: Usa getConfig() para obtener la URL de runtime desde Docker
 */

import { io, Socket } from 'socket.io-client';
import { getConfig } from '../../config/runtime-config';

type WebSocketEventHandler = (data: any) => void;
type WebSocketEventType =
  | 'dispatch_created'
  | 'dispatch_status_changed'
  | 'ambulance_location_updated'
  | 'dispatch_completed'
  | 'personal_created'
  | 'personal_updated'
  | 'personal_status_changed'
  | 'incident_created'
  | 'incident_updated'
  | 'incident_status_changed'
  | 'incident_analysis_completed'
  | 'incident_priority_changed'
  | 'error'
  | 'connected'
  | 'disconnected';

interface WebSocketListeners {
  [key: string]: Set<WebSocketEventHandler>;
}

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private listeners: WebSocketListeners = {};
  private maxReconnectAttempts = 5;

  constructor(url?: string) {
    // Get URL from parameter, runtime config (Docker), or fallback
    let wsUrl = url;

    if (!wsUrl) {
      try {
        // Intenta obtener desde la configuración de runtime (Docker)
        wsUrl = getConfig('REACT_APP_WS_URL');
      } catch (error) {
        // Si no está disponible, fallback a localhost
        wsUrl = 'http://localhost:4004';
      }
    }

    this.url = wsUrl;
    console.log('WebSocket URL initialized:', this.url);
    this.initializeListeners();
  }

  private initializeListeners() {
    const events: WebSocketEventType[] = [
      'dispatch_created',
      'dispatch_status_changed',
      'ambulance_location_updated',
      'dispatch_completed',
      'personal_created',
      'personal_updated',
      'personal_status_changed',
      'incident_created',
      'incident_updated',
      'incident_status_changed',
      'incident_analysis_completed',
      'incident_priority_changed',
      'error',
      'connected',
      'disconnected',
    ];

    events.forEach((event) => {
      this.listeners[event] = new Set();
    });
  }

  /**
   * Connect to WebSocket server using Socket.IO
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        
        const auth: any = {};
        // Only include token if it exists
        if (token) {
          auth.token = token;
        }

        this.socket = io(this.url, {
          auth: auth,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling'],
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('Socket.IO connected:', this.socket?.id);
          this.emit('connected');
          resolve();
        });

        // Dispatch events
        this.socket.on('dispatch_created', (data: any) => {
          console.log('Dispatch created event:', data);
          this.emit('dispatch_created', data);
        });

        this.socket.on('dispatch_status_changed', (data: any) => {
          console.log('Dispatch status changed event:', data);
          this.emit('dispatch_status_changed', data);
        });

        this.socket.on('dispatch_completed', (data: any) => {
          console.log('Dispatch completed event:', data);
          this.emit('dispatch_completed', data);
        });

        // Ambulance events
        this.socket.on('ambulance_location_updated', (data: any) => {
          console.log('Ambulance location updated event:', data);
          this.emit('ambulance_location_updated', data);
        });

        // Personal events
        this.socket.on('personal_created', (data: any) => {
          console.log('Personal created event:', data);
          this.emit('personal_created', data);
        });

        this.socket.on('personal_updated', (data: any) => {
          console.log('Personal updated event:', data);
          this.emit('personal_updated', data);
        });

        this.socket.on('personal_status_changed', (data: any) => {
          console.log('Personal status changed event:', data);
          this.emit('personal_status_changed', data);
        });

        // Incident events
        this.socket.on('incident_created', (data: any) => {
          console.log('Incident created event:', data);
          this.emit('incident_created', data);
        });

        this.socket.on('incident_updated', (data: any) => {
          console.log('Incident updated event:', data);
          this.emit('incident_updated', data);
        });

        this.socket.on('incident_status_changed', (data: any) => {
          console.log('Incident status changed event:', data);
          this.emit('incident_status_changed', data);
        });

        this.socket.on('incident_analysis_completed', (data: any) => {
          console.log('Incident analysis completed event:', data);
          this.emit('incident_analysis_completed', data);
        });

        this.socket.on('incident_priority_changed', (data: any) => {
          console.log('Incident priority changed event:', data);
          this.emit('incident_priority_changed', data);
        });

        // Error handler
        this.socket.on('connect_error', (error: any) => {
          console.error('Socket.IO connection error:', error);
          this.emit('error', { message: `Connection error: ${error.message}` });
        });

        // Disconnect handler
        this.socket.on('disconnect', (reason: any) => {
          console.log('Socket.IO disconnected:', reason);
          this.emit('disconnected');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to WebSocket events
   */
  public subscribe(event: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event].add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners[event].delete(handler);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: WebSocketEventType, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in Socket.IO listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Emit event to Socket.IO server
   */
  public send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket.IO is not connected');
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance - inicialización lazy
let websocketServiceInstance: WebSocketService | null = null;

/**
 * Obtener o crear la instancia del servicio WebSocket
 * Se inicializa lazy cuando se necesita por primera vez
 */
function getOrCreateInstance(): WebSocketService {
  if (!websocketServiceInstance) {
    websocketServiceInstance = new WebSocketService();
  }
  return websocketServiceInstance;
}

// Singleton instance - retrocompatible con código existente
export const websocketService = {
  connect: () => getOrCreateInstance().connect(),
  subscribe: (event: any, handler: any) =>
    getOrCreateInstance().subscribe(event, handler),
  send: (event: string, data: any) =>
    getOrCreateInstance().send(event, data),
  disconnect: () => getOrCreateInstance().disconnect(),
  isConnected: () => getOrCreateInstance().isConnected(),
} as any;
