import { INITIAL_MOCK_VEHICLES } from '../mock/vehicleData';
import { INITIAL_NEARBY_SERVICES } from '../mock/nearbyServices';
import { Vehicle, TransportFilterType } from '@/types/vehicle';
import { NearbyService } from '@/types/nearbyService';

/**
 * Service API layer for Vehicle tracking and Nearby Services.
 * Ready for Node.js + Express endpoints:
 * GET /api/vehicles
 * GET /api/vehicles/:id
 * GET /api/vehicles/:id/location
 * GET /api/services/nearby
 */
export const vehicleApi = {
  async getVehicles(filter?: TransportFilterType): Promise<Vehicle[]> {
    // Simulate lightweight network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 50));
    let list = [...INITIAL_MOCK_VEHICLES];

    if (filter === 'bus') {
      list = list.filter((v) => v.type === 'bus');
    } else if (filter === 'train') {
      list = list.filter((v) => v.type === 'train');
    } else if (filter === 'starred') {
      list = list.filter((v) => v.isStarred);
    }
    return list;
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return INITIAL_MOCK_VEHICLES.find((v) => v.id === id) || null;
  },

  async getNearbyServices(filter?: TransportFilterType): Promise<NearbyService[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    let list = [...INITIAL_NEARBY_SERVICES];

    if (filter === 'bus') {
      list = list.filter((s) => s.serviceType === 'bus');
    } else if (filter === 'train') {
      list = list.filter((s) => s.serviceType === 'train');
    } else if (filter === 'starred') {
      list = list.filter((s) => s.isStarred);
    }
    return list;
  },
};
