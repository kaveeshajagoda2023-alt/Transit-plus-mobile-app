import {
  OperatorProfileData,
  OperatorCertification,
  HardwareDiagnostics,
  MaintenanceFaultReport,
  ShiftSummaryReport,
} from '@/types/staff';
import { tripDatabase } from './tripDatabase';

class OperatorDatabase {
  private profile: OperatorProfileData;
  private faults: MaintenanceFaultReport[] = [];
  private lastShiftSummary: ShiftSummaryReport | null = null;
  private listeners: Set<(profile: OperatorProfileData) => void> = new Set();

  constructor() {
    const now = Date.now();
    // 5h 12m elapsed = 312 minutes ago
    const shiftStartEpoch = now - 312 * 60000;
    // Total shift is 05:00 AM to 02:30 PM (9h 30m = 570 mins)
    const shiftEndEpoch = shiftStartEpoch + 570 * 60000;

    const initialCertifications: OperatorCertification[] = [
      {
        id: 'cert-cdl',
        name: 'CDL Class B w/ Air Brakes',
        category: 'LICENSE',
        detail: 'Commercial License - Valid until Oct 2028',
        validUntil: 'Oct 2028',
        status: 'VERIFIED',
      },
      {
        id: 'cert-opt',
        name: 'Optical Validator Auth',
        category: 'SECURITY',
        detail: 'FIPS-140 Level 2 Key Token - Active',
        validUntil: 'Active',
        status: 'ACTIVE',
      },
      {
        id: 'cert-cpr',
        name: 'Emergency First Aid & CPR',
        category: 'SAFETY',
        detail: 'MTA Public Safety Certified - Re-cert 2025',
        validUntil: '2025',
        status: 'VALID',
      },
    ];

    const initialDiagnostics: HardwareDiagnostics = {
      airGapCachedTokens: 3240,
      airGapStatus: 'Synced',
      scannerName: 'POS-Scanner-99',
      scannerConnected: true,
      scannerBeepHaptics: true,
      brightnessBoost: true,
    };

    this.profile = {
      staffId: 'DRV-84920',
      name: 'Kavithusan',
      role: 'Senior Conductor / Operator',
      depot: 'Div 4 Depot',
      rating: 4.95,
      ratingNote: 'Safe Driver Commendation',
      tier: 'Tier 1 Safe',
      dutyStatus: 'ON DUTY',
      activeRoute: 'Line 42',
      routeDescription: 'Eastbound Express',
      assignedFleet: 'Bus #4028',
      fleetType: 'Electric Hybrid',
      shiftWindow: '05:00 AM – 02:30 PM Shift',
      shiftStartEpoch,
      shiftEndEpoch,
      terminalStart: '06:00 AM',
      estEodDepot: '02:00 PM',
      todaysBoardings: 438,
      boardingsTrendPct: 14.2,
      cashlessBoardingPct: 94.2,
      scansCompleted: 392,
      validPassesPct: 100.0,
      onTimeDeparturePct: 98.5,
      punctualityStatus: 'Tier-1 Punctuality',
      feedStatus: 'Live US07 Feed',
      certifications: initialCertifications,
      diagnostics: initialDiagnostics,
    };

    // Wire real-time integration with tripDatabase
    tripDatabase.subscribe((trip) => {
      // Real-time synchronization of boardings and scan counts
      this.profile.todaysBoardings = 438 + (trip.occupiedSeats - 42);
      this.profile.scansCompleted = 392 + (trip.digitalQrCount - 36);
      const totalRecorded = this.profile.todaysBoardings;
      const digital = this.profile.scansCompleted;
      this.profile.cashlessBoardingPct = Number(((digital / Math.max(1, totalRecorded)) * 100).toFixed(1));
      this.notifyListeners();
    });
  }

  public getProfile(): OperatorProfileData {
    return {
      ...this.profile,
      certifications: [...this.profile.certifications],
      diagnostics: { ...this.profile.diagnostics },
    };
  }

  public updateDutyStatus(status: 'ON DUTY' | 'OFF DUTY' | 'ON BREAK'): OperatorProfileData {
    this.profile.dutyStatus = status;
    this.notifyListeners();
    return this.getProfile();
  }

  public switchVehicle(busNumber: string, fleetType: string = 'Electric Hybrid'): OperatorProfileData {
    this.profile.assignedFleet = busNumber;
    this.profile.fleetType = fleetType;
    this.notifyListeners();
    return this.getProfile();
  }

  public toggleScannerBeep(enabled?: boolean): boolean {
    const nextVal = enabled !== undefined ? enabled : !this.profile.diagnostics.scannerBeepHaptics;
    this.profile.diagnostics.scannerBeepHaptics = nextVal;
    this.notifyListeners();
    return nextVal;
  }

  public toggleBrightnessBoost(enabled?: boolean): boolean {
    const nextVal = enabled !== undefined ? enabled : !this.profile.diagnostics.brightnessBoost;
    this.profile.diagnostics.brightnessBoost = nextVal;
    this.notifyListeners();
    return nextVal;
  }

  public async reconnectScanner(): Promise<{ connected: boolean; device: string }> {
    this.profile.diagnostics.scannerConnected = false;
    this.notifyListeners();

    await new Promise((resolve) => setTimeout(resolve, 400));
    this.profile.diagnostics.scannerConnected = true;
    this.profile.diagnostics.scannerName = 'POS-Scanner-99';
    this.notifyListeners();

    return { connected: true, device: this.profile.diagnostics.scannerName };
  }

  public async syncAirGapCache(): Promise<{ synced: boolean; tokenCount: number }> {
    this.profile.diagnostics.airGapStatus = 'Syncing';
    this.notifyListeners();

    await new Promise((resolve) => setTimeout(resolve, 350));
    this.profile.diagnostics.airGapCachedTokens += 24;
    this.profile.diagnostics.airGapStatus = 'Synced';
    this.notifyListeners();

    return { synced: true, tokenCount: this.profile.diagnostics.airGapCachedTokens };
  }

  public async reportVehicleFault(payload: {
    category: MaintenanceFaultReport['category'];
    severity: MaintenanceFaultReport['severity'];
    description: string;
    busNumber?: string;
    routeNumber?: string;
  }): Promise<MaintenanceFaultReport> {
    const now = Date.now();
    const newReport: MaintenanceFaultReport = {
      id: `MNT-${now.toString().slice(-6)}`,
      busNumber: payload.busNumber || this.profile.assignedFleet,
      routeNumber: payload.routeNumber || this.profile.activeRoute,
      category: payload.category,
      severity: payload.severity,
      description: payload.description,
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUBMITTED',
    };

    this.faults.unshift(newReport);
    return newReport;
  }

  public getFaultReports(): MaintenanceFaultReport[] {
    return [...this.faults];
  }

  public async clockOutShift(): Promise<ShiftSummaryReport> {
    const now = Date.now();
    const elapsedMins = Math.floor((now - this.profile.shiftStartEpoch) / 60000);
    const hours = Math.floor(elapsedMins / 60);
    const mins = elapsedMins % 60;
    const durationStr = `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;

    const summary: ShiftSummaryReport = {
      shiftId: `SHF-${now.toString().slice(-6)}`,
      operatorName: this.profile.name,
      staffId: this.profile.staffId,
      busNumber: this.profile.assignedFleet,
      route: `${this.profile.activeRoute} (${this.profile.routeDescription})`,
      boardingsTotal: this.profile.todaysBoardings,
      scansCompleted: this.profile.scansCompleted,
      cashlessPct: this.profile.cashlessBoardingPct,
      onTimePunctuality: this.profile.onTimeDeparturePct,
      shiftDuration: durationStr,
      clockOutTimestamp: new Date().toISOString(),
      faultsReportedCount: this.faults.length,
    };

    this.lastShiftSummary = summary;
    this.profile.dutyStatus = 'OFF DUTY';
    this.notifyListeners();

    return summary;
  }

  public getLastShiftSummary(): ShiftSummaryReport | null {
    return this.lastShiftSummary;
  }

  public subscribe(listener: (profile: OperatorProfileData) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const copy = this.getProfile();
    for (const fn of this.listeners) {
      fn(copy);
    }
  }
}

export const operatorDatabase = new OperatorDatabase();
