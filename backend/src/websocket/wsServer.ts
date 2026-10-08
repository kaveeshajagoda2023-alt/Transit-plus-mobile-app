import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger.js';
import { db } from '../db/database.js';
import { WebSocketMessage } from '../types/index.js';

export class TransitPulseWsServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.clients.add(ws);
      const ip = req.socket.remoteAddress;
      logger.ws(`Client connected from ${ip} (Total clients: ${this.clients.size})`);

      // Send initial connection greeting with current active trip summary
      const initialPayload: WebSocketMessage = {
        type: 'SYSTEM_HEARTBEAT',
        payload: {
          status: 'CONNECTED',
          serverTime: new Date().toISOString(),
          activeTripId: db.getActiveTrip().id,
          totalClients: this.clients.size,
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(initialPayload));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(
              JSON.stringify({
                type: 'PONG',
                payload: { timestamp: new Date().toISOString() },
                timestamp: new Date().toISOString(),
              })
            );
          }
        } catch {
          // Ignore invalid message framing
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.ws(`Client disconnected (Remaining: ${this.clients.size})`);
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket client error: ${err.message}`);
        this.clients.delete(ws);
      });
    });

    // Subscribe to DB events and broadcast
    db.on('db_event', (event: WebSocketMessage) => {
      this.broadcast(event);
    });

    logger.success('WebSocket server initialized on path /ws');
  }

  public broadcast(message: WebSocketMessage): void {
    const serialized = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const wsServer = new TransitPulseWsServer();
