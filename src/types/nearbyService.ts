import { OccupancyLevel, ServiceStatus, VehicleType } from './vehicle';

export interface NearbyService {
  id: string;
  vehicleId?: string;
  routeId?: string;
  routeNumber: string;
  serviceType: VehicleType;
  serviceName: string;
  destination: string;
  distance: number; // in meters (e.g. 250, 550)
  eta: number; // in minutes
  platform?: string;
  track?: string;
  direction?: string;
  occupancy: OccupancyLevel;
  status: ServiceStatus;
  isStarred?: boolean;
}
