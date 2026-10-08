import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectMongoDB(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  const primaryUri = config.mongodbUri;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/transitpulse';

  // 1. Try Primary URI (if configured)
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      logger.success(`Connected to MongoDB: database "${conn.connection.name}" on ${conn.connection.host}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Primary MongoDB URI connection failed (${message}).`);
    }
  }

  // 2. Try Local MongoDB Fallback
  if (primaryUri !== localFallbackUri) {
    try {
      logger.info('Attempting connection to local MongoDB instance (mongodb://127.0.0.1:27017/transitpulse)...');
      const localConn = await mongoose.connect(localFallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      logger.success(`Connected to Local MongoDB: database "${localConn.connection.name}" on 127.0.0.1:27017`);
      return true;
    } catch {
      // Local not available
    }
  }

  logger.warn('No active MongoDB connection established. Running with resilient in-memory database storage.');
  return false;
}

export function getMongooseConnectionState(): string {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'DISCONNECTED';
    case 1:
      return 'CONNECTED';
    case 2:
      return 'CONNECTING';
    case 3:
      return 'DISCONNECTING';
    default:
      return 'UNKNOWN';
  }
}
