import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
let connectionAttempt = null;
export function connectMongoDB() {
    if (mongoose.connection.readyState === 1)
        return Promise.resolve(true);
    if (connectionAttempt)
        return connectionAttempt;
    connectionAttempt = establishMongoConnection().finally(() => {
        connectionAttempt = null;
    });
    return connectionAttempt;
}
async function establishMongoConnection() {
    const primaryUri = config.mongodbUri;
    // If an Atlas URI is configured, never silently write data to a local database.
    if (primaryUri) {
        try {
            const conn = await mongoose.connect(primaryUri, {
                dbName: config.mongodbDbName,
                serverSelectionTimeoutMS: 5000,
            });
            logger.success(`Connected to MongoDB: database "${conn.connection.name}" on ${conn.connection.host}`);
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn(`Configured MongoDB connection failed (${message}).`);
            return false;
        }
    }
    try {
        logger.info(`Attempting local MongoDB connection for database "${config.mongodbDbName}"...`);
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017', {
            dbName: config.mongodbDbName,
            serverSelectionTimeoutMS: 3000,
        });
        logger.success(`Connected to Local MongoDB: database "${localConn.connection.name}" on 127.0.0.1:27017`);
        return true;
    }
    catch {
        // Local MongoDB is optional when no primary URI is configured.
    }
    logger.warn('No active MongoDB connection established. Running with resilient in-memory database storage.');
    return false;
}
export function getMongooseConnectionState() {
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
export function getMongooseDatabaseName() {
    return mongoose.connection.readyState === 1 ? mongoose.connection.name : null;
}
