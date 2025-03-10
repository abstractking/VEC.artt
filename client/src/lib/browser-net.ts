/**
 * Browser-compatible network adapter for VeChain Connex
 * This implementation uses native fetch instead of Node's http.Agent
 */

import { Net } from '@vechain/connex-driver';
import { EventEmitter } from 'events';

export class BrowserNet implements Net {
  public readonly baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public async http(method: string, path: string, body?: any): Promise<{
    status: number;
    headers: Record<string, string>;
    data: any;
  }> {
    try {
      const url = `${this.baseURL}${path}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };
    } catch (error) {
      console.error('Browser net error:', error);
      throw error;
    }
  }

  public openWebSocketReader(path: string): EventEmitter {
    const emitter = new EventEmitter();
    let ws: WebSocket | null = null;
    let isClosing = false;

    const connect = () => {
      if (isClosing) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = new URL(this.baseURL);
      ws = new WebSocket(`${protocol}//${wsUrl.host}${path}`);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          emitter.emit('data', msg);
        } catch (err) {
          emitter.emit('error', new Error('Invalid WebSocket message'));
        }
      };

      ws.onerror = () => {
        emitter.emit('error', new Error('WebSocket error'));
      };

      ws.onclose = () => {
        if (!isClosing) {
          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        }
        emitter.emit('close');
      };
    };

    // Start connection
    connect();

    // Override close method to prevent reconnection attempts
    const originalClose = emitter.close;
    emitter.close = () => {
      isClosing = true;
      if (ws) {
        ws.close();
      }
      if (originalClose) {
        originalClose.call(emitter);
      }
    };

    return emitter;
  }
}