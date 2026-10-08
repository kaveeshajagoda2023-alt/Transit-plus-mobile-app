import { INITIAL_MOCK_VEHICLES } from '../mock/vehicleData';
import { Vehicle } from '@/types/vehicle';

/**
 * Vehicle Tracking Service Layer
 * API-ready architecture for Node.js + Express endpoints:
 * GET /api/vehicles/:id
 * GET /api/vehicles/:id/location
 * GET /api/vehicles/:id/eta
 */
export const vehicleTrackingService = {
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return (
      INITIAL_MOCK_VEHICLES.find((v) => v.id === vehicleId) ||
      INITIAL_MOCK_VEHICLES[0] ||
      null
    );
  },

  async getVehicleStatus(vehicleId: string) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const vehicle =
      INITIAL_MOCK_VEHICLES.find((v) => v.id === vehicleId) ||
      INITIAL_MOCK_VEHICLES[0];

    return {
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      speedKmh: vehicle.speed || 24,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      etaMinutes: vehicle.eta || 6,
      distanceKm: 1.4,
      stopsAway: 3,
      occupancy: vehicle.occupancy,
      status: vehicle.status,
      updatedAt: vehicle.updatedAt || new Date().toISOString(),
    };
  },
};
