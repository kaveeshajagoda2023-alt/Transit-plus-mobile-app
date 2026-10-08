import { TransitLocation } from './location';
import { VehicleType, OccupancyLevel } from './vehicle';

export type DepartureOption = 'leave-now' | 'depart-at' | 'arrive-by';
export type TransportModeOption = 'both' | 'bus' | 'train';
export type RouteSortOption = 'fastest' | 'earliest' | 'lowest-fare';

export interface RouteLeg {
  id: string;
  type: 'bus' | 'train' | 'walk';
  label: string; // e.g. "Bus 42", "Line Red", "4 min"
  badgeBg?: string;
  durationMinutes?: number;
}

export interface RouteSearchResult {
  id: string;
  routeNumber: string;
  serviceType: VehicleType;
  serviceName: string;
  originName: string;
  destinationName: string;
  departureTime: string; // e.g. "10:14 AM"
  arrivalTime: string; // e.g. "10:38 AM"
  durationMinutes: number; // e.g. 24
  etaMinutes: number; // dynamically decrements in live simulation
  fare: number; // e.g. 550.00
  fareFormatted: string; // e.g. "RS 550.00"
  condition: 'on-time' | 'delayed';
  delayMinutes?: number; // e.g. 3 -> "Delayed (+3 min)"
  transfers: number; // 0 or 1+
  isDirect: boolean;
  isFastest?: boolean;
  tagLabel: string; // e.g. "Fastest Route • 24 min", "Direct Bus • 31 min"
  tagType: 'fastest' | 'direct' | 'standard';
  walkingMeters: number; // e.g. 320
  walkingMinutes?: number; // e.g. 4
  occupancy: OccupancyLevel; // 'low' | 'medium' | 'high'
  legs: RouteLeg[];
  directSummary?: string; // e.g. "Direct • No transfers"
  platform?: string;
  track?: string;
}

export interface RouteSearchCriteria {
  originId?: string;
  originName?: string;
  destinationId?: string;
  destinationName?: string;
  transportMode?: TransportModeOption;
  departureOption?: DepartureOption;
  departureTime?: string;
  sortBy?: RouteSortOption;
}

export interface JourneySearchState {
  origin: TransitLocation | null;
  destination: TransitLocation | null;
  destinationText: string;
  departureOption: DepartureOption;
  departureTime: string;
  transportMode: TransportModeOption;
  validationError: string | null;
}
