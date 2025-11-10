/**
 * WebSocket Service
 * Real-time updates for dispatch status changes and ambulance location tracking
 */

type WebSocketEventHandler = (data: any) => void;
type WebSocketEventType = 'dispatch_created' | 'dispatch_status_changed' | 'ambulance_location_updated' | 'dispatch_completed' | 'error' | 'connected' | 'disconnected';

interface WebSocketListeners {
  [key: string]: Set<WebSocketEventHandler>;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: WebSocketListeners = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

  constructor(url?: string) {
    this.url = url || import.meta.env.REACT_APP_WS_URL || 'ws://localhost:4000';
    this.initializeListeners();
  }

  private initializeListeners() {
    const events: WebSocketEventType[] = [
      'dispatch_created',
      'dispatch_status_changed',
      'ambulance_location_updated',
      'dispatch_completed',
      'error',
      'connected',
      'disconnected',
    ];

    events.forEach((event) => {
      this.listeners[event] = new Set();
    });
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { message: 'WebSocket connection error' });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: { type: string; payload: any }) {
    const { type, payload } = data;

    switch (type) {
      case 'dispatch_created':
        this.emit('dispatch_created', payload);
        break;
      case 'dispatch_status_changed':
        this.emit('dispatch_status_changed', payload);
        break;
      case 'ambulance_location_updated':
        this.emit('ambulance_location_updated', payload);
        break;
      case 'dispatch_completed':
        this.emit('dispatch_completed', payload);
        break;
      default:
        console.warn('Unknown WebSocket message type:', type);
    }
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
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send message to WebSocket server
   */
  public send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          payload,
        })
      );
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.isIntentionallyClosed) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', { message: 'Failed to reconnect to WebSocket after multiple attempts' });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
