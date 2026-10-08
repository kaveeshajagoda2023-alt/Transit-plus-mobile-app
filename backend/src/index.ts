import http from 'http';
import { createServer } from './server.js';
import { wsServer } from './websocket/wsServer.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { connectMongoDB } from './db/mongoConnect.js';

const app = createServer();
const server = http.createServer(app);

// Mount WebSocket server
wsServer.initialize(server);

// Connect to MongoDB Atlas (if configured)
connectMongoDB().catch(() => {});

server.listen(config.port, () => {
  logger.success(`TransitPulse Backend Server running at http://localhost:${config.port}`);
  logger.info(`WebSocket Gateway available at ws://localhost:${config.port}/ws`);
  logger.info(`Environment: ${config.nodeEnv} | Transit Zone: ${config.dispatchZone}`);
  logger.info(`Interactive API Dashboard: http://localhost:${config.port}`);
});

export { app, server };
