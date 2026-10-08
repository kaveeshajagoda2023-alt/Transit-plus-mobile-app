export type SystemStateType = 'loading' | 'empty' | 'error' | 'telemetry';

export type StateFilter = 'all' | 'loading' | 'empty' | 'error';

export type SystemStatusType =
  | 'active-query'
  | 'gps-lock'
  | 'loading'
  | 'ready'
  | 'error'
  | 'offline'
  | 'gps-lost'
  | 'empty';

export interface TelemetryData {
  gpsStatus: 'locked' | 'searching' | 'lost';
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  satellitesCount: number;
  latencyMs: number;
  lastUpdated: string;
  vehicleSpeedKmh?: number;
  headingDegrees?: number;
}

export interface SystemStateModel {
  id: string;
  type: SystemStateType;
  stateNumber: string; // e.g. "STATE 01"
  stateLabel: string;  // e.g. "LOADING"
  statusBadgeLabel: string;
  statusBadgeType: SystemStatusType;
  title: string;
  description?: string;
}
