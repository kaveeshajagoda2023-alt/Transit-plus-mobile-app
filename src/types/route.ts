import { VehicleType, OccupancyLevel } from './vehicle';
import { RouteStop } from './stop';

export { RouteStop, StopStatus } from './stop';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface TransitRoute {
  id: string;
  routeNumber: string;
  name: string;
  type: VehicleType;
  color: string;
  linePattern?: 'solid' | 'dashed';
  coordinates: Coordinate[];
  stops: RouteStop[];
  isStarred?: boolean;
}

export interface ServiceAlert {
  id: string;
  type: 'traffic' | 'delay' | 'service';
  message: string;
  delayMinutes?: number;
  severity: 'info' | 'warning' | 'critical';
  location?: string;
}

export interface BoardingStopInfo {
  id: string;
  name: string;
  coordinate: Coordinate;
  platform?: string;
  scheduledArrival?: string;
}

export interface RouteDetails {
  id: string;
  routeNumber: string;
  serviceType: VehicleType;
  serviceName: string;
  destination: string;
  origin: string;
  via?: string;
  vehicleId: string;
  vehicleNumber: string;
  speedKmh: number;
  vehicleLocation: Coordinate;
  boardingStop: BoardingStopInfo;
  stopsAway: number;
  distanceKm: number;
  etaMinutes: number;
  liveStatus: 'LIVE' | 'UPDATING' | 'OFFLINE';
  occupancyLevel: OccupancyLevel;
  occupancyPercentage: number;
  alert?: ServiceAlert | null;
  stops: RouteStop[];
  coordinates: Coordinate[];
  fareFormatted?: string;
  isBookmarked?: boolean;
  frequency?: string;
}

export interface SavedRouteRecord {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  type: VehicleType;
  etaMinutes: number;
  savedAt: string;
  passengerId?: string;
  isStarred?: boolean;
}
