import { Coordinate } from './route';

export type StopStatus = 'completed' | 'current' | 'upcoming';

export interface RouteStop {
  id: string;
  name: string;
  coordinate: Coordinate;
  sequence: number;
  estimatedTime?: string;
  platform?: string;
  status?: StopStatus;
  etaMinutes?: number;
  isBoarding?: boolean;
}
