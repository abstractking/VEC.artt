/**
 * Browser-compatible network adapter for VeChain Connex
 * This implementation uses native fetch instead of Node's http.Agent
 */

import { Net } from '@vechain/connex-driver';
import { EventEmitter } from 'events';

// Interface required by Connex driver
interface WebSocketReader {
  read(): Promise<any>;
  close(): void;
}

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

  public openWebSocketReader(path: string): WebSocketReader {
    let ws: WebSocket | null = null;
    let isClosing = false;
    let messageQueue: any[] = [];
    let resolveRead: ((value: any) => void) | null = null;

    const reader: WebSocketReader = {
      read: () => {
        return new Promise((resolve) => {
          if (messageQueue.length > 0) {
            resolve(messageQueue.shift());
          } else {
            resolveRead = resolve;
          }
        });
      },
      close: () => {
        isClosing = true;
        if (ws) {
          ws.close();
        }
      }
    };

    const connect = () => {
      if (isClosing) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = new URL(this.baseURL);
      ws = new WebSocket(`${protocol}//${wsUrl.host}${path}`);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (resolveRead) {
            resolveRead(msg);
            resolveRead = null;
          } else {
            messageQueue.push(msg);
          }
        } catch (err) {
          console.error('Invalid WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        console.error('WebSocket error');
      };

      ws.onclose = () => {
        if (!isClosing) {
          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        }
      };
    };

    // Start connection
    connect();

    return reader;
  }
}