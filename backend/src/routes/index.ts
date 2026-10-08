import { Router } from 'express';
import authPassengerRoutes from './authPassengerRoutes.js';
import authStaffRoutes from './authStaffRoutes.js';
import tripRoutes from './tripRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import operatorRoutes from './operatorRoutes.js';
import routeRoutes from './routeRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import terminalRoutes from './terminalRoutes.js';
import placesRoutes from './placesRoutes.js';
import passengerRoutes from './passengerRoutes.js';
import driverRoutes from './driverRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth/passenger', authPassengerRoutes);
apiRouter.use('/auth/staff', authStaffRoutes);
apiRouter.use('/passengers', passengerRoutes);
apiRouter.use('/drivers', driverRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/operator', operatorRoutes);
apiRouter.use('/routes', routeRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/terminal', terminalRoutes);
apiRouter.use('/', placesRoutes);

import { getMongooseConnectionState } from '../db/mongoConnect.js';

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'TransitPulse Central API',
    uptime: process.uptime(),
    database: getMongooseConnectionState(),
    timestamp: new Date().toISOString(),
    version: '4.8.2-ops',
  });
});

export default apiRouter;
