export type TripStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOT_STARTED';

export type ScheduleStatus = 'ON_TIME' | 'EARLY' | 'DELAYED';

export type DoorStatus = 'OPEN' | 'CLOSED';

export type CapacityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL';

export type TicketType =
  | 'STANDARD_SINGLE'
  | 'CONCESSION_PASS'
  | 'DAY_PASS'
  | 'MONTHLY_PASS';

export type TicketValidationResult = 'PASS' | 'REJECT' | 'PENDING';

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
  faultCode?: string;
  failureDiagnostics?: string;
  operationalMandate?: string;
  deviceScannerId?: string;
  verificationService?: string;
  previousScanTime?: string;
  previousScannerId?: string;
}

