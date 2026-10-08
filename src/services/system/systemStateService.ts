import { TelemetryData } from '@/types/systemState';

/**
 * System State Service
 * Provides mock asynchronous services for state testing and telemetry simulation.
 * Ready for Node.js + Express backend endpoints:
 * GET /api/system/status
 * GET /api/system/telemetry
 */
export const systemStateService = {
  async getTelemetryData(): Promise<TelemetryData> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return {
      gpsStatus: 'locked',
      connectionStatus: 'online',
      satellitesCount: 9,
      latencyMs: 12,
      lastUpdated: new Date().toISOString(),
      vehicleSpeedKmh: 28,
      headingDegrees: 140,
    };
  },

  async simulateSearchQuery(): Promise<{ found: number }> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { found: 18 };
  },

  async retryOperation(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return true;
  },
};
