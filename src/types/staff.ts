export type StaffRole =
  | 'DRIVER'
  | 'CONDUCTOR'
  | 'DISPATCHER'
  | 'ADMIN'
  | 'PASSENGER';

export type StaffAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'OFF_DUTY';

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
}

export interface StaffSession {
  token: string;
  user: StaffUser;
  expiresAt: string;
  terminalId: string;
  loginTime: string;
  authMethod: 'CREDENTIALS' | 'NFC';
}

export type TerminalConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'OFFLINE';

export interface TerminalStatus {
  terminalId: string;
  vehicleId: string;
  vehicleNumber: string;
  transitAuthority: string;
  dispatchZone: string;
  terminalState: 'READY' | 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  version: string;
  connectionStatus: TerminalConnectionStatus;
  gpsLock: boolean;
  pingMs: number;
  lastHeartbeat: string;
}

export type StaffAuthTab = 'normal' | 'error' | 'authenticating';

export interface StaffLoginCredentials {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface StaffAuthResponse {
  success: boolean;
  user?: StaffUser;
  accessToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
  session?: StaffSession;
}

export interface NfcAuthResponse {
  success: boolean;
  user?: StaffUser;
  accessToken?: string;
  badgeId?: string;
  error?: string;
  session?: StaffSession;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  recoveryPin?: string;
  contactDispatch?: string;
  error?: string;
}

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

