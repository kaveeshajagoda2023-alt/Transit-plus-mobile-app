// Common & User Types
export type PortalRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';
export type StaffRole = 'DRIVER' | 'CONDUCTOR' | 'DISPATCHER' | 'ADMIN' | 'PASSENGER';
export type ConcessionType = 'STANDARD_ADULT' | 'STUDENT_YOUTH' | 'SENIOR_CONCESSION';
export type StaffAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'OFF_DUTY';

export interface PassengerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'PASSENGER';
  concessionType: ConcessionType;
  metroPayBalance: number;
  digitalTicketsCount: number;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  savedRoutesCount?: number;
  avatarUrl?: string;
  passwordHash?: string;
  otpCode?: string;
  resetToken?: string;
}

export interface StaffUser {
  id: string;
  staffId: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffAccountStatus;
  terminalAccess: boolean;
  vehicleAccess: string[];
  assignedVehicle: string;
  nfcBadgeId?: string;
  dispatchZone: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  badgeLabel?: string;
  shiftHours?: string;
  passwordHash?: string;
  pinHash?: string;
  failedAttempts?: number;
  lockedUntil?: number;
}

// Trip & Operational Types
export type TripStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOT_STARTED';

export type ScheduleStatus = 'ON_TIME' | 'EARLY' | 'DELAYED';
export type DoorStatus = 'OPEN' | 'CLOSED';
export type TicketValidationResult = 'PASS' | 'REJECT' | 'PENDING';

export interface DelayReportPayload {
  reason: 'Traffic' | 'Vehicle issue' | 'Passenger issue' | 'Weather' | 'Road closure' | 'Other';
  estimatedDelayMinutes: number;
  notes?: string;
}

export interface DispatchAlertPayload {
  type: 'ASSISTANCE' | 'EMERGENCY' | 'OVERCROWDED' | 'MECHANICAL' | 'GENERAL';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TicketActivityItem {
  id: string;
  ticketId: string;
  ticketTypeLabel: string;
  eventText: string;
  result: TicketValidationResult;
  timestamp: number;
  fareAmount: number;
  method: 'QR' | 'NFC' | 'CASH';
  passengerName?: string;
  reason?: string;
}

export interface TripStopInfo {
  id: string;
  name: string;
  distanceMeters: number;
  etaMinutes: number;
  scheduledTime: string;
  isCompleted: boolean;
}

export interface TripData {
  id: string;
  busNumber: string;
  driverName: string;
  conductorName?: string;
  routeNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  zone: string;
  tripStatus: TripStatus;
  scheduleStatus: ScheduleStatus;
  currentStop: string;
  doorStatus: DoorStatus;
  nextStop: string;
  etaMinutes: number;
  occupiedSeats: number;
  totalSeats: number;
  digitalQrCount: number;
  cashFareCount: number;
  pendingFailCount: number;
  shiftDigitalFareTotal: number;
  recentActivity: TicketActivityItem[];
  stops: TripStopInfo[];
  startedAt: string;
  completedAt?: string;
  delayMinutes?: number;
  delayReason?: string;
}

export interface PassengerManifestItem {
  id: string;
  ticketId: string;
  passengerName: string;
  type: string;
  boardedAtStop: string;
  boardedAtTime: string;
  fare: number;
  status: 'ONBOARD' | 'ALIGHTED' | 'REJECTED';
  method?: 'NFC' | 'QR' | 'CASH' | 'MANUAL';
  category?: 'DIGITAL' | 'CASH' | 'FAILED';
  destination?: string;
  validationStatus?: 'VALID' | 'EXPIRED' | 'REJECTED' | 'ALREADY_USED';
  fareLabel?: string;
  badgeLabel?: string;
  badgeSubLabel?: string;
  rejectionReason?: string;
}

export interface InternalTicketRecord {
  ticketId: string;
  type: string;
  routeId: string;
  tripId: string;
  fareAmount: number;
  status: 'VALID' | 'USED' | 'EXPIRED' | 'INVALID_ROUTE';
  passengerName: string;
  expiresAt: number;
  usedAt?: number;
  bookingReference?: string;
  originStop?: string;
  destinationStop?: string;
  originZone?: string;
  destinationZone?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'REFUNDED';
  paymentMethod?: string;
  transactionId?: string;
  passengerCount?: number;
  nfcUid?: string;
}

export interface ScanValidationResponse {
  valid: boolean;
  result: TicketValidationResult;
  reason?: string;
  ticketId: string;
  ticketTypeLabel: string;
  fareAmount: number;
  passengerName?: string;
  activityItem: TicketActivityItem;
  updatedTrip: TripData;
  bookingReference?: string;
  passengerCount?: number;
  originStop?: string;
  destinationStop?: string;
  originZone?: string;
  destinationZone?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'REFUNDED';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
}

// Operator & Diagnostics Types
export interface OperatorCertification {
  id: string;
  name: string;
  category: 'LICENSE' | 'SECURITY' | 'SAFETY';
  detail: string;
  validUntil: string;
  status: 'VALID' | 'ACTIVE' | 'VERIFIED' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface HardwareDiagnostics {
  airGapCachedTokens: number;
  airGapStatus: 'Synced' | 'Syncing' | 'Offline';
  scannerName: string;
  scannerConnected: boolean;
  scannerBeepHaptics: boolean;
  brightnessBoost: boolean;
}

export interface MaintenanceFaultReport {
  id: string;
  busNumber: string;
  routeNumber: string;
  category:
    | 'Brakes'
    | 'Engine / Powertrain'
    | 'Doors & Ramp'
    | 'HVAC / Climate'
    | 'Farebox / Scanner'
    | 'Tires / Suspension'
    | 'Electrical'
    | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  reportedAt: string;
  status: 'SUBMITTED' | 'DISPATCH_ACK' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface ShiftSummaryReport {
  shiftId: string;
  operatorName: string;
  staffId: string;
  busNumber: string;
  route: string;
  boardingsTotal: number;
  scansCompleted: number;
  cashlessPct: number;
  onTimePunctuality: number;
  shiftDuration: string;
  clockOutTimestamp: string;
  faultsReportedCount: number;
}

export interface OperatorProfileData {
  staffId: string;
  name: string;
  role: string;
  depot: string;
  rating: number;
  ratingNote: string;
  tier: string;
  dutyStatus: 'ON DUTY' | 'OFF DUTY' | 'ON BREAK';
  activeRoute: string;
  routeDescription: string;
  assignedFleet: string;
  fleetType: string;
  shiftWindow: string;
  shiftStartEpoch: number;
  shiftEndEpoch: number;
  terminalStart: string;
  estEodDepot: string;
  todaysBoardings: number;
  boardingsTrendPct: number;
  cashlessBoardingPct: number;
  scansCompleted: number;
  validPassesPct: number;
  onTimeDeparturePct: number;
  punctualityStatus: string;
  feedStatus: string;
  certifications: OperatorCertification[];
  diagnostics: HardwareDiagnostics;
}

// Transit Routes & Vehicles
export type VehicleType = 'bus' | 'train';
export type OccupancyLevel = 'low' | 'medium' | 'high' | 'full';
export type ServiceStatus = 'arriving' | 'on-time' | 'delayed' | 'offline';
export type TransportFilterType = 'all' | 'bus' | 'train' | 'starred';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  id: string;
  name: string;
  coordinate: Coordinate;
  sequence: number;
  estimatedTime?: string;
  platform?: string;
  status?: 'completed' | 'current' | 'upcoming';
  etaMinutes?: number;
  isBoarding?: boolean;
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

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  routeNumber: string;
  routeName?: string;
  type: VehicleType;
  latitude: number;
  longitude: number;
  destination: string;
  eta: number;
  currentStop: string;
  nextStop: string;
  occupancy: OccupancyLevel;
  status: ServiceStatus;
  isStarred?: boolean;
  speed?: number;
  heading?: number;
  platform?: string;
  track?: string;
  direction?: string;
  vehicleSpec?: string;
  freeSeats?: number;
  targetStopName?: string;
  targetStopDistanceMeters?: number;
  delayMinutes?: number;
  stopsAway?: number;
  updatedAt?: string;
}

export interface NearbyService {
  id: string;
  vehicleId?: string;
  routeId?: string;
  routeNumber: string;
  serviceType: VehicleType;
  serviceName: string;
  destination: string;
  distance: number;
  eta: number;
  platform?: string;
  track?: string;
  direction?: string;
  occupancy: OccupancyLevel;
  status: ServiceStatus;
  isStarred?: boolean;
}

export interface TerminalStatus {
  terminalId: string;
  vehicleId: string;
  vehicleNumber: string;
  transitAuthority: string;
  dispatchZone: string;
  terminalState: 'READY' | 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  version: string;
  connectionStatus: 'CONNECTED' | 'CONNECTING' | 'OFFLINE';
  gpsLock: boolean;
  pingMs: number;
  lastHeartbeat: string;
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'school' | 'station' | 'favorite';
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

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
  targetId?: string;
  type: 'route' | 'stop' | 'place';
}

// WebSocket Event Types
export type WebSocketEventType =
  | 'TRIP_UPDATE'
  | 'TICKET_SCANNED'
  | 'OCCUPANCY_CHANGED'
  | 'STOP_ADVANCED'
  | 'DOORS_TOGGLED'
  | 'DELAY_ALERT'
  | 'DISPATCH_ALERT'
  | 'MAINTENANCE_FAULT'
  | 'VEHICLE_TELEMETRY'
  | 'SYSTEM_HEARTBEAT';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}
