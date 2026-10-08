import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'transitpulse_super_secret_jwt_key_2026_ops_dispatch_zone',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  transitAuthority: process.env.DEFAULT_TRANSIT_AUTHORITY || 'Metro Transit Authority (MTA)',
  dispatchZone: process.env.DEFAULT_DISPATCH_ZONE || 'DISPATCH ZONE 4',
  terminalId: process.env.DEFAULT_TERMINAL_ID || 'TERM-4028-V4',
  defaultBusNumber: process.env.DEFAULT_BUS_NUMBER || 'Bus #4028',
  defaultRouteNumber: process.env.DEFAULT_ROUTE_NUMBER || 'LINE 42',
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
};
