import { LiveWsMessage } from '../types';
import { API_BASE_URL } from './api';

export type WsConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
export type WsMessageHandler = (data: LiveWsMessage) => void;
export type WsStatusHandler = (status: WsConnectionStatus) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageListeners: Set<WsMessageHandler> = new Set();
  private statusListeners: Set<WsStatusHandler> = new Set();
  private status: WsConnectionStatus = 'DISCONNECTED';
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private lastMessageTime = 0;

  private getWsUrl(): string {
    const customWs = import.meta.env.VITE_WS_BASE_URL;
    if (customWs) {
      return `${customWs.replace(/\/$/, '')}/ws/live`;
    }
    const base = API_BASE_URL.replace(/^http/, 'ws');
    return `${base}/ws/live`;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.setStatus('CONNECTING');

    const url = this.getWsUrl();
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('CONNECTED');
      };

      this.ws.onmessage = (event) => {
        try {
          this.lastMessageTime = Date.now();
          const parsed: LiveWsMessage = JSON.parse(event.data);
          this.messageListeners.forEach((listener) => {
            try {
              listener(parsed);
            } catch (err) {
              console.error('Error in WS message listener:', err);
            }
          });
        } catch (err) {
          console.error('Failed to parse WebSocket JSON payload:', err);
        }
      };

      this.ws.onerror = () => {
        this.setStatus('ERROR');
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.setStatus('DISCONNECTED');
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('WebSocket connection instantiation error:', err);
      this.setStatus('ERROR');
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('DISCONNECTED');
  }

  public subscribe(handler: WsMessageHandler): () => void {
    this.messageListeners.add(handler);
    return () => {
      this.messageListeners.delete(handler);
    };
  }

  public onStatusChange(handler: WsStatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  public getStatus(): WsConnectionStatus {
    return this.status;
  }

  public getLastMessageAge(): number {
    return this.lastMessageTime ? Date.now() - this.lastMessageTime : Infinity;
  }

  private setStatus(newStatus: WsConnectionStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => {
      try {
        fn(newStatus);
      } catch (err) {
        console.error('Error in status handler:', err);
      }
    });
  }
}

export const wsClient = new WebSocketClient();
