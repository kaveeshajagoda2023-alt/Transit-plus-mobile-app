export type VehicleType = 'bus' | 'train';

export type OccupancyLevel = 'low' | 'medium' | 'high' | 'full';

export type ServiceStatus = 'arriving' | 'on-time' | 'delayed' | 'offline';

export type TrackingStatus = 'LIVE' | 'UPDATING' | 'SIGNAL LOST' | 'OFFLINE' | 'STOPPED';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  routeNumber: string;
  routeName?: string;
  type: VehicleType;
  latitude: number;
  longitude: number;
  destination: string;
  eta: number; // in minutes
  currentStop: string;
  nextStop: string;
  occupancy: OccupancyLevel;
  status: ServiceStatus;
  isStarred?: boolean;
  speed?: number; // km/h
  heading?: number; // degrees
  platform?: string;
  track?: string;
  direction?: string; // e.g. "Eastbound"
  vehicleSpec?: string; // e.g. "Hybrid Electric"
  freeSeats?: number; // e.g. 32
  targetStopName?: string; // e.g. "Market St & 4th"
  targetStopDistanceMeters?: number; // e.g. 180
  delayMinutes?: number; // e.g. 2
  stopsAway?: number; // e.g. 3
  updatedAt?: string;
}

export type TransportFilterType = 'all' | 'bus' | 'train' | 'starred';

export interface TrackingTimelineStop {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  label: string; // e.g. "Departed", "Your Stop (6m)", "Terminal"
  isTargetStop?: boolean;
  etaMinutes?: number;
}
